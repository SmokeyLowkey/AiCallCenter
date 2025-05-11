const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with the HTTP server
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Set up WebSocket event handlers
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle incoming call events
    socket.on('call:start', (callData) => {
      console.log('Call started:', callData);
      
      // Broadcast to all clients that a call has started
      io.emit('call:started', callData);
      
      // Create a room for this call
      socket.join(`call:${callData.id}`);
    });
    
    // Handle direct connection requests
    socket.on('call:connect', (callData) => {
      console.log('Call connect request:', callData);
      
      // Join the call room
      if (callData.callId) {
        socket.join(`call:${callData.callId}`);
        console.log(`Socket ${socket.id} joined room call:${callData.callId}`);
      }
      
      // Also create a room for the Twilio SID if available
      if (callData.callSid) {
        socket.join(`twilio:${callData.callSid}`);
        console.log(`Socket ${socket.id} joined room twilio:${callData.callSid}`);
      }
      
      // Send a test transcript to verify the connection
      setTimeout(() => {
        console.log('Sending test transcript to socket:', socket.id);
        socket.emit('transcript_update', {
          callId: callData.callId,
          callSid: callData.callSid,
          transcript: 'This is a test transcript from the server. If you see this, the WebSocket connection is working.',
          speaker: 'system',
          timestamp: new Date(),
          id: `server-test-${Date.now()}`
        });
      }, 1000);
    });

    // Handle call transcript updates
    socket.on('call:transcript', (data) => {
      console.log('Transcript update (call:transcript):', data);
      
      // Broadcast the transcript update to all clients in the call room
      io.to(`call:${data.callId}`).emit('call:transcript_update', data);
    });
    
    // Handle direct transcript updates
    socket.on('call:transcript_update', (data) => {
      console.log('Transcript update (call:transcript_update):', data);
      
      // Add a unique ID to the transcript data
      const transcriptWithId = {
        ...data,
        id: `transcript-${Date.now()}` // Add a unique ID
      };
      
      // Log the transcript data being broadcast
      console.log('Broadcasting transcript to all clients:', transcriptWithId);
      
      // Broadcast to all clients
      io.emit('call:transcript_update', transcriptWithId);
      
      // Also broadcast as a generic transcript update
      io.emit('transcript_update', transcriptWithId);
      
      // Broadcast to the specific call room if callId exists
      if (data.callId) {
        console.log(`Broadcasting to room call:${data.callId}`);
        io.to(`call:${data.callId}`).emit('call:transcript_update', transcriptWithId);
        io.to(`call:${data.callId}`).emit('transcript_update', transcriptWithId);
      }
      
      // Broadcast to the Twilio SID room if callSid exists
      if (data.callSid) {
        console.log(`Broadcasting to room twilio:${data.callSid}`);
        io.to(`twilio:${data.callSid}`).emit('call:transcript_update', transcriptWithId);
        io.to(`twilio:${data.callSid}`).emit('transcript_update', transcriptWithId);
      }
    });

    // Handle call ended events
    socket.on('call:end', (callData) => {
      console.log('Call ended:', callData);
      
      // Broadcast to all clients that the call has ended
      io.emit('call:ended', callData);
      
      // Leave the call room
      socket.leave(`call:${callData.id}`);
    });

    // Handle Twilio webhook events
    socket.on('twilio:webhook', (data) => {
      console.log('Twilio webhook event:', data);
      
      // Process the webhook data and broadcast relevant events
      if (data.type === 'transcription') {
        io.emit('call:transcript_update', {
          callId: data.callSid,
          transcript: data.transcription,
          speaker: data.speaker || 'unknown',
          timestamp: new Date(),
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});