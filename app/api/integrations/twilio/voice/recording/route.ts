import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { io as socketIO } from 'socket.io-client';
import { processRecording } from '@/lib/services/audio-processor';

// Declare global socket client
declare global {
  var socketClient: any;
}

// Get the Socket.IO client instance
if (!global.socketClient) {
  try {
    // In a production environment, you would use a shared instance
    // For this example, we'll create a simple connection to the Socket.IO server
    const socket = socketIO('https://6116-24-72-111-53.ngrok-free.app');
    
    // Store the socket for later use
    global.socketClient = socket;
  } catch (error) {
    console.error('Error connecting to Socket.IO server:', error);
  }
}

// This route handles recording callbacks from Twilio
export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    
    console.log(`🎙️ RECORDING RECEIVED: ${recordingSid} for call ${callSid}`);
    console.log(`🎙️ Recording details:`, {
      recordingSid,
      callSid,
      duration: recordingDuration,
      url: recordingUrl,
      formData: Object.fromEntries(formData.entries())
    });

    // Create a new TwiML response
    const twiml = new VoiceResponse();

    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        callId: callSid,
      },
    });

    if (!call) {
      console.error(`❌ CALL NOT FOUND FOR SID: ${callSid}`);
      console.error(`❌ Cannot process recording without a valid call record`);
      twiml.say('Thank you for your message. We will get back to you as soon as possible.');
      twiml.hangup();
      
      return new NextResponse(twiml.toString(), {
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    // Process the recording (download from Twilio and upload to S3)
    try {
      // Get the team ID
      const team = await prisma.team.findFirst({
        where: {
          id: call.teamId || undefined,
        },
      });

      if (!team) {
        console.error(`❌ TEAM NOT FOUND FOR CALL: ${callSid}`);
        console.error(`❌ Cannot process recording without a valid team`);
      } else {
        // Process the recording
        await processRecording(
          recordingSid,
          recordingUrl,
          call.id,
          team.id,
          team.companyId || undefined
        );
        
        console.log(`✅ RECORDING PROCESSED SUCCESSFULLY for call: ${callSid}`);
        console.log(`✅ Recording details:`, {
          recordingSid,
          callSid,
          callId: call.id,
          teamId: team.id,
          companyId: team.companyId || 'none'
        });
      }
    } catch (error) {
      console.error(`❌ ERROR PROCESSING RECORDING for call ${callSid}:`, error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error(`❌ Error message: ${error.message}`);
        console.error(`❌ Error stack: ${error.stack}`);
      }
      console.error(`❌ Error context:`, {
        recordingSid,
        callSid,
        callId: call.id,
        recordingUrl
      });
      // Continue even if processing fails - we'll still have the Twilio URL
    }

    // Check if there's a transcript for this call
    let transcript = await prisma.transcript.findFirst({
      where: {
        callId: call.id,
      },
    });

    // If no transcript exists, create one
    if (!transcript) {
      transcript = await prisma.transcript.create({
        data: {
          callId: call.id,
          content: JSON.stringify([
            {
              speaker: 'system',
              text: 'Voicemail recording received',
              timestamp: new Date().toISOString(),
            }
          ]),
        },
      });
    } else {
      // Update the existing transcript with the recording information
      const content = JSON.parse(transcript.content as string);
      content.push({
        speaker: 'system',
        text: `Voicemail recording received (${recordingDuration}s)`,
        timestamp: new Date().toISOString(),
      });

      await prisma.transcript.update({
        where: {
          id: transcript.id,
        },
        data: {
          content: JSON.stringify(content),
        },
      });
    }

    // Emit a socket event for the recording
    try {
      if (global.socketClient) {
        global.socketClient.emit('call:recording', {
          callId: call.id,
          callSid: callSid,
          recordingSid: recordingSid,
          recordingDuration: recordingDuration,
        });
        console.log(`📡 Emitted call:recording event for ${callSid}`);
      } else {
        console.warn(`⚠️ Socket client not available, could not emit call:recording event`);
      }
    } catch (socketError) {
      console.error(`❌ Error emitting socket event:`, socketError);
    }

    // Thank the caller and end the call
    twiml.say('Thank you for your message. We will get back to you as soon as possible.');
    twiml.hangup();

    // Return the TwiML response
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('❌ ERROR HANDLING RECORDING:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`❌ Error message: ${error.message}`);
      console.error(`❌ Error stack: ${error.stack}`);
    }
    
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