import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPresignedUrl } from '@/lib/services/s3';
import { prisma } from '@/lib/prisma';

// Use the shared Prisma instance from lib/prisma.ts instead of creating a new one
// This helps prevent "Too many connections" errors

export async function GET(request: NextRequest) {
  console.log('📋 Fetching documents');
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
    
    const teamId = user.team.id;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Query parameters', {
      categoryId,
      status,
      search,
      page,
      limit,
      teamId
    });
    
    // Build where clause
    const whereClause: any = {
      teamId, // Only return documents for the user's team
    };
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { path: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get documents
    const [documents, totalCount] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
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
        },
        orderBy: {
          uploadDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.document.count({
        where: whereClause,
      }),
    ]);
    
    console.log(`✅ Found ${documents.length} documents out of ${totalCount} total`);
    
    // Generate presigned URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        let downloadUrl = null;
        
        try {
          console.log(`🔗 Generating presigned URL for document ${doc.id} with S3 key: ${doc.s3Key}`);
          // Generate a presigned URL for downloading the document
          downloadUrl = await getPresignedUrl(doc.s3Key, 3600); // URL valid for 1 hour
          console.log(`✅ Generated presigned URL for document ${doc.id}`);
        } catch (error) {
          console.error(`❌ Error generating presigned URL for document ${doc.id}:`, error);
        }
        
        return {
          id: doc.id,
          title: doc.title,
          type: doc.type,
          size: doc.size,
          path: doc.path,
          status: doc.status,
          processingError: doc.processingError,
          category: doc.category,
          uploadedBy: doc.uploadedBy,
          uploadDate: doc.uploadDate,
          updatedAt: doc.updatedAt,
          downloadUrl,
        };
      })
    );
    
    // Return documents with pagination info
    console.log(`📤 Returning ${documentsWithUrls.length} documents with pagination`);
    return NextResponse.json({
      documents: documentsWithUrls,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
    
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}