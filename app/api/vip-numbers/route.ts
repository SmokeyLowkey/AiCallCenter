import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// GET /api/vip-numbers - Get all VIP phone numbers for the team
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

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 400 }
      );
    }

    // Get all VIP phone numbers for the team
    const vipNumbers = await prisma.vIPPhoneNumber.findMany({
      where: {
        teamId: user.teamId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(vipNumbers);
  } catch (error) {
    console.error('Error fetching VIP phone numbers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch VIP phone numbers' },
      { status: 500 }
    );
  }
}

// POST /api/vip-numbers - Add a new VIP phone number
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

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if the phone number already exists for this team
    const existingNumber = await prisma.vIPPhoneNumber.findFirst({
      where: {
        teamId: user.teamId,
        phoneNumber: body.phoneNumber
      }
    });

    if (existingNumber) {
      return NextResponse.json(
        { error: 'This phone number is already in your VIP list' },
        { status: 409 }
      );
    }

    // Create the new VIP phone number
    const vipNumber = await prisma.vIPPhoneNumber.create({
      data: {
        name: body.name || 'VIP Contact',
        phoneNumber: body.phoneNumber,
        notes: body.notes,
        teamId: user.teamId
      }
    });

    // Update the Twilio incoming route to include this VIP number
    // This is just a placeholder - in a real implementation, you would
    // update the VIP numbers list in the Twilio incoming route

    return NextResponse.json(vipNumber);
  } catch (error) {
    console.error('Error adding VIP phone number:', error);
    return NextResponse.json(
      { error: 'Failed to add VIP phone number' },
      { status: 500 }
    );
  }
}