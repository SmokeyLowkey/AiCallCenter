import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

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
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'date-desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Build the query
    const baseQuery: any = {
      where: {
        call: {
          teamId: user.teamId
        }
      },
      include: {
        call: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            topics: true
          }
        }
      }
    };

    // Apply filter
    if (filter === 'flagged') {
      baseQuery.where.isFlagged = true;
    } else if (filter === 'starred') {
      baseQuery.where.isStarred = true;
    } else if (filter === 'shared') {
      baseQuery.where.isShared = true;
    }

    // Apply search
    if (search) {
      baseQuery.where.OR = [
        { summary: { contains: search, mode: 'insensitive' } },
        { call: { callerName: { contains: search, mode: 'insensitive' } } },
        { call: { agent: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    // Count total records for pagination
    const totalCount = await prisma.transcript.count({
      where: baseQuery.where
    });

    // Apply sorting
    if (sortBy === 'date-desc') {
      baseQuery.orderBy = { call: { startTime: 'desc' } };
    } else if (sortBy === 'date-asc') {
      baseQuery.orderBy = { call: { startTime: 'asc' } };
    } else if (sortBy === 'duration-desc') {
      baseQuery.orderBy = { call: { duration: 'desc' } };
    } else if (sortBy === 'duration-asc') {
      baseQuery.orderBy = { call: { duration: 'asc' } };
    } else if (sortBy === 'sentiment-desc' || sortBy === 'sentiment-asc') {
      // For sentiment sorting, we'll need to handle this in memory after fetching
      // since it's not a direct field we can sort on in the database
      baseQuery.orderBy = { call: { startTime: 'desc' } }; // Default sort for now
    }

    // Apply pagination
    baseQuery.skip = (page - 1) * pageSize;
    baseQuery.take = pageSize;

    // Execute the query
    const transcripts = await prisma.transcript.findMany(baseQuery);

    // Format the response
    const formattedTranscripts = transcripts.map(transcript => {
      // Type assertion to access the included relations
      const transcriptWithRelations = transcript as any;
      const call = transcriptWithRelations.call;
      
      // Format topics
      const topics = call.topics.map((topic: any) => topic.name);
      
      // Determine sentiment value for sorting if needed
      const sentimentValue = 
        call.sentiment === 'positive' ? 3 :
        call.sentiment === 'neutral' ? 2 :
        call.sentiment === 'negative' ? 1 : 0;
      
      return {
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
          avatar: call.agent.image || '/placeholder.svg'
        } : null,
        date: call.startTime.toLocaleString(),
        duration: formatDuration(call.duration || 0),
        sentiment: call.sentiment || 'neutral',
        topics,
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
        _sentimentValue: sentimentValue // For client-side sorting
      };
    });

    // Apply sentiment sorting if needed
    if (sortBy === 'sentiment-desc') {
      formattedTranscripts.sort((a, b) => b._sentimentValue - a._sentimentValue);
    } else if (sortBy === 'sentiment-asc') {
      formattedTranscripts.sort((a, b) => a._sentimentValue - b._sentimentValue);
    }

    // Remove the internal sorting field
    formattedTranscripts.forEach(t => {
      const transcript = t as any;
      delete transcript._sentimentValue;
    });

    return NextResponse.json({
      transcripts: formattedTranscripts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
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

// Helper function to format duration in seconds to MM:SS format
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}