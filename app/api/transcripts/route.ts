import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, CallStatus } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sentiment = searchParams.get('sentiment');
    const isStarred = searchParams.get('starred') === 'true';
    const isFlagged = searchParams.get('flagged') === 'true';
    const isShared = searchParams.get('shared') === 'true';
    const topic = searchParams.get('topic');
    const agentId = searchParams.get('agentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'date-desc';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build where clause for calls
    const callWhereClause: any = {};
    
    if (status) {
      callWhereClause.status = status;
    }
    
    if (sentiment) {
      callWhereClause.sentiment = sentiment;
    }
    
    if (agentId) {
      callWhereClause.agentId = agentId;
    }
    
    if (search) {
      // Search in caller name, caller phone, or transcript content
      callWhereClause.OR = [
        { callerName: { contains: search, mode: 'insensitive' } },
        { callerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Build where clause for transcripts
    const transcriptWhereClause: any = {};
    
    if (isStarred) {
      transcriptWhereClause.isStarred = true;
    }
    
    if (isFlagged) {
      transcriptWhereClause.isFlagged = true;
    }
    
    if (isShared) {
      transcriptWhereClause.isShared = true;
    }
    
    // Combine call and transcript where clauses
    const whereClause: any = {
      transcript: transcriptWhereClause,
      ...callWhereClause
    };
    
    // Add topic filter if provided
    if (topic) {
      whereClause.topics = {
        some: {
          name: {
            contains: topic,
            mode: 'insensitive'
          }
        }
      };
    }
    
    // Determine sort order
    let orderBy: any = {};
    
    switch (sortBy) {
      case 'date-asc':
        orderBy = { startTime: 'asc' };
        break;
      case 'date-desc':
        orderBy = { startTime: 'desc' };
        break;
      case 'duration-asc':
        orderBy = { duration: 'asc' };
        break;
      case 'duration-desc':
        orderBy = { duration: 'desc' };
        break;
      default:
        orderBy = { startTime: 'desc' };
    }
    
    // Get total count for pagination
    const totalCount = await prisma.call.count({
      where: whereClause
    });
    
    // Fetch calls with transcripts
    const calls = await prisma.call.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        transcript: true,
        topics: true
      },
      orderBy,
      skip,
      take: limit
    });
    
    // Format the response
    const transcripts = calls.map(call => {
      const transcript = call.transcript;
      
      if (!transcript) {
        return null;
      }
      
      // Extract topics
      const topics = call.topics.map(topic => topic.name);
      
      return {
        id: call.id,
        callId: call.callId,
        customer: {
          name: call.callerName || 'Unknown',
          phone: call.callerPhone,
          avatar: call.callerAvatar || '/placeholder.svg?height=40&width=40'
        },
        agent: call.agent ? {
          id: call.agent.id,
          name: call.agent.name || 'Unknown',
          avatar: call.agent.image || '/placeholder.svg?height=40&width=40'
        } : null,
        date: call.startTime,
        duration: call.duration || 0,
        sentiment: call.sentiment || 'neutral',
        topics,
        starred: transcript.isStarred,
        flagged: transcript.isFlagged,
        flagReason: transcript.flagReason,
        shared: transcript.isShared ? {
          by: transcript.sharedBy || '',
          date: transcript.sharedAt,
          with: transcript.sharedWith
        } : null,
        summary: transcript.summary || '',
        content: formatTranscriptContent(transcript.content)
      };
    }).filter(Boolean);
    
    return NextResponse.json({
      transcripts,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}

// Helper function to format transcript content
function formatTranscriptContent(content: any): any {
  // If content is already an array, return it
  if (Array.isArray(content)) {
    return content;
  }
  
  // If content is a string, try to parse it as JSON
  if (typeof content === 'string') {
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (error) {
      console.error('Error parsing transcript content:', error);
      // If parsing fails, return an empty array
      return [];
    }
  }
  
  // If content is null or undefined, return an empty array
  if (content === null || content === undefined) {
    return [];
  }
  
  // If content is an object, return it as is
  return content;
}

// Update transcript flags (star, flag, share)
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, action, value } = data;
    
    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the transcript
    const transcript = await prisma.transcript.findUnique({
      where: { callId: id }
    });
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }
    
    // Update based on action
    let updateData: any = {};
    
    switch (action) {
      case 'star':
        updateData.isStarred = value === true;
        break;
      case 'flag':
        updateData.isFlagged = value === true;
        if (value && data.reason) {
          updateData.flagReason = data.reason;
        }
        break;
      case 'share':
        updateData.isShared = value === true;
        if (value) {
          updateData.sharedBy = data.sharedBy;
          updateData.sharedWith = data.sharedWith;
          updateData.sharedAt = new Date();
        }
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Update the transcript
    const updatedTranscript = await prisma.transcript.update({
      where: { id: transcript.id },
      data: updateData
    });
    
    return NextResponse.json(updatedTranscript);
  } catch (error) {
    console.error('Error updating transcript:', error);
    return NextResponse.json(
      { error: 'Failed to update transcript' },
      { status: 500 }
    );
  }
}