import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { getToken } from "next-auth/jwt";

// Define TeamMember type with team relation
interface TeamMemberWithTeam {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: Date;
  team: {
    id: string;
    name: string;
    description?: string | null;
    industry?: string | null;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
  };
}

// Generate a random invite code
function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

// Create a new team
export async function POST(req: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "You must be logged in to create a team" },
        { status: 401 }
      );
    }

    const userId = token.sub;
    const { name, description, industry } = await req.json();

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name,
        description,
        industry,
        owner: {
          connect: { id: userId },
        },
      },
    });

    // Create an invite code for the team
    const inviteCode = await prisma.inviteCode.create({
      data: {
        code: generateInviteCode(),
        teamId: team.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        maxUses: 10,
      },
    });

    // Add the user as a team member with ADMIN role
    await prisma.teamMember.create({
      data: {
        userId: userId,
        teamId: team.id,
        role: "ADMIN",
      },
    });

    // Update the user's primary team
    await prisma.user.update({
      where: { id: userId },
      data: { teamId: team.id },
    });

    return NextResponse.json(
      {
        message: "Team created successfully",
        team,
        inviteCode: inviteCode.code,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Team creation error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the team" },
      { status: 500 }
    );
  }
}

// Get all teams for the current user
export async function GET(req: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "You must be logged in to view teams" },
        { status: 401 }
      );
    }

    const userId = token.sub;

    // Get teams where the user is the owner
    const ownedTeams = await prisma.team.findMany({
      where: {
        ownerId: userId,
      },
    });

    // Get teams where the user is a member
    const memberTeams = await prisma.teamMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        team: true,
      },
    });

    // Combine and deduplicate teams
    const teams = [
      ...ownedTeams,
      ...memberTeams.map((member: TeamMemberWithTeam) => member.team),
    ].filter(
      (team, index, self) =>
        index === self.findIndex((t) => t.id === team.id)
    );

    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    console.error("Get teams error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching teams" },
      { status: 500 }
    );
  }
}