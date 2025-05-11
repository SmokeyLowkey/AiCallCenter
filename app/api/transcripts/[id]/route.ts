import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// GET: Retrieve a transcript by call ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { content: "[]" },
        { status: 200 }
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

    // Get the call ID from the URL params
    const callId = params.id;

    // Find the call and check if it belongs to the user's team
    const call = await prisma.call.findUnique({
      where: { id: callId },
      include: { transcript: true }
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

    // Format the transcript content
    let formattedTranscript = call.transcript;
    
    // Check if the transcript content is a string and try to parse it
    if (formattedTranscript && formattedTranscript.content && typeof formattedTranscript.content === 'string') {
      try {
        // Try to parse the content as JSON
        const parsedContent = JSON.parse(formattedTranscript.content);
        
        // Update the transcript with the parsed content
        formattedTranscript = {
          ...formattedTranscript,
          content: parsedContent
        };
        
        console.log('Successfully parsed transcript content:', parsedContent);
      } catch (parseError) {
        console.error('Error parsing transcript content:', parseError);
        // If parsing fails, return the content as is
      }
    }
    
    // Return the formatted transcript
    return NextResponse.json(formattedTranscript);
  } catch (error) {
    console.error('Error retrieving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcript' },
      { status: 500 }
    );
  }
}