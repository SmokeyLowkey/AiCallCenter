import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { queueAudioForProcessing } from '@/lib/services/audio-processor';
import twilio from 'twilio';

// Declare global socket client
declare global {
  var socketClient: any;
}

// Get the Socket.IO client instance
if (!global.socketClient) {
  try {
    // In a production environment, you would use a shared instance
    // For this example, we'll create a simple connection to the Socket.IO server
    const socket = require('socket.io-client')(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    
    // Store the socket for later use
    global.socketClient = socket;
  } catch (error) {
    console.error('Error connecting to Socket.IO server:', error);
  }
}

// This route handles transcription results from Twilio's speech recognition
export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') ? parseFloat(formData.get('Confidence') as string) : 0;
    
    console.log(`Transcription for call ${callSid}: ${speechResult} (confidence: ${confidence})`);
    
    // Log to help debug
    console.log('Socket client available:', !!global.socketClient);

    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        callId: callSid,
      },
      include: {
        agent: true,
      },
    });

    if (!call) {
      console.error(`Call not found: ${callSid}`);
      return createTwiMLResponse('We could not process your request. Please try again.');
    }

    // Determine if this is the caller or agent speaking
    // We'll use a simple heuristic based on the confidence level
    // In a real application, you would use more sophisticated speaker diarization
    let speaker = 'unknown';
    
    // Try to identify the speaker based on patterns in the speech
    const text = speechResult.toLowerCase();
    
    // Check for patterns that might indicate it's the caller
    if (text.includes('i need') ||
        text.includes('my name is') ||
        text.includes('i want') ||
        text.includes('i have a question') ||
        text.includes('can you help')) {
      speaker = 'caller';
    }
    
    // Check for patterns that might indicate it's the agent
    else if (text.includes('how can i help') ||
             text.includes('thank you for calling') ||
             text.includes('is there anything else') ||
             text.includes('let me check') ||
             text.includes('i can assist')) {
      speaker = 'agent';
    }
    
    // If we couldn't determine the speaker, use a fallback based on confidence
    if (speaker === 'unknown') {
      // Higher confidence might indicate the primary speaker (caller)
      speaker = confidence > 0.7 ? 'caller' : 'agent';
    }
    
    console.log(`Identified speaker: ${speaker}, confidence: ${confidence}, text: "${speechResult}"`);

    // PRIORITY 1: Send the transcription to the WebSocket server for immediate display
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    if (global.socketClient) {
      const transcriptData = {
        callId: call.id,
        callSid: callSid,
        transcript: speechResult,
        speaker,
        timestamp: new Date(),
        confidence,
        id: messageId,
      };
      
      console.log('PRIORITY 1: Emitting transcript update for immediate display:', transcriptData);
      
      // Emit to all possible channels to ensure it's received
      global.socketClient.emit('call:transcript_update', transcriptData);
      global.socketClient.emit('transcript_update', transcriptData);
      
      // Try multiple socket connections to ensure delivery
      try {
        // Direct socket connection
        const io = require('socket.io-client');
        const directSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
        
        directSocket.on('connect', () => {
          console.log('Direct socket connected, emitting transcript for immediate display');
          directSocket.emit('call:transcript_update', transcriptData);
          directSocket.emit('transcript_update', transcriptData);
          
          // Disconnect after sending
          setTimeout(() => directSocket.disconnect(), 1000);
        });
      } catch (socketError) {
        console.error('Error with direct socket emission:', socketError);
      }
    } else {
      console.error('No socket client available for transcript update');
    }
    
    // PRIORITY 2: Save to database (after display)
    try {
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
                id: `system-${Date.now()}`,
                speaker: 'system',
                text: 'Call started',
                timestamp: new Date().toISOString(),
              },
            ]),
          },
        });
      }

      // Update the transcript with the new speech
      const existingContent = JSON.parse(transcript.content as string);
      const updatedContent = [
        ...existingContent,
        {
          id: messageId,
          speaker,
          text: speechResult,
          timestamp: new Date().toISOString(),
          confidence,
        },
      ];

      await prisma.transcript.update({
        where: { id: transcript.id },
        data: {
          content: JSON.stringify(updatedContent),
        },
      });
      
      console.log('PRIORITY 2: Database updated with new transcript message');
    } catch (dbError) {
      console.error('Error updating transcript in database:', dbError);
    }
    
    // PRIORITY 3: Queue audio for S3 upload and AssemblyAI processing
    try {
      // Queue the audio for processing
      console.log('PRIORITY 3: Queuing audio for S3 upload and AssemblyAI processing');
      
      // Initialize Twilio client to get recordings
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = process.env.TWILIO_AUTH_TOKEN || '';
      const client = twilio(accountSid, authToken);
      
      // Get recordings for this call
      const recordings = await client.recordings.list({ callSid });
      
      if (recordings.length === 0) {
        console.log('No recordings found for call', { callSid });
      } else {
        // Use the most recent recording
        const recording = recordings[0];
        console.log('Found recording', { recordingSid: recording.sid });
        
        // Get the recording URL
        const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recording.sid}`;
        
        // Process the recording
        await queueAudioForProcessing(callSid, recording.sid);
        
        console.log(`Recording queued for processing: ${callSid}`);
      }
    } catch (processingError) {
      console.error('Error queuing audio for processing:', processingError);
    }

    // Perform sentiment analysis on the transcription
    // In a real application, you would use a more sophisticated sentiment analysis
    // For this example, we'll use a simple keyword-based approach
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'thank', 'appreciate', 'helpful'];
    const negativeWords = ['angry', 'bad', 'terrible', 'awful', 'unhappy', 'frustrated', 'problem'];
    
    const words = speechResult.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment = 'neutral';
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }

    // Update the call sentiment if needed
    if (sentiment !== 'neutral') {
      await prisma.call.update({
        where: { id: call.id },
        data: { sentiment },
      });

      // Send the sentiment update to the WebSocket server
      if (global.socketClient) {
        global.socketClient.emit('call:sentiment_update', {
          callId: call.id,
          sentiment,
        });
      }
    }

    // Continue listening for more speech
    return createTwiMLResponse('', true, call);
  } catch (error) {
    console.error('Error handling transcription:', error);
    return createTwiMLResponse('We encountered an error processing your request.', false);
  }
}

// Helper function to create a TwiML response
function createTwiMLResponse(message: string, continueListening: boolean = false, call?: any) {
  const twiml = new VoiceResponse();
  
  if (message) {
    twiml.say(message);
  }
  
  if (continueListening) {
    // Continue listening for more speech
    const gather = twiml.gather({
      input: ['speech'] as any,
      action: 'https://6116-24-72-111-53.ngrok-free.app/api/integrations/twilio/voice/transcribe',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      enhanced: true,
      language: 'en-US',
    });
    
    // For VIP callers, we want to be completely silent
    // Check if this is a VIP call
    const vipPhoneNumbers = ['+13062092891']; // Add your phone number here
    const isVipCall = call && vipPhoneNumbers.includes(call.callerPhone);
    
    if (!isVipCall) {
      // Only add voice prompts for non-VIP callers
      gather.say('Please continue.');
    } else {
      console.log('VIP call detected, remaining silent');
    }
    
    // Emit a test transcript for debugging
    if (global.socketClient && call) {
      console.log('Emitting test transcript for debugging');
      
      const testTranscript = {
        callId: call.id,
        callSid: call.callId, // Include the Twilio Call SID
        transcript: 'This is a test transcript from the transcribe handler',
        speaker: 'system',
        timestamp: new Date(),
        confidence: 1.0,
        id: `test-transcript-${Date.now()}`, // Add a unique ID
      };
      
      // Emit to all possible event types
      global.socketClient.emit('call:transcript_update', testTranscript);
      global.socketClient.emit('transcript_update', testTranscript);
      
      // Also try direct socket connection
      try {
        const io = require('socket.io-client');
        const directSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
        
        directSocket.on('connect', () => {
          console.log('Direct socket connected, emitting test transcript');
          
          const directTestTranscript = {
            callId: call.id,
            callSid: call.callId, // Include the Twilio Call SID
            transcript: 'Test transcript via direct socket',
            speaker: 'system',
            timestamp: new Date(),
            confidence: 1.0,
            id: `direct-test-${Date.now()}`, // Add a unique ID
          };
          
          // Emit to all possible event types
          directSocket.emit('call:transcript_update', directTestTranscript);
          directSocket.emit('transcript_update', directTestTranscript);
          
          // Also emit a direct message to the specific call room
          directSocket.emit('join_call_room', {
            callId: call.id,
            callSid: call.callId
          });
          
          // Disconnect after sending
          setTimeout(() => {
            console.log('Disconnecting direct socket after sending test transcript');
            directSocket.disconnect();
          }, 1000);
        });
      } catch (socketError) {
        console.error('Error with direct socket emission:', socketError);
      }
    }
  } else {
    // End the call
    twiml.hangup();
  }
  
  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}