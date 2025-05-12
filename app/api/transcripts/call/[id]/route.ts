import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id;

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

    // First, find the call
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    // Check if the call belongs to the user's team
    if (call.teamId !== user.teamId) {
      return NextResponse.json(
        { error: 'Unauthorized to access this call' },
        { status: 403 }
      );
    }

    // Now find the transcript for this call
    const transcript = await prisma.transcript.findUnique({
      where: { callId: callId }
    });

    // If no transcript exists yet, return an empty content array
    if (!transcript) {
      return NextResponse.json({
        id: `temp-${callId}`,
        callId: callId,
        content: [],
        summary: null,
        isStarred: false,
        isFlagged: false,
        flagReason: null,
        isShared: false,
        sharedBy: null,
        sharedWith: [],
        sharedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Format the response
    const formattedTranscript = {
      id: transcript.id,
      callId: transcript.callId,
      content: transcript.content,
      summary: transcript.summary,
      isStarred: transcript.isStarred,
      isFlagged: transcript.isFlagged,
      flagReason: transcript.flagReason,
      isShared: transcript.isShared,
      sharedBy: transcript.sharedBy,
      sharedWith: transcript.sharedWith,
      sharedAt: transcript.sharedAt,
      createdAt: transcript.createdAt,
      updatedAt: transcript.updatedAt
    };

    return NextResponse.json(formattedTranscript);
  } catch (error) {
    console.error('Error fetching call transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call transcript' },
      { status: 500 }
    );
  }
}