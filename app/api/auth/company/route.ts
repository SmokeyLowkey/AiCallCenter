import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/options";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await (authOptions as any).auth(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Get the user with their company information
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // If the user already has a company ID, return it
    if (user.companyId) {
      return NextResponse.json({
        companyId: user.companyId,
        companyName: user.companyName,
      });
    }
    
    // If the user has a company name but no company ID, generate one
    if (user.companyName && !user.companyId) {
      // Generate a unique company ID
      const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Update the user with the new company ID
      await prisma.user.update({
        where: { id: userId },
        data: { companyId },
      });
      
      return NextResponse.json({
        companyId,
        companyName: user.companyName,
        message: "Company ID generated successfully",
      });
    }
    
    // If the user doesn't have a company name, return an error
    return NextResponse.json(
      { error: "User does not have a company name" },
      { status: 400 }
    );
    
  } catch (error) {
    console.error("Error generating company ID:", error);
    return NextResponse.json(
      { error: "Failed to generate company ID" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await (authOptions as any).auth(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Parse request body
    const { companyName } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }
    
    // Generate a unique company ID
    const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Update the user with the new company name and ID
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyName,
        companyId,
      },
    });
    
    return NextResponse.json({
      companyId,
      companyName,
      message: "Company information updated successfully",
    });
    
  } catch (error) {
    console.error("Error updating company information:", error);
    return NextResponse.json(
      { error: "Failed to update company information" },
      { status: 500 }
    );
  }
}