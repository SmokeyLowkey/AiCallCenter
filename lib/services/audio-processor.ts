import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AssemblyAI } from 'assemblyai';
import { prisma } from '@/lib/prisma';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ca-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Initialize AssemblyAI client
const assemblyAI = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI_API_KEY || '',
});

/**
 * Upload audio file to S3 bucket
 * @param audioBuffer Audio buffer to upload
 * @param callSid Twilio Call SID
 * @returns S3 object key
 */
export async function uploadAudioToS3(audioBuffer: Buffer, callSid: string): Promise<string> {
  try {
    // Generate a unique key for the audio file
    const key = `calls/${callSid}/${Date.now()}.wav`;
    
    // Upload the audio file to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'call-center-audio',
      Key: key,
      Body: audioBuffer,
      ContentType: 'audio/wav',
    }));
    
    console.log(`Uploaded audio file to S3: ${key}`);
    return key;
  } catch (error) {
    console.error('Error uploading audio to S3:', error);
    throw error;
  }
}

/**
 * Process audio file with AssemblyAI for transcription and diarization
 * @param audioUrl URL of the audio file
 * @param callId Call ID in the database
 */
export async function processAudioWithAssemblyAI(audioUrl: string, callId: string): Promise<void> {
  try {
    console.log(`Processing audio with AssemblyAI: ${audioUrl}`);
    
    // Create a transcription job
    const transcript = await assemblyAI.transcripts.transcribe({
      audio: audioUrl,
      // Use the correct parameters according to AssemblyAI API
      speaker_labels: true, // Enable speaker diarization
      auto_chapters: true, // Enable auto chapters (similar to highlights)
      entity_detection: true, // Enable entity detection
      sentiment_analysis: true, // Enable sentiment analysis
    });
    
    console.log(`AssemblyAI transcription complete: ${transcript.id}`);
    
    // Wait for the transcription to complete
    // Use polling instead of wait since it's not available in the current version
    const polledTranscript = await assemblyAI.transcripts.get(transcript.id);
    
    // Process the transcription result
    if (polledTranscript.status === 'completed') {
      // Find the transcript in the database
      const dbTranscript = await prisma.transcript.findUnique({
        where: { callId },
      });
      
      if (!dbTranscript) {
        console.error(`Transcript not found for call ${callId}`);
        return;
      }
      
      // Format the transcript with speaker diarization
      const formattedTranscript = polledTranscript.utterances?.map((utterance: any, index: number) => ({
        id: `assembly-${index}`,
        speaker: utterance.speaker || 'unknown',
        text: utterance.text || '',
        timestamp: new Date(utterance.start || Date.now()).toISOString(),
        confidence: 1.0, // AssemblyAI doesn't provide confidence scores for utterances
      })) || [];
      
      // Update the transcript in the database
      await prisma.transcript.update({
        where: { id: dbTranscript.id },
        data: {
          content: JSON.stringify(formattedTranscript),
          // Use a simple approach to avoid TypeScript errors
          summary: typeof polledTranscript.summary === 'string'
            ? polledTranscript.summary
            : 'Transcript processed by AssemblyAI',
        },
      });
      
      console.log(`Updated transcript with AssemblyAI results for call ${callId}`);
    } else {
      console.error(`AssemblyAI transcription failed: ${polledTranscript.status}`);
    }
  } catch (error) {
    console.error('Error processing audio with AssemblyAI:', error);
    throw error;
  }
}

/**
 * Queue audio for processing
 * @param callSid Twilio Call SID
 */
export async function queueAudioForProcessing(callSid: string): Promise<void> {
  try {
    console.log(`Queuing audio for processing: ${callSid}`);
    
    // Find the call in the database
    const call = await prisma.call.findFirst({
      where: { callId: callSid },
    });
    
    if (!call) {
      console.error(`Call not found: ${callSid}`);
      return;
    }
    
    // TODO: Implement actual audio processing
    // For now, just log that we would do this
    console.log(`Would process audio for call ${callSid} (${call.id})`);
    
    // In a real implementation, you would:
    // 1. Download the audio from Twilio
    // 2. Upload it to S3
    // 3. Process it with AssemblyAI
    // 4. Update the transcript in the database
  } catch (error) {
    console.error('Error queuing audio for processing:', error);
    throw error;
  }
}