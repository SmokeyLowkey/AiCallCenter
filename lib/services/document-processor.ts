import { PrismaClient, DocumentStatus } from '@/lib/generated/prisma';
import { getFile } from '@/lib/services/s3';
import { extractTextFromDocument } from '@/lib/services/text-extractor';
import { createEmbeddings, storeEmbeddingsInVectorDB } from '@/lib/services/vector-db';
import { prisma } from '@/lib/prisma';

// Use the shared Prisma instance from lib/prisma.ts instead of creating a new one
// This helps prevent "Too many connections" errors

/**
 * Process a document and add it to the vector database
 * This function is meant to be called by a background job
 */
export async function processDocument(documentId: string): Promise<void> {
  console.log(`🔄 Document processing started for document ID: ${documentId}`);
  try {
    // Get document from database
    console.log(`📋 Fetching document details from database: ${documentId}`);
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!document) {
      console.error(`❌ Document not found: ${documentId}`);
      throw new Error(`Document not found: ${documentId}`);
    }
    
    console.log(`📄 Document found`, {
      documentId: document.id,
      title: document.title,
      type: document.type,
      size: document.size,
      teamId: document.teamId,
      teamName: document.team.name,
      s3Key: document.s3Key
    });

    // Update document status to PROCESSING
    console.log(`🔄 Updating document status to PROCESSING: ${documentId}`);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.PROCESSING,
        processingError: null,
      },
    });

    // Get file from S3
    console.log(`📥 Retrieving file from S3: ${document.s3Key}`);
    const fileBuffer = await getFile(document.s3Key);
    console.log(`✅ File retrieved from S3, size: ${fileBuffer.length} bytes`);

    // Extract text from document
    console.log(`📝 Extracting text from document: ${document.title} (${document.type})`);
    const text = await extractTextFromDocument(fileBuffer, document.type);
    
    // Log a preview of the document text (first 1000 characters)
    const textPreview = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
    console.log(`📄 DOCUMENT TEXT FOR PROCESSING:\n${textPreview}`);
    console.log(`✅ Text extraction complete, extracted ${text.length} characters`);

    // Create chunks for embedding
    console.log(`✂️ Creating text chunks for embedding`);
    const chunks = createChunks(text);
    console.log(`✅ Created ${chunks.length} chunks for embedding`);

    // Create embeddings for each chunk
    console.log(`🧠 Generating embeddings for ${chunks.length} chunks`);
    const embeddings = await createEmbeddings(chunks);
    console.log(`✅ Generated embeddings for ${embeddings.length} chunks`);

    // Store embeddings in vector database with metadata
    console.log(`💾 Storing embeddings in vector database`);
    try {
      await storeEmbeddingsInVectorDB(embeddings, {
        documentId: document.id,
        documentTitle: document.title,
        teamId: document.teamId,
        teamName: document.team.name,
        companyId: document.companyId || undefined, // Include company ID if available
        chunkCount: chunks.length,
      });
      console.log(`✅ Embeddings stored in vector database`);
      
      // Update document status to PROCESSED with vectorization
      console.log(`🔄 Updating document status to PROCESSED: ${documentId}`);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.PROCESSED,
          vectorized: true,
          vectorizedAt: new Date(),
        },
      });
    } catch (vectorError) {
      console.log(`⚠️ Vector storage failed but document processing will continue: ${documentId}`);
      
      // Update document status to PROCESSED without vectorization
      console.log(`🔄 Updating document status to PROCESSED (without vectorization): ${documentId}`);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.PROCESSED,
          vectorized: false,
          processingError: 'Document processed but not vectorized due to vector database error',
        },
      });
    }

    console.log(`✅ Document processed successfully: ${documentId}`);
  } catch (error) {
    console.error(`❌ Error processing document ${documentId}:`, error);

    // Update document status to FAILED
    console.log(`🔄 Updating document status to FAILED: ${documentId}`);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.FAILED,
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Create chunks from text for embedding
 * This is a simple implementation that splits by paragraphs and then by sentences
 * A more sophisticated implementation would use semantic chunking
 */
function createChunks(text: string, maxChunkSize: number = 1000): string[] {
  // Split by paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If paragraph is too long, split by sentences
    if (paragraph.length > maxChunkSize) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 1 <= maxChunkSize) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk);
          }
          
          // If a single sentence is too long, split it
          if (sentence.length > maxChunkSize) {
            const words = sentence.split(/\s+/);
            let sentenceChunk = '';
            
            for (const word of words) {
              if (sentenceChunk.length + word.length + 1 <= maxChunkSize) {
                sentenceChunk += (sentenceChunk ? ' ' : '') + word;
              } else {
                chunks.push(sentenceChunk);
                sentenceChunk = word;
              }
            }
            
            if (sentenceChunk) {
              currentChunk = sentenceChunk;
            } else {
              currentChunk = '';
            }
          } else {
            currentChunk = sentence;
          }
        }
      }
    } else {
      // If adding this paragraph would exceed the max chunk size, start a new chunk
      if (currentChunk.length + paragraph.length + 1 > maxChunkSize) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}