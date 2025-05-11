import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

// This route handles the initial WebSocket connection for Twilio Media Streams
export async function GET(request: NextRequest) {
  return new NextResponse('WebSocket endpoint for Twilio Media Streams', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// This route handles the WebSocket upgrade for Twilio Media Streams
export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to twilio-stream endpoint');
    
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const streamSid = formData.get('StreamSid') as string;
    const streamStatus = formData.get('StreamStatus') as string;
    
    console.log(`Stream event for call ${callSid}: ${streamStatus}, Stream SID: ${streamSid}`);

    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        callId: callSid,
      },
    });

    if (!call) {
      console.log(`Call not found for SID: ${callSid} - This is normal when using test endpoints`);
      return NextResponse.json({ 
        status: 'success', 
        message: 'Stream event received, but call not found in database',
        callSid: callSid,
        streamSid: streamSid,
        streamStatus: streamStatus
      });
    }

    // Create a transcript entry if it doesn't exist
    let transcript = await prisma.transcript.findUnique({
      where: { callId: call.id },
    });

    if (!transcript) {
      transcript = await prisma.transcript.create({
        data: {
          callId: call.id,
          content: JSON.stringify([
            {
              speaker: 'system',
              text: 'Call started - Silent monitoring mode',
              timestamp: new Date().toISOString(),
            },
          ]),
        },
      });
    }

    // Update the transcript with the stream status
    const existingContent = JSON.parse(transcript.content as string);
    const updatedContent = [
      ...existingContent,
      {
        speaker: 'system',
        text: `Stream ${streamStatus}`,
        timestamp: new Date().toISOString(),
      },
    ];

    await prisma.transcript.update({
      where: { id: transcript.id },
      data: {
        content: JSON.stringify(updatedContent),
      },
    });

    // Send the stream status to the WebSocket server
    if (global.socketClient) {
      global.socketClient.emit('call:stream_update', {
        callId: call.id,
        callSid: callSid,
        streamSid: streamSid,
        streamStatus: streamStatus,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Stream event processed successfully',
      callSid: callSid,
      streamSid: streamSid,
      streamStatus: streamStatus
    });
  } catch (error) {
    console.error('Error handling stream event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}