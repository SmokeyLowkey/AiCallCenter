import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "You must be logged in to join a team" },
        { status: 401 }
      );
    }

    const userId = token.sub;
    const { inviteCode } = await req.json();

    // Validate input
    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find the invite code
    const invite = await prisma.inviteCode.findUnique({
      where: {
        code: inviteCode,
      },
      include: {
        team: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    // Check if the invite code is expired
    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 }
      );
    }

    // Check if the invite code has reached its maximum uses
    if (invite.usedCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "Invite code has reached its maximum uses" },
        { status: 400 }
      );
    }

    // Check if the user is already a member of the team
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: userId,
          teamId: invite.teamId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 }
      );
    }

    // Add the user as a team member with AGENT role
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: userId,
        teamId: invite.teamId,
        role: "AGENT", // Default role for invited members
      },
    });

    // Update the user's primary team if they don't have one
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.teamId) {
      await prisma.user.update({
        where: { id: userId },
        data: { teamId: invite.teamId },
      });
    }

    // Increment the used count for the invite code
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usedCount: invite.usedCount + 1 },
    });

    return NextResponse.json(
      {
        message: "Successfully joined team",
        team: invite.team,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Team join error:", error);
    return NextResponse.json(
      { error: "An error occurred while joining the team" },
      { status: 500 }
    );
  }
}