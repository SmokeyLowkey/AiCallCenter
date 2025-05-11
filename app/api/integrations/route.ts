import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// GET: Retrieve all integrations for the user's team
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

    // If the user has a team, get all integrations for that team
    if (user.teamId) {
      const integrations = await prisma.integration.findMany({
        where: { teamId: user.teamId },
      });

      return NextResponse.json(integrations);
    }

    // If the user doesn't have a team, return an empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error retrieving integrations:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve integrations' },
      { status: 500 }
    );
  }
}