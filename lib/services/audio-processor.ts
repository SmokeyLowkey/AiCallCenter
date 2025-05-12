import axios from 'axios';
import { uploadFile, generateS3Key } from './s3';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

/**
 * Download a recording from Twilio and upload it to S3
 * @param recordingSid The Twilio recording SID
 * @param recordingUrl The Twilio recording URL
 * @param callId The call ID in our database
 * @param teamId The team ID
 * @param companyId The company ID (optional)
 */
export const processRecording = async (
  recordingSid: string,
  recordingUrl: string,
  callId: string,
  teamId: string,
  companyId?: string
): Promise<string> => {
  console.log('🔄 PROCESSING RECORDING', {
    recordingSid,
    callId,
    recordingUrl,
    teamId,
    companyId: companyId || 'none'
  });

  try {
    // Download the recording from Twilio
    console.log('📥 DOWNLOADING RECORDING FROM TWILIO', {
      recordingUrl,
      recordingSid,
      callId
    });
    
    // Get Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    
    console.log('🔑 USING TWILIO CREDENTIALS:', {
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 5)}` : 'MISSING',
      authToken: authToken ? `${authToken.substring(0, 3)}...${authToken.substring(authToken.length - 3)}` : 'MISSING',
      credentialsPresent: !!(accountSid && authToken)
    });
    
    // For Twilio recordings, we need to append .mp3 to get the actual audio file
    const audioUrl = `${recordingUrl}.mp3`;
    console.log('Downloading audio from URL:', audioUrl);
    
    // Log the Twilio credentials being used (partially masked)
    console.log('🔑 TWILIO CREDENTIALS DETAILS:', {
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 5)}` : 'MISSING',
      authToken: authToken ? `${authToken.substring(0, 3)}...${authToken.substring(authToken.length - 3)}` : 'MISSING',
      recordingUrl,
      audioUrl: `${recordingUrl}.mp3`,
      recordingSid,
      callId
    });
    
    // Try multiple approaches to download the recording
    console.log('Attempting to download recording');
    
    // Direct URL with auth - try the new URL format first
    const mediaUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callId}/Recordings/${recordingSid}.mp3`;
    console.log('Downloading from media URL:', mediaUrl);
    
    // Create a basic auth token
    const authString = `${accountSid}:${authToken}`;
    const base64Auth = Buffer.from(authString).toString('base64');
    
    let buffer: Buffer;
    
    try {
      // Try with axios and basic auth header
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Basic ${base64Auth}`,
        },
      });
      
      buffer = Buffer.from(response.data);
      console.log('Successfully downloaded recording with basic auth header');
    } catch (error) {
      console.error('Error downloading with basic auth header:', error);
      
      try {
        // Try with the alternative URL format
        const alternativeUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}.mp3`;
        console.log('Trying alternative URL:', alternativeUrl);
        
        const response = await axios.get(alternativeUrl, {
          responseType: 'arraybuffer',
          auth: {
            username: accountSid,
            password: authToken
          }
        });
        
        buffer = Buffer.from(response.data);
        console.log('Successfully downloaded recording with auth parameter');
      } catch (error) {
        console.error('Error downloading with auth parameter:', error);
        
        // Try creating a new recording via POST request
        try {
          console.log('Attempting to create a new recording via POST request');
          
          // URL for creating a new recording
          // We need to use the Twilio Call SID, not our internal call ID
          // Get the call from the database to get the Twilio Call SID
          const call = await prisma.call.findUnique({
            where: { id: callId }
          });
          
          if (!call || !call.callId) {
            throw new Error('Call not found or missing Twilio Call SID');
          }
          
          const createRecordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${call.callId}/Recordings.json`;
          console.log('POSTing to:', createRecordingUrl);
          
          // Make a POST request to create a new recording
          await axios.post(createRecordingUrl, null, {
            auth: {
              username: accountSid,
              password: authToken
            }
          });
          
          console.log('Successfully created a new recording, waiting for it to be ready...');
          
          // Wait a moment for the recording to be created
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Now try to get the recording
          const client = twilio(accountSid, authToken);
          // Use the call's Twilio Call SID
          const recordings = await client.recordings.list({ callSid: call.callId });
          
          if (recordings.length === 0) {
            throw new Error('No recordings found after POST request');
          }
          
          // Use the most recent recording
          const newRecording = recordings[0];
          console.log('Found new recording:', { recordingSid: newRecording.sid });
          
          // Try to download the new recording
          const newRecordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${newRecording.sid}.mp3`;
          console.log('Downloading new recording from:', newRecordingUrl);
          
          const response = await axios.get(newRecordingUrl, {
            responseType: 'arraybuffer',
            auth: {
              username: accountSid,
              password: authToken
            }
          });
          
          buffer = Buffer.from(response.data);
          console.log('Successfully downloaded newly created recording');
        } catch (finalError) {
          console.error('All download attempts failed:', finalError);
          throw new Error('Failed to download recording after multiple attempts');
        }
      }
    }

    console.log('✅ DOWNLOADED RECORDING SUCCESSFULLY', {
      size: buffer.length,
      recordingSid,
      callId,
      bufferType: typeof buffer,
      bufferLength: buffer.length
    });

    // Generate S3 key with a better folder structure
    let s3Key;
    if (companyId) {
      s3Key = `call-recordings/companies/${companyId}/teams/${teamId}/calls/${callId}/${recordingSid}.mp3`;
    } else {
      s3Key = `call-recordings/teams/${teamId}/calls/${callId}/${recordingSid}.mp3`;
    }
    console.log('🔑 GENERATED S3 KEY', {
      s3Key,
      recordingSid,
      callId,
      teamId,
      companyId: companyId || 'none'
    });

    // Upload the recording to S3
    console.log('⬆️ UPLOADING RECORDING TO S3', {
      s3Key,
      bufferSize: buffer.length,
      contentType: 'audio/mpeg',
      recordingSid,
      callId
    });
    await uploadFile(buffer, s3Key, 'audio/mpeg');
    console.log('✅ UPLOADED RECORDING TO S3 SUCCESSFULLY', {
      s3Key,
      recordingSid,
      callId
    });

    // Update the call record with the S3 key
    await prisma.call.update({
      where: { id: callId },
      data: {
        recordingUrl: s3Key,
        recordingSid: recordingSid,
      },
    });
    console.log('✅ UPDATED CALL RECORD WITH S3 KEY', {
      callId,
      recordingSid,
      s3Key
    });

    return s3Key;
  } catch (error) {
    console.error('❌ ERROR PROCESSING RECORDING:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`❌ Error message: ${error.message}`);
      console.error(`❌ Error stack: ${error.stack}`);
    }
    console.error('❌ Error context:', {
      recordingSid,
      callId,
      recordingUrl,
      teamId,
      companyId: companyId || 'none'
    });
    throw new Error('Failed to process recording');
  }
};

/**
 * Queue a completed call for audio processing
 * This function is called when a call is completed to process the recording
 * @param callSid The Twilio call SID
 * @param recordingSid The Twilio recording SID (optional)
 */
export const queueAudioForProcessing = async (
  callSid: string,
  recordingSid?: string
): Promise<void> => {
  console.log('🔄 QUEUING CALL FOR AUDIO PROCESSING', {
    callSid,
    recordingSid: recordingSid || 'none',
    hasRecordingSid: !!recordingSid
  });

  try {
    // Find the call in our database
    const call = await prisma.call.findFirst({
      where: {
        callId: callSid,
      },
      include: {
        team: true,
      },
    });

    if (!call) {
      console.error(`❌ CALL NOT FOUND FOR SID: ${callSid}`);
      return;
    }

    // If we already have a recording SID, use it
    if (recordingSid) {
      console.log('🎙️ USING PROVIDED RECORDING SID', {
        recordingSid,
        callSid,
        callId: call.id
      });
      
      // Get the recording URL from Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}`;
      
      // Process the recording
      await processRecording(
        recordingSid,
        recordingUrl,
        call.id,
        call.teamId || '',
        call.team?.companyId || undefined
      );
      
      return;
    }

    // If we don't have a recording SID, we need to fetch the recordings for this call
    console.log('🔍 FETCHING RECORDINGS FOR CALL', {
      callSid,
      callId: call.id,
      teamId: call.teamId || 'none',
      companyId: call.team?.companyId || 'none'
    });
    
    // Initialize Twilio client with proper error handling
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    
    console.log('🔑 TWILIO CREDENTIALS FOR RECORDING LOOKUP:', {
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 5)}` : 'MISSING',
      authToken: authToken ? `${authToken.substring(0, 3)}...${authToken.substring(authToken.length - 3)}` : 'MISSING',
      credentialsPresent: !!(accountSid && authToken),
      callSid,
      callId: call.id
    });
    
    if (!accountSid || !authToken) {
      console.error('❌ MISSING TWILIO CREDENTIALS');
      console.error('❌ Cannot proceed with recording lookup without credentials');
      return;
    }
    
    try {
      const client = twilio(accountSid, authToken);
      
      // Get recordings for this call
      const recordings = await client.recordings.list({ callSid });
      
      if (recordings.length === 0) {
        console.log('❌ NO RECORDINGS FOUND FOR CALL', {
          callSid,
          callId: call.id,
          teamId: call.teamId || 'none',
          companyId: call.team?.companyId || 'none'
        });
        return;
      }
      
      // Use the most recent recording
      const recording = recordings[0];
      console.log('✅ FOUND RECORDING VIA TWILIO API', {
        recordingSid: recording.sid,
        callSid,
        callId: call.id,
        status: recording.status,
        duration: recording.duration,
        channels: recording.channels,
        source: recording.source,
        uri: recording.uri
      });
      
      // Process the recording
      const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recording.sid}`;
      await processRecording(
        recording.sid,
        recordingUrl,
        call.id,
        call.teamId || '',
        call.team?.companyId || undefined
      );
    } catch (error: any) {
      console.error('❌ ERROR WITH TWILIO CLIENT:', error);
      if (error.status) {
        console.error('Twilio error status:', error.status);
        console.error('Twilio error code:', error.code);
        console.error('Twilio error details:', error.details);
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR QUEUING AUDIO FOR PROCESSING:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`❌ Error message: ${error.message}`);
      console.error(`❌ Error stack: ${error.stack}`);
    }
    console.error('❌ Error context:', {
      callSid,
      recordingSid: recordingSid || 'none'
    });
    throw new Error('Failed to queue audio for processing');
  }
};

/**
 * Get a presigned URL for a recording
 * @param s3Key The S3 key of the recording
 * @returns The presigned URL
 */
export const getRecordingUrl = async (s3Key: string): Promise<string> => {
  try {
    // Import dynamically to avoid circular dependencies
    const { getPresignedUrl } = await import('./s3');
    return await getPresignedUrl(s3Key);
  } catch (error) {
    console.error('❌ ERROR GETTING RECORDING URL:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`❌ Error message: ${error.message}`);
      console.error(`❌ Error stack: ${error.stack}`);
    }
    console.error('❌ Error context:', {
      s3Key
    });
    throw new Error('Failed to get recording URL');
  }
};