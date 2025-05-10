import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/options';
import { PrismaClient } from '@/lib/generated/prisma';
import { processDocument } from '@/lib/services/document-processor';

const prisma = new PrismaClient();

// POST /api/documents/process - Process a document
export async function POST(request: NextRequest) {
  try {
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
    
    // Parse request body
    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if user's team has access to the document
    if (document.teamId !== user.team.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Process document in the background
    // In a production environment, this would be handled by a queue
    processDocument(documentId).catch(error => {
      console.error(`Background processing error for document ${documentId}:`, error);
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Document processing started',
      documentId,
    });
    
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}