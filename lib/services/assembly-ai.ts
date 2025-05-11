import { AssemblyAI } from 'assemblyai';
import { prisma } from '@/lib/prisma';

// Initialize AssemblyAI client
const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY || '',
});

// Interface for transcript message
interface TranscriptMessage {
  speaker: string;
  text: string;
  timestamp: string;
  confidence?: number;
}

// Function to create a real-time transcript
export async function createRealtimeTranscript(callId: string, callSid: string) {
  console.log(`Creating real-time transcript for call ${callSid}`);
  
  try {
    // Find the call in the database
    const call = await prisma.call.findFirst({
      where: { callId: callSid },
    });
    
    if (!call) {
      console.error(`Call not found: ${callSid}`);
      return null;
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
              text: 'Call started',
              timestamp: new Date().toISOString(),
            },
          ]),
        },
      });
      console.log(`Created new transcript for call ${callSid}`);
    }
    
    return {
      call,
      transcript,
    };
  } catch (error) {
    console.error('Error creating real-time transcript:', error);
    return null;
  }
}

// Function to update transcript with new message
export async function updateTranscript(
  callId: string, 
  message: TranscriptMessage,
  socketClient: any
) {
  console.log(`Updating transcript for call ${callId} with message:`, message);
  
  try {
    // Find the transcript in the database
    const transcript = await prisma.transcript.findUnique({
      where: { callId },
    });
    
    if (!transcript) {
      console.error(`Transcript not found for call ${callId}`);
      return null;
    }
    
    // Parse the existing content
    const existingContent = JSON.parse(transcript.content as string);
    
    // Add the new message
    const updatedContent = [
      ...existingContent,
      message,
    ];
    
    // Update the transcript in the database
    const updatedTranscript = await prisma.transcript.update({
      where: { id: transcript.id },
      data: {
        content: JSON.stringify(updatedContent),
      },
    });
    
    // Emit the transcript update to the WebSocket server
    if (socketClient) {
      const transcriptData = {
        callId,
        transcript: message.text,
        speaker: message.speaker,
        timestamp: new Date(message.timestamp),
        confidence: message.confidence,
        id: `transcript-${Date.now()}`,
      };
      
      console.log('Emitting transcript update:', transcriptData);
      socketClient.emit('call:transcript_update', transcriptData);
      socketClient.emit('transcript_update', transcriptData);
    }
    
    return updatedTranscript;
  } catch (error) {
    console.error('Error updating transcript:', error);
    return null;
  }
}

// Function to start a real-time transcription session
export async function startRealtimeTranscription(audioUrl: string, callSid: string) {
  console.log(`Starting real-time transcription for call ${callSid}`);
  
  try {
    // Create a real-time transcript
    const transcriptData = await createRealtimeTranscript(callSid, callSid);
    
    if (!transcriptData) {
      console.error(`Failed to create transcript for call ${callSid}`);
      return null;
    }
    
    // Create a real-time transcription session
    const transcriber = assemblyAI.realtime.transcriber({
      sampleRate: 16000,
      wordBoost: ['call center', 'customer service', 'support'],
      // AssemblyAI doesn't support speaker diarization in real-time transcription
      // We'll handle speaker identification ourselves
    });
    
    // Set up event handlers
    transcriber.on('open', () => {
      console.log(`AssemblyAI WebSocket opened for call ${callSid}`);
    });
    
    transcriber.on('transcript', (transcript) => {
      console.log(`Received transcript for call ${callSid}:`, transcript);
      
      // Only process final transcripts
      if (transcript.message_type === 'FinalTranscript') {
        // Create a transcript message
        const message: TranscriptMessage = {
          // Determine speaker based on heuristics
          speaker: determineTranscriptSpeaker(transcript.text),
          text: transcript.text,
          timestamp: new Date().toISOString(),
          confidence: transcript.confidence,
        };
        
        // Update the transcript in the database
        updateTranscript(transcriptData.call.id, message, global.socketClient);
      }
    });
    
    transcriber.on('error', (error) => {
      console.error(`AssemblyAI error for call ${callSid}:`, error);
    });
    
    transcriber.on('close', () => {
      console.log(`AssemblyAI WebSocket closed for call ${callSid}`);
    });
    
    return transcriber;
  } catch (error) {
    console.error('Error starting real-time transcription:', error);
    return null;
  }
  
  // Helper function to determine the speaker based on text content
  function determineTranscriptSpeaker(text: string): string {
    // Simple heuristic based on text patterns
    const text_lower = text.toLowerCase();
    
    // Check for patterns that might indicate it's the caller
    if (text_lower.includes('i need') ||
        text_lower.includes('my name is') ||
        text_lower.includes('i want') ||
        text_lower.includes('i have a question') ||
        text_lower.includes('can you help')) {
      return 'caller';
    }
    
    // Check for patterns that might indicate it's the agent
    if (text_lower.includes('how can i help') ||
        text_lower.includes('thank you for calling') ||
        text_lower.includes('is there anything else') ||
        text_lower.includes('let me check') ||
        text_lower.includes('i can assist')) {
      return 'agent';
    }
    
    // Default to caller if we can't determine
    return 'caller';
  }
}