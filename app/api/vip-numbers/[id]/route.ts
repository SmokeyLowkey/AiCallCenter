import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// DELETE /api/vip-numbers/:id - Delete a VIP phone number
export async function DELETE(
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

    if (!user.teamId) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 400 }
      );
    }

    // Find the VIP phone number
    const vipNumber = await prisma.vIPPhoneNumber.findUnique({
      where: { id }
    });

    if (!vipNumber) {
      return NextResponse.json(
        { error: 'VIP phone number not found' },
        { status: 404 }
      );
    }

    // Check if the VIP phone number belongs to the user's team
    if (vipNumber.teamId !== user.teamId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this VIP phone number' },
        { status: 403 }
      );
    }

    // Delete the VIP phone number
    await prisma.vIPPhoneNumber.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting VIP phone number:', error);
    return NextResponse.json(
      { error: 'Failed to delete VIP phone number' },
      { status: 500 }
    );
  }
}