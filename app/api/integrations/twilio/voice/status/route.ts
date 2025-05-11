import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { io as socketIO } from 'socket.io-client';
import { queueAudioForProcessing } from '@/lib/services/audio-processor';

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

// This route handles call status updates from Twilio
// It's a webhook that Twilio calls when a call status changes
export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const duration = formData.get('CallDuration') as string;
    
    console.log(`Call status update: ${callSid}, status: ${callStatus}, duration: ${duration}`);

    // Map Twilio call status to our internal status
    let internalStatus: 'ACTIVE' | 'COMPLETED' | 'QUEUED';
    switch (callStatus.toLowerCase()) {
      case 'in-progress':
        internalStatus = 'ACTIVE';
        break;
      case 'completed':
      case 'busy':
      case 'no-answer':
      case 'canceled':
      case 'failed':
        internalStatus = 'COMPLETED';
        break;
      case 'queued':
      case 'ringing':
      default:
        internalStatus = 'QUEUED';
        break;
    }

    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        callId: callSid,
      },
    });

    if (!call) {
      console.log(`Call not found for SID: ${callSid} - This is normal when using test endpoints`);
      // Return a success response even if the call is not found
      // This prevents Twilio from retrying and generating errors
      return NextResponse.json({
        status: 'success',
        message: 'Status update received, but call not found in database',
        callSid: callSid,
        callStatus: callStatus
      });
    }

    // Update the call status in the database
    await prisma.call.update({
      where: {
        id: call.id,
      },
      data: {
        status: internalStatus,
        duration: duration ? parseInt(duration) : undefined,
        endTime: internalStatus === 'COMPLETED' ? new Date() : undefined,
      },
    });

    // Emit a socket event for the status update
    if (global.socketClient) {
      global.socketClient.emit('call:status_update', {
        callId: call.id,
        callSid: callSid,
        status: callStatus.toLowerCase(),
        duration: duration ? parseInt(duration) : 0,
      });
    }

    // If the call is completed, create a transcript summary
    if (internalStatus === 'COMPLETED') {
      // Find the transcript for this call
      const transcript = await prisma.transcript.findFirst({
        where: {
          callId: call.id,
        },
      });

      if (transcript) {
        // In a real application, you would generate a summary of the transcript
        // For this example, we'll just update the transcript with a simple summary
        await prisma.transcript.update({
          where: {
            id: transcript.id,
          },
          data: {
            summary: `Call completed after ${duration || 0} seconds.`,
          },
        });
      }

      // Emit a socket event for the call end
      if (global.socketClient) {
        global.socketClient.emit('call:ended', {
          callId: call.id,
          callSid: callSid,
          duration: duration ? parseInt(duration) : 0,
        });
        // Queue the audio for processing with AssemblyAI
        try {
          console.log(`Queuing completed call ${callSid} for audio processing`);
          await queueAudioForProcessing(callSid);
        } catch (processingError) {
          console.error('Error queuing audio for processing:', processingError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling call status update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}