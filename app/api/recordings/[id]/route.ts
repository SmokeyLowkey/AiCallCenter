import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl } from '@/lib/services/s3';

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

    // Find the call
    const call = await prisma.call.findUnique({
      where: { id: callId }
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

    // Check if the call has a recording
    if (!call.recordingUrl) {
      return NextResponse.json(
        { error: 'No recording available for this call' },
        { status: 404 }
      );
    }

    // Get the presigned URL for the recording
    const url = await getPresignedUrl(call.recordingUrl);

    // Return the URL
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error getting recording URL:', error);
    return NextResponse.json(
      { error: 'Failed to get recording URL' },
      { status: 500 }
    );
  }
}