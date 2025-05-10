import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DocumentStatus } from '@/lib/generated/prisma';
import { generateS3Key, uploadFile } from '@/lib/services/s3';
import { processDocument } from '@/lib/services/document-processor';
import { prisma } from '@/lib/prisma';

// Use the shared Prisma instance from lib/prisma.ts instead of creating a new one
// This helps prevent "Too many connections" errors

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
];

export async function POST(request: NextRequest) {
  console.log('📄 Document upload started');
  try {
    // Check authentication
    const session = await auth();
    console.log('🔐 Authentication check completed', { userId: session?.user?.id });
    
    if (!session || !session.user) {
      console.log('❌ Authentication failed: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const categoryId = formData.get('categoryId') as string;
    const file = formData.get('file') as File;
    const processImmediately = formData.get('processImmediately') === 'true';
    
    // Get team and company information
    const requestedTeamId = formData.get('teamId') as string;
    let companyId = formData.get('companyId') as string;
    
    console.log('📋 Form data parsed', {
      title,
      categoryId: categoryId || 'uncategorized',
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      processImmediately,
      requestedTeamId,
      companyId
    });
    
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
    
    // Use the user's company ID if not provided in the form data
    if (!companyId && user.companyId) {
      companyId = user.companyId;
    }
    
    // Use the requested team ID if provided, otherwise use the user's default team
    const teamId = requestedTeamId || user.team.id;
    
    // Verify that the user belongs to the requested team
    if (requestedTeamId && user.team.id !== requestedTeamId) {
      const userTeams = await prisma.team.findMany({
        where: {
          members: {
            some: {
              id: userId
            }
          }
        }
      });
      
      const isUserInTeam = userTeams.some(team => team.id === requestedTeamId);
      
      if (!isUserInTeam) {
        return NextResponse.json(
          { error: 'User does not belong to the requested team' },
          { status: 403 }
        );
      }
    }
    
    // Validate required fields
    if (!title || !file) {
      console.log('❌ Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ Validation failed: File size exceeds limit', { size: file.size, limit: MAX_FILE_SIZE });
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit (10MB)' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.log('❌ Validation failed: Unsupported file type', { type: file.type, allowed: ALLOWED_FILE_TYPES });
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      );
    }
    
    console.log('✅ File validation passed');
    
    // Generate S3 key with company ID if available
    const fileName = file.name;
    let s3Key;
    
    if (companyId) {
      s3Key = `companies/${companyId}/teams/${teamId}/categories/${categoryId || 'uncategorized'}/${Date.now()}-${fileName}`;
    } else {
      s3Key = generateS3Key(teamId, categoryId || null, fileName);
    }
    
    console.log('🔑 Generated S3 key', { s3Key });
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('🔄 Converted file to buffer', { bufferSize: buffer.length });
    
    // Upload file to S3
    console.log('⬆️ Starting S3 upload');
    await uploadFile(buffer, s3Key, file.type);
    console.log('✅ S3 upload completed successfully');
    
    // Create document record in database
    console.log('💾 Creating document record in database');
    const document = await prisma.document.create({
      data: {
        title,
        type: file.type,
        size: file.size,
        path: fileName, // Store original filename
        s3Key, // Store S3 key for retrieval
        status: DocumentStatus.PROCESSING, // Start in processing state
        categoryId: categoryId || null,
        teamId,
        uploadedById: userId,
        companyId: companyId || null, // Store company ID if provided
        processImmediately, // Whether to process immediately
      },
    });
    console.log('✅ Document record created', { documentId: document.id });
    
    // Process document immediately if requested
    if (processImmediately) {
      console.log('🔄 Starting immediate document processing', { documentId: document.id });
      // In a production environment, this would be handled by a queue
      processDocument(document.id).catch(error => {
        console.error(`❌ Background processing error for document ${document.id}:`, error);
      });
    } else {
      console.log('ℹ️ Document queued for later processing', { documentId: document.id });
    }
    
    // Return success response
    console.log('✅ Document upload completed successfully', { documentId: document.id });
    return NextResponse.json({
      id: document.id,
      title: document.title,
      status: document.status,
      message: processImmediately
        ? 'Document uploaded successfully and is being processed'
        : 'Document uploaded successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}