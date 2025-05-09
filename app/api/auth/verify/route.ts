import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Prevent caching issues

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Verification API called");
    
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    console.log(`🔍 Token from URL: ${token}`);

    if (!token) {
      console.log("🔍 Missing verification token");
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    // Find the user with the verification token
    console.log(`🔍 Looking for user with token: ${token}`);
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date()
        }
      },
    });

    if (!user) {
      console.log("🔍 User with token not found or token expired");
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    console.log(`🔍 User found: ${user.id}`);

    try {
      // Update user's email verification status and clear the token
      console.log(`🔍 Updating user email verification status for user ID: ${user.id}`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verificationToken: null,
          verificationTokenExpires: null
        },
      });
      console.log("🔍 User email verification status updated");

      // Return success response
      return NextResponse.json(
        { success: true, message: "Email verified successfully" },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        }
      );
    } catch (updateError) {
      console.error("🔍 Error updating user:", updateError);
      return NextResponse.json(
        { error: "Failed to update user verification status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🔍 Verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}