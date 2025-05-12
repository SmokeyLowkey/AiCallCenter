import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { getRecordingUrl } from '@/lib/services/audio-processor';
import { getPresignedUrl } from '@/lib/services/s3';

export async function GET(request: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { team: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5'); // Default to 5 recent calls
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build the query
    const query: any = {
      where: {
        teamId: user.teamId,
        status: {
          not: 'ACTIVE' // Only get completed, missed, or rejected calls
        }
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        transcript: {
          select: {
            id: true
          }
        },
        topics: true
      },
      orderBy: {
        startTime: 'desc'
      },
      take: limit,
      skip: offset
    };

    // Add status filter if provided
    if (status) {
      query.where.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.where.OR = [
        { callerName: { contains: search, mode: 'insensitive' } },
        { callerPhone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get the calls
    const calls = await prisma.call.findMany(query);

    // Format the response
    const formattedCalls = await Promise.all(calls.map(async (call: any) => {
      // Get topics from the call
      const topics = call.topics ? call.topics.map((topic: any) => topic.name) : [];
      
      // Get presigned URL for recording if available
      let recordingUrl = null;
      if (call.recordingUrl) {
        try {
          // Generate a presigned URL for the S3 object
          recordingUrl = await getPresignedUrl(call.recordingUrl);
          console.log(`Generated presigned URL for recording: ${call.id}`);
        } catch (error) {
          console.error(`Error getting presigned URL for recording ${call.recordingUrl}:`, error);
          // Log more details about the error
          console.error('Error details:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            callId: call.id,
            recordingUrl: call.recordingUrl
          });
        }
      } else {
        console.log(`No recording URL available for call: ${call.id}`);
      }
      
      return {
        id: call.id,
        callId: call.callId,
        callerName: call.callerName || 'Unknown Caller',
        callerPhone: call.callerPhone || 'Unknown Number',
        agent: call.agent ? {
          id: call.agent.id,
          name: call.agent.name,
          image: call.agent.image
        } : null,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: call.duration || 0,
        status: call.status,
        recordingUrl: recordingUrl,
        recordingSid: call.recordingSid || null,
        transcriptId: call.transcript?.id || null,
        sentiment: call.sentiment || 'neutral',
        topics: topics
      };
    }));

    return NextResponse.json(formattedCalls);
  } catch (error) {
    console.error('Error fetching call history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call history' },
      { status: 500 }
    );
  }
}