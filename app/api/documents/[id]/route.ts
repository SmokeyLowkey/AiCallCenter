import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/options';
import { PrismaClient } from '@/lib/generated/prisma';
import { getPresignedUrl, checkTeamAccess } from '@/lib/services/s3';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await (authOptions as any).auth(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Get user with team information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { team: true }
    });
    
    if (!user || !user.team) {
      return NextResponse.json(
        { error: 'User not associated with a team' },
        { status: 400 }
      );
    }
    
    const userTeamId = user.team.id;
    
    // Get document
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if user's team has access to the document
    if (!checkTeamAccess(document.teamId, userTeamId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Generate presigned URL for downloading the document
    let downloadUrl = null;
    
    try {
      downloadUrl = await getPresignedUrl(document.s3Key, 3600); // URL valid for 1 hour
    } catch (error) {
      console.error(`Error generating presigned URL for document ${id}:`, error);
    }
    
    // Return document with download URL
    return NextResponse.json({
      id: document.id,
      title: document.title,
      type: document.type,
      size: document.size,
      path: document.path,
      status: document.status,
      processingError: document.processingError,
      category: document.category,
      team: document.team,
      uploadedBy: document.uploadedBy,
      uploadDate: document.uploadDate,
      updatedAt: document.updatedAt,
      downloadUrl,
    });
    
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await (authOptions as any).auth(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Get user with team information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { team: true }
    });
    
    if (!user || !user.team) {
      return NextResponse.json(
        { error: 'User not associated with a team' },
        { status: 400 }
      );
    }
    
    const userTeamId = user.team.id;
    
    // Get document
    const document = await prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if user's team has access to the document
    if (!checkTeamAccess(document.teamId, userTeamId)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete document from database
    await prisma.document.delete({
      where: { id },
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Document deleted successfully',
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}