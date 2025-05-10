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
        { error: "You must be logged in to view team members" },
        { status: 401 }
      );
    }

    // Get the current user to determine their team
    const currentUser = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { team: true }
    });

    if (!currentUser?.teamId) {
      return NextResponse.json(
        { error: "You must be part of a team to view team members" },
        { status: 400 }
      );
    }

    // Get URL parameters
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const departmentId = url.searchParams.get("departmentId");
    const teamId = url.searchParams.get("teamId") || currentUser.teamId;

    // Build the query
    const whereClause: any = {
      OR: [
        { teamId: teamId },
        { 
          memberTeams: {
            some: {
              teamId: teamId
            }
          }
        }
      ]
    };

    // Add role filter if provided
    if (role) {
      whereClause.role = role;
    }

    // Add department filter if provided
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    // Fetch team members
    const teamMembers = await prisma.user.findMany({
      where: whereClause,
      include: {
        department: true,
        team: true,
        memberTeams: {
          include: {
            team: true
          }
        }
      }
    });

    // Transform the data to include performance metrics
    const formattedMembers = teamMembers.map(member => {
      // Calculate performance score (example calculation)
      const performanceScore = Math.round(
        (member.resolutionRate || 0) * 0.4 + 
        (member.satisfactionScore || 0) * 20 * 0.4 + 
        (member.aiUsageRate || 0) * 0.2
      );

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        jobTitle: member.jobTitle,
        department: member.department?.name || "Unassigned",
        departmentId: member.departmentId,
        team: member.team?.name || member.memberTeams[0]?.team.name || "Unassigned",
        teamId: member.teamId || member.memberTeams[0]?.teamId,
        status: member.teamId ? "active" : "inactive",
        performance: performanceScore || 0,
        callsHandled: member.callsHandled,
        avgCallDuration: member.avgCallDuration,
        resolutionRate: member.resolutionRate,
        satisfactionScore: member.satisfactionScore,
        profileImage: member.profileImage || member.image
      };
    });

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
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
        { error: "You must be logged in to add team members" },
        { status: 401 }
      );
    }

    // Get the current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { 
        team: true,
        memberTeams: {
          where: {
            role: "ADMIN"
          }
        }
      }
    });

    // Check if user is an admin or manager
    const isAdmin = currentUser?.role === "ADMIN" ||
                   currentUser?.role === "MANAGER" ||
                   (currentUser?.memberTeams && currentUser.memberTeams.length > 0);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to add team members" },
        { status: 403 }
      );
    }

    const { name, email, role, departmentId, teamId, sendInvite } = await req.json();

    // Validate input
    if (!name || !email || !role || !teamId) {
      return NextResponse.json(
        { error: "Name, email, role, and team are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Add existing user to the team
      const teamMember = await prisma.teamMember.create({
        data: {
          userId: existingUser.id,
          teamId,
          role: role as any
        }
      });

      return NextResponse.json(
        { message: "Existing user added to team", userId: existingUser.id },
        { status: 200 }
      );
    } else {
      // Create a new user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          role: role as any,
          departmentId,
          teamId
        }
      });

      // Add user as a team member
      await prisma.teamMember.create({
        data: {
          userId: newUser.id,
          teamId,
          role: role as any
        }
      });

      // TODO: Send email invitation if sendInvite is true

      return NextResponse.json(
        { message: "New team member created", userId: newUser.id },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}