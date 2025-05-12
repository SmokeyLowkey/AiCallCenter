import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    // Get the transcript with related data
    const transcript = await prisma.transcript.findUnique({
      where: { id },
      include: {
        call: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                image: true,
                jobTitle: true,
                department: true
              }
            },
            topics: true,
            insights: {
              include: {
                insight: true
              }
            }
          }
        }
      }
    });

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // Check if the transcript belongs to the user's team
    const call = transcript.call as any;
    if (call.teamId !== user.teamId) {
      return NextResponse.json(
        { error: 'Unauthorized to access this transcript' },
        { status: 403 }
      );
    }

    // Import the getPresignedUrl function
    const { getPresignedUrl } = await import('@/lib/services/s3');
    
    // Get the recording URL if available
    let recordingUrl = null;
    if (call.recordingUrl) {
      try {
        // Generate a presigned URL for the recording
        recordingUrl = await getPresignedUrl(call.recordingUrl);
        console.log(`Generated presigned URL for recording: ${call.id}`);
      } catch (error) {
        console.error(`Error getting presigned URL for recording ${call.recordingUrl}:`, error);
      }
    }

    // Format the response
    const formattedTranscript = {
      id: transcript.id,
      callId: call.id,
      customer: {
        name: call.callerName || 'Unknown Caller',
        phone: call.callerPhone,
        avatar: call.callerAvatar || '/placeholder.svg'
      },
      agent: call.agent ? {
        id: call.agent.id,
        name: call.agent.name || 'Unknown Agent',
        avatar: call.agent.image || '/placeholder.svg',
        jobTitle: call.agent.jobTitle || 'Agent',
        department: call.agent.department?.name || 'Customer Support'
      } : null,
      date: call.startTime.toLocaleString(),
      duration: formatDuration(call.duration || 0),
      sentiment: call.sentiment || 'neutral',
      topics: call.topics.map((topic: any) => topic.name),
      starred: transcript.isStarred,
      flagged: transcript.isFlagged,
      flagReason: transcript.flagReason,
      shared: transcript.isShared ? {
        by: transcript.sharedBy || 'Unknown',
        date: transcript.sharedAt?.toLocaleString() || 'Unknown',
        with: transcript.sharedWith || []
      } : null,
      summary: transcript.summary || 'No summary available',
      content: transcript.content,
      insights: call.insights.map((insightRelation: any) => ({
        id: insightRelation.insight.id,
        title: insightRelation.insight.title,
        description: insightRelation.insight.description,
        details: insightRelation.insight.details,
        category: insightRelation.insight.category,
        confidence: insightRelation.insight.confidence,
        trend: insightRelation.insight.trend,
        change: insightRelation.insight.change,
        recommendations: insightRelation.insight.recommendations
      })),
      recordingUrl: recordingUrl
    };

    return NextResponse.json(formattedTranscript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}

// Helper function to format duration in seconds to MM:SS format
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}