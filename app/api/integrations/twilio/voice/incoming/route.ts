import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { io as socketIO } from 'socket.io-client';

// Declare global socket client
declare global {
  var socketClient: any;
}

// Get the Socket.IO client instance
if (!global.socketClient) {
  try {
    // In a production environment, you would use a shared instance
    // For this example, we'll create a simple connection to the Socket.IO server
    // Use the ngrok URL for the Socket.IO connection
    const socket = socketIO('https://6116-24-72-111-53.ngrok-free.app');
    
    // Store the socket for later use
    global.socketClient = socket;
  } catch (error) {
    console.error('Error connecting to Socket.IO server:', error);
  }
}

// This route handles incoming calls from Twilio
// It's a webhook that Twilio calls when a call comes in
export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const direction = formData.get('Direction') as string;
    
    // Define VIP phone numbers that should always be answered
    const vipPhoneNumbers = ['+13062092891']; // Add your phone number here
    const isVipCaller = vipPhoneNumbers.includes(from);
    
    console.log(`Incoming call: ${callSid} from ${from} to ${to}, direction: ${direction}, VIP: ${isVipCaller}`);

    // Create a new TwiML response
    const twiml = new VoiceResponse();

    // Find the team associated with this phone number
    const phoneNumber = to.replace(/\s+/g, ''); // Remove any spaces
    
    // Look up the integration by the phone number
    // In a real application, you would have a table mapping phone numbers to teams
    // For this example, we'll just get the first Twilio integration
    let integration;
    try {
      integration = await prisma.integration.findFirst({
        where: {
          name: 'Twilio',
          status: 'Connected',
        },
        include: {
          team: true,
        },
      });
    } catch (dbError) {
      console.error('Database error when finding integration:', dbError);
      // Continue with a null integration - we'll handle this below
    }

    if (!integration) {
      console.error('No Twilio integration found for incoming call');
      twiml.say('We are unable to process your call at this time. Please try again later.');
      twiml.hangup();
      
      return new NextResponse(twiml.toString(), {
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    // Get caller name from Twilio if available, or use a default
    const callerName = formData.get('CallerName') as string || 'Unknown Caller';

    // Create a new call record in the database
    let call: any;
    try {
      call = await prisma.call.create({
        data: {
          callId: callSid,
          status: 'ACTIVE',
          startTime: new Date(),
          callerPhone: from,
          callerName: callerName,
          teamId: integration?.teamId,
          aiAssisted: true,
        },
      });
      console.log(`Created call record with ID: ${call.id}`);
    } catch (dbError) {
      console.error('Database error when creating call record:', dbError);
      // Continue with a null call - we'll still provide a TwiML response
    }

    // Emit a socket event for the new call
    try {
      if (global.socketClient && call) {
        global.socketClient.emit('call:start', {
          id: call.id,
          callSid: callSid,
          status: 'in-progress',
          startTime: new Date(),
          duration: 0,
          caller: {
            name: callerName,
            number: from,
            avatar: '/placeholder.svg',
          },
          agent: {
            name: 'AI Assistant', // Default until assigned
            avatar: '/placeholder.svg',
          },
        });
        console.log('Emitted call:start event');
      }
    } catch (socketError) {
      console.error('Socket error when emitting call:start event:', socketError);
      // Continue even if socket emission fails
    }

    // Check if there are any available agents
    const availableAgents = await prisma.user.findMany({
      where: {
        teamId: integration.teamId,
        role: 'AGENT',
        // In a real application, you would check agent availability
      },
      take: 1, // Just get the first available agent for now
    });

    // For VIP callers, we'll always have an AI agent available
    if (call) {
      try {
        // Create a virtual AI agent for the call
        await prisma.call.update({
          where: { id: call.id },
          data: {
            // No agentId needed, we'll use a virtual agent
            aiAssisted: true
          },
        });

        // Emit a socket event for the AI agent assignment
        if (global.socketClient) {
          global.socketClient.emit('call:agent_assigned', {
            callId: call.id,
            agent: {
              id: 'ai-assistant',
              name: 'AI Assistant',
              avatar: '/placeholder.svg',
            },
          });
        }
      } catch (error) {
        console.error('Error updating call with agent:', error);
        // Continue even if update fails
      }

      // For VIP callers, we want to silently listen to the entire call
      if (isVipCaller) {
        // Add a short pause to keep the call open
        twiml.pause({ length: 1 });
        
        // Use gather with a very long timeout to keep listening
        const gather = twiml.gather({
          input: ['speech'] as any,
          action: 'https://6116-24-72-111-53.ngrok-free.app/api/integrations/twilio/voice/transcribe',
          speechTimeout: 'auto',
          speechModel: 'phone_call',
          enhanced: true,
          language: 'en-US',
          timeout: 3600 // 1 hour timeout
        });
        
        // No prompts - completely silent
      } else {
        // For regular callers
        twiml.say('Thank you for calling. An agent will be with you shortly.');
        
        // Enable real-time transcription
        const gather = twiml.gather({
          input: ['speech'] as any,
          action: 'https://6116-24-72-111-53.ngrok-free.app/api/integrations/twilio/voice/transcribe',
          speechTimeout: 'auto',
          speechModel: 'phone_call',
          enhanced: true,
          language: 'en-US',
        });
        
        gather.say('Please describe your issue, and our AI will assist you while connecting to an agent.');
        
        // Add a fallback if no speech is detected
        twiml.say('We didn\'t hear anything. Please call back when you\'re ready to speak with us.');
      }
    } else {
      // No agents available, create a queued call
      try {
        if (integration?.teamId) {
          await prisma.queuedCall.create({
            data: {
              callerPhone: from,
              callerName: callerName,
              priority: 'Medium',
              teamId: integration.teamId,
            },
          });
        }

        // Update the call status if call exists
        if (call && call.id) {
          await prisma.call.update({
            where: { id: call.id },
            data: { status: 'QUEUED' },
          });

          // Emit a socket event for the queued call
          if (global.socketClient) {
            global.socketClient.emit('call:queued', {
              callId: call.id,
              status: 'queued',
            });
          }
        }
      } catch (error) {
        console.error('Error handling queued call:', error);
        // Continue even if database operations fail
      }

      // Check if this is a VIP caller
      if (isVipCaller) {
        // For VIP callers, we want to silently listen to the entire call
        // Add a short pause to keep the call open
        twiml.pause({ length: 1 });
        
        // Use gather with a very long timeout to keep listening
        const gather = twiml.gather({
          input: ['speech'] as any,
          action: 'https://6116-24-72-111-53.ngrok-free.app/api/integrations/twilio/voice/transcribe',
          speechTimeout: 'auto',
          speechModel: 'phone_call',
          enhanced: true,
          language: 'en-US',
          timeout: 3600 // 1 hour timeout
        });
        
        // No prompts - completely silent
      } else {
        // For regular callers, offer to leave a voicemail
        twiml.say('All of our agents are currently busy. Please leave a message after the tone or stay on the line for the next available agent.');
      
        // Enable real-time transcription for the voicemail
        twiml.record({
          action: 'https://6116-24-72-111-53.ngrok-free.app/api/integrations/twilio/voice/recording',
          transcribe: true,
          transcribeCallback: 'https://6116-24-72-111-53.ngrok-free.app/api/integrations/twilio/voice/transcribe',
          maxLength: 120,
        });
      }
    }

    // Return the TwiML response
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error handling incoming call:', error);
    
    // Create a TwiML response for the error case
    const twiml = new VoiceResponse();
    twiml.say('We are experiencing technical difficulties. Please try again later.');
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}