import { NextRequest, NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { io as socketIO } from 'socket.io-client';
import { prisma } from '@/lib/prisma';

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

// This route handles fallback for when the primary handler fails
export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const errorCode = formData.get('ErrorCode') as string;
    
    console.log(`Fallback handler called for call: ${callSid}, error code: ${errorCode}`);

    // Create a new TwiML response
    const twiml = new VoiceResponse();

    // Log the error in our system
    try {
      // Find the call in our database
      const call = await prisma.call.findFirst({
        where: {
          callId: callSid,
        },
      });

      if (call) {
        // Update the call with the error information
        await prisma.call.update({
          where: {
            id: call.id,
          },
          data: {
            type: `Error: ${errorCode}`,
          },
        });

        // Emit a socket event for the error
        if (global.socketClient) {
          global.socketClient.emit('call:error', {
            callId: call.id,
            callSid: callSid,
            errorCode: errorCode,
          });
        }
      }
    } catch (dbError) {
      console.error('Error updating call record:', dbError);
    }

    // Provide a fallback experience
    twiml.say('We apologize, but we are experiencing technical difficulties. Please try your call again later.');
    twiml.hangup();

    // Return the TwiML response
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in fallback handler:', error);
    
    // Create a simple TwiML response for the error case
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