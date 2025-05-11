import { NextRequest, NextResponse } from 'next/server';
import { io as socketIO } from 'socket.io-client';

// This endpoint receives transcript data and broadcasts it to all clients
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const transcriptData = await request.json();
    
    console.log('Broadcasting transcript data:', transcriptData);
    
    // Add a unique ID if not present
    if (!transcriptData.id) {
      transcriptData.id = `broadcast-${Date.now()}`;
    }
    
    // Connect to the Socket.IO server
    const socket = socketIO(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    
    socket.on('connect', () => {
      console.log('Broadcast socket connected, emitting transcript');
      
      // Emit to all possible event types
      socket.emit('call:transcript_update', transcriptData);
      socket.emit('transcript_update', transcriptData);
      
      // Also join the call room and emit directly to it
      if (transcriptData.callId) {
        socket.emit('join_call_room', { 
          callId: transcriptData.callId,
          callSid: transcriptData.callSid
        });
      }
      
      // Disconnect after sending
      setTimeout(() => {
        console.log('Disconnecting broadcast socket');
        socket.disconnect();
      }, 1000);
    });
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting transcript:', error);
    return NextResponse.json({ error: 'Failed to broadcast transcript' }, { status: 500 });
  }
}