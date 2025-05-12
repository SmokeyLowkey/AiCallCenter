import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl } from '@/lib/services/s3';

// Cache for active calls to reduce database queries
let activeCallsCache: {
  timestamp: number;
  calls: any[];
  teamId: string | null;
} = {
  timestamp: 0,
  calls: [],
  teamId: null
};

// Cache expiration time in milliseconds (3 seconds)
const CACHE_EXPIRATION = 3000;

// GET: Retrieve all active calls for the user's team
export async function GET(request: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        [],
        { status: 200 }
      );
    }

    // Check if we can use the cached calls
    const now = Date.now();
    if (
      activeCallsCache.calls.length > 0 &&
      now - activeCallsCache.timestamp < CACHE_EXPIRATION
    ) {
      console.log('Using cached active calls');
      return NextResponse.json(activeCallsCache.calls);
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { teamId: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If the user has a team, get all active calls for that team
    if (user.teamId) {
      const activeCalls = await prisma.call.findMany({
        where: {
          teamId: user.teamId,
          status: 'ACTIVE'
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
          }
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      // Process recordings for active calls
      const processedCalls = await Promise.all(activeCalls.map(async (call: any) => {
        // Get presigned URL for recording if available
        if (call.recordingUrl) {
          try {
            // Generate a presigned URL for the S3 object
            const recordingUrl = await getPresignedUrl(call.recordingUrl);
            console.log(`Generated presigned URL for recording: ${call.id}`);
            return { ...call, recordingUrl };
          } catch (error) {
            console.error(`Error getting presigned URL for recording ${call.recordingUrl}:`, error);
          }
        }
        return call;
      }));

      // Update the cache
      activeCallsCache = {
        timestamp: now,
        calls: processedCalls,
        teamId: user.teamId
      };

      return NextResponse.json(processedCalls);
    }

    // If the user doesn't have a team, return an empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error retrieving active calls:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve active calls' },
      { status: 500 }
    );
  }
}