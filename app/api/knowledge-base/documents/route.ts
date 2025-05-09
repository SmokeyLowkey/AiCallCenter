import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, DocumentStatus } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    
    // Build where clause
    const whereClause: any = {};
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true
          }
        },
        uploadedBy: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    // Format the response
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      size: doc.size,
      path: doc.path,
      status: doc.status,
      processingError: doc.processingError,
      category: doc.category?.name,
      uploadedBy: doc.uploadedBy?.name,
      uploadDate: doc.uploadDate,
      updatedAt: doc.updatedAt
    }));

    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.type || !data.path || !data.categoryId || !data.uploadedById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const document = await prisma.document.create({
      data: {
        title: data.title,
        type: data.type,
        size: data.size || 0,
        path: data.path,
        status: data.status || DocumentStatus.PROCESSING,
        processingError: data.processingError,
        categoryId: data.categoryId,
        uploadedById: data.uploadedById,
        uploadDate: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}