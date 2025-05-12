import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { io as socketIO } from 'socket.io-client';
import { processRecording } from '@/lib/services/audio-processor';
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
    const socket = socketIO(process.env.BASE_URL || 'http://localhost:3000');
    
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
    
    // Check if this is a recording status callback
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;
    
    // Log the appropriate message based on the type of callback
    if (recordingSid) {
      console.log(`🎙️ RECORDING STATUS UPDATE: ${recordingSid} for call ${callSid}`);
      console.log(`🎙️ Recording details:`, {
        recordingSid,
        callSid,
        status: recordingStatus,
        duration: recordingDuration,
        url: recordingUrl,
        formData: Object.fromEntries(formData.entries())
      });
    } else {
      console.log(`📞 CALL STATUS UPDATE: ${callSid}, status: ${callStatus}, duration: ${duration}`);
      console.log(`📞 Call details:`, {
        callSid,
        status: callStatus,
        duration,
        formData: Object.fromEntries(formData.entries())
      });
    }

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
        
        // Process the recording if we have a recording SID
        if (recordingSid && recordingUrl) {
          try {
            console.log(`🔄 PROCESSING RECORDING ${recordingSid} for call ${callSid}`);
            console.log(`🔄 Recording URL: ${recordingUrl}`);
            
            // Get the team ID
            const team = await prisma.team.findFirst({
              where: {
                id: call.teamId || undefined,
              },
            });

            if (!team) {
              console.error(`Team not found for call: ${callSid}`);
            } else {
              // Process the recording directly
              await processRecording(
                recordingSid,
                recordingUrl,
                call.id,
                team.id,
                team.companyId || undefined
              );
              
              console.log(`✅ RECORDING ${recordingSid} PROCESSED SUCCESSFULLY for call: ${callSid}`);
            }
          } catch (processingError) {
            console.error(`❌ ERROR PROCESSING RECORDING ${recordingSid}:`, processingError);
            // Log more details about the error
            if (processingError instanceof Error) {
              console.error(`❌ Error message: ${processingError.message}`);
              console.error(`❌ Error stack: ${processingError.stack}`);
            }
          }
        }
        // Also try to get recordings from Twilio if the call is completed
        else if (callStatus === 'completed') {
          try {
            console.log(`🔄 PROCESSING RECORDING FOR CALL ${callSid} (via Twilio API)`);
            
            // Get the team ID
            const team = await prisma.team.findFirst({
              where: {
                id: call.teamId || undefined,
              },
            });

            if (!team) {
              console.error(`Team not found for call: ${callSid}`);
            } else {
              // Wait a short delay to ensure the recording is ready
              console.log('Waiting 5 seconds for recording to be ready...');
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              // Initialize Twilio client to get recordings
              const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
              const authToken = process.env.TWILIO_AUTH_TOKEN || '';
              const client = twilio(accountSid, authToken);
              
              // Get recordings for this call
              const recordings = await client.recordings.list({ callSid });
              
              if (recordings.length === 0) {
                console.log('❌ NO RECORDINGS FOUND FOR CALL', {
                  callSid,
                  accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
                  authToken: process.env.TWILIO_AUTH_TOKEN ? 'present' : 'missing'
                });
              } else {
                // Use the most recent recording
                const recording = recordings[0];
                console.log('✅ FOUND RECORDING VIA TWILIO API', {
                  recordingSid: recording.sid,
                  status: recording.status,
                  duration: recording.duration,
                  channels: recording.channels,
                  source: recording.source,
                  uri: recording.uri
                });
                
                // Get the recording URL
                const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recording.sid}`;
                
                // Process the recording
                await processRecording(
                  recording.sid,
                  recordingUrl,
                  call.id,
                  team.id,
                  team.companyId || undefined
                );
                
                console.log(`✅ RECORDING PROCESSED SUCCESSFULLY for call: ${callSid}`);
              }
            }
          } catch (processingError) {
            console.error('❌ ERROR PROCESSING RECORDING:', processingError);
            // Log more details about the error
            if (processingError instanceof Error) {
              console.error(`❌ Error message: ${processingError.message}`);
              console.error(`❌ Error stack: ${processingError.stack}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling call status update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}