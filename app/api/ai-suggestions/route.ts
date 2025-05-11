import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { processTranscript } from '@/lib/services/ai-assistant';
import { prisma } from '@/lib/prisma';

// POST: Process transcript and generate AI suggestions
export async function POST(request: NextRequest) {
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

    // Parse the request body
    const body = await request.json();
    const { messages, callId } = body;

    if (!messages || !Array.isArray(messages) || !callId) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Find the call in the database
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

    // Process the transcript and generate AI suggestions
    console.log(`🧠 Processing transcript for call ${callId} with ${messages.length} messages`);
    const teamId = user.teamId || 'default'; // Provide a default value if teamId is null
    const suggestion = await processTranscript(messages, teamId);

    // If no suggestion was generated, return a 204 No Content response
    if (!suggestion) {
      console.log('❌ No suggestion generated');
      return NextResponse.json(
        { message: 'No suggestion generated' },
        { status: 204 }
      );
    }

    console.log('✅ Generated suggestion:', suggestion);

    // Return the suggestion
    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestion' },
      { status: 500 }
    );
  }
}