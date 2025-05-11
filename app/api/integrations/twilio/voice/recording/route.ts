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
    
    console.log(`Recording received: ${recordingSid} for call ${callSid}, duration: ${recordingDuration}s, URL: ${recordingUrl}`);

    // Create a new TwiML response
    const twiml = new VoiceResponse();

    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        callId: callSid,
      },
    });

    if (!call) {
      console.error(`Call not found for SID: ${callSid}`);
      twiml.say('Thank you for your message. We will get back to you as soon as possible.');
      twiml.hangup();
      
      return new NextResponse(twiml.toString(), {
        headers: {
          'Content-Type': 'text/xml',
        },
      });
    }

    // Update the call with the recording information
    await prisma.call.update({
      where: {
        id: call.id,
      },
      data: {
        // Store the recording URL and duration
        type: `Recording: ${recordingUrl}`,
      },
    });

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
    if (global.socketClient) {
      global.socketClient.emit('call:recording', {
        callId: call.id,
        callSid: callSid,
        recordingUrl: recordingUrl,
        recordingDuration: recordingDuration,
      });
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
    console.error('Error handling recording:', error);
    
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