import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "You must be logged in to view team details" },
        { status: 401 }
      );
    }

    // Get URL parameters
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");

    // If teamId is provided, get details for that specific team
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profileImage: true
            }
          },
          teamMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  jobTitle: true,
                  department: true,
                  image: true,
                  profileImage: true,
                  callsHandled: true,
                  avgCallDuration: true,
                  resolutionRate: true,
                  satisfactionScore: true
                }
              }
            }
          }
        }
      });

      if (!team) {
        return NextResponse.json(
          { error: "Team not found" },
          { status: 404 }
        );
      }

      // Calculate team performance metrics
      const teamMembers = team.teamMembers.map(member => member.user);
      const totalCalls = teamMembers.reduce((sum, member) => sum + member.callsHandled, 0);
      const avgResolutionRate = teamMembers.length > 0 
        ? teamMembers.reduce((sum, member) => sum + (member.resolutionRate || 0), 0) / teamMembers.length 
        : 0;
      const avgSatisfactionScore = teamMembers.length > 0 
        ? teamMembers.reduce((sum, member) => sum + (member.satisfactionScore || 0), 0) / teamMembers.length 
        : 0;

      // Group members by role
      const membersByRole = {
        managers: teamMembers.filter(member => member.role === "MANAGER" || member.role === "ADMIN"),
        agents: teamMembers.filter(member => member.role === "AGENT" || member.role === "USER")
      };

      return NextResponse.json({
        id: team.id,
        name: team.name,
        description: team.description,
        industry: team.industry,
        createdAt: team.createdAt,
        owner: team.owner,
        memberCount: team.teamMembers.length,
        performance: {
          totalCalls,
          avgResolutionRate,
          avgSatisfactionScore
        },
        members: membersByRole
      });
    } 
    // Otherwise, get a list of all teams with basic info
    else {
      const teams = await prisma.team.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              teamMembers: true
            }
          }
        }
      });

      // Format the response
      const formattedTeams = teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        industry: team.industry,
        owner: team.owner,
        memberCount: team._count.teamMembers
      }));

      return NextResponse.json(formattedTeams);
    }
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "You must be logged in to update team details" },
        { status: 401 }
      );
    }

    const userId = token.sub;
    const { teamId, name, description, industry } = await req.json();

    // Validate input
    if (!teamId || !name) {
      return NextResponse.json(
        { error: "Team ID and name are required" },
        { status: 400 }
      );
    }

    // Check if the user is the team owner or an admin
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        teamMembers: {
          where: {
            userId,
            role: "ADMIN"
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    const isOwner = team.ownerId === userId;
    const isAdmin = team.teamMembers.length > 0;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to update this team" },
        { status: 403 }
      );
    }

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description,
        industry
      }
    });

    return NextResponse.json({
      message: "Team updated successfully",
      team: updatedTeam
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}