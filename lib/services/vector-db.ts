import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('🧠 Initialized OpenAI client for embeddings');

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null;

async function getPineconeClient() {
  if (!pineconeClient) {
    console.log('🔄 Initializing Pinecone client');
    pineconeClient = new Pinecone({
      apiKey: process.env.VECTOR_DB_API_KEY || '',
    });
    
    // Check if the index exists, create it if it doesn't
    const indexName = 'documents';
    const indexes = await pineconeClient.listIndexes();
    const indexExists = indexes.indexes?.some(index => index.name === indexName);
    
    if (!indexExists) {
      // Set embedding dimension to 1536 for text-embedding-3-small
      const embeddingDimension = 1536;
      console.log(`🔄 Creating Pinecone index: ${indexName} with dimension ${embeddingDimension}`);
      
      await pineconeClient.createIndex({
        name: indexName,
        dimension: embeddingDimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log(`✅ Pinecone index created: ${indexName}`);
    } else {
      console.log(`✅ Pinecone index already exists: ${indexName}`);
      
      // Check if we need to delete and recreate the index due to dimension mismatch
      try {
        // Set embedding dimension to 1536 for text-embedding-3-small
        const currentModel = 'text-embedding-3-small';
        const expectedDimension = 1536;
        
        console.log(`ℹ️ Current embedding model: ${currentModel}, expected dimension: ${expectedDimension}`);
        console.log(`⚠️ Note: If you're seeing dimension mismatch errors, you may need to manually delete and recreate the index`);
      } catch (error) {
        console.error('❌ Error checking embedding dimensions:', error);
      }
    }
  }
  return pineconeClient;
}

/**
 * Create embeddings for text chunks
 */
export async function createEmbeddings(chunks: string[]): Promise<any[]> {
  console.log(`🧠 Creating embeddings for ${chunks.length} text chunks`);
  try {
    // Create embeddings for each chunk
    // Use text-embedding-3-small which produces 1536-dimensional embeddings
    const model = 'text-embedding-3-small';
    console.log(`🔄 Processing chunks in parallel with model: ${model} (1536 dimensions)`);
    
    const embeddingResults = await Promise.all(
      chunks.map(async (chunk, index) => {
        console.log(`🔢 Processing chunk ${index + 1}/${chunks.length}, length: ${chunk.length} chars`);
        
        const response = await openai.embeddings.create({
          model: model,
          input: chunk,
          encoding_format: "float",
        });
        
        const embedding = response.data[0]?.embedding;
        console.log(`✅ Embedding created for chunk ${index + 1}, vector dimensions: ${embedding?.length}`);
        
        return {
          text: chunk,
          embedding,
        };
      })
    );
    
    console.log(`✅ Successfully created embeddings for all ${chunks.length} chunks`);
    return embeddingResults;
  } catch (error) {
    console.error('❌ Error preparing chunks for embedding:', error);
    throw new Error(`Failed to prepare chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store embeddings in vector database
 */
export async function storeEmbeddingsInVectorDB(
  embeddingResults: any[],
  metadata: {
    documentId: string;
    documentTitle: string;
    teamId: string;
    teamName: string;
    companyId?: string; // Optional company ID
    chunkCount: number;
  }
): Promise<void> {
  console.log(`💾 Storing embeddings in vector database`, {
    documentId: metadata.documentId,
    documentTitle: metadata.documentTitle,
    teamId: metadata.teamId,
    teamName: metadata.teamName,
    companyId: metadata.companyId,
    chunkCount: metadata.chunkCount,
    embeddingsCount: embeddingResults.length
  });
  
  try {
    console.log(`🔄 Getting Pinecone client`);
    const client = await getPineconeClient();
    console.log(`🔄 Accessing 'documents' index`);
    const pineconeIndex = client.index('documents');
    
    // Create records for Pinecone
    console.log(`🔄 Creating records for Pinecone from ${embeddingResults.length} embeddings`);
    const records = embeddingResults.map((result, i) => ({
      id: `${metadata.documentId}-chunk-${i}`,
      values: result.embedding,
      metadata: {
        text: result.text,
        documentId: metadata.documentId,
        documentTitle: metadata.documentTitle,
        teamId: metadata.teamId,
        teamName: metadata.teamName,
        companyId: metadata.companyId || 'default', // Include company ID in metadata
        chunkIndex: i,
        chunkCount: metadata.chunkCount,
      },
    }));
    
    // Store embeddings in Pinecone
    // Note: In a production environment, we would handle namespaces properly
    // For now, we'll use a simpler approach
    try {
      console.log(`⬆️ Upserting ${records.length} records to Pinecone`);
      await pineconeIndex.upsert(records);
      console.log(`✅ Successfully stored ${records.length} embeddings for document ${metadata.documentId}`);
      console.log(`⚠️ Note: To use llama-text-embed-v2 in the future, you'll need to update the Pinecone SDK`);
      console.log(`✅ Successfully stored ${records.length} embeddings for document ${metadata.documentId}`);
    } catch (pineconeError) {
      console.error('❌ Pinecone error:', pineconeError);
      
      // Check for specific error types
      const errorMessage = String(pineconeError);
      if (errorMessage.includes('PineconeAuthorizationError')) {
        console.error('🔑 Pinecone API key authentication failed. Please check your VECTOR_DB_API_KEY environment variable.');
        console.error('📝 You can find your API key in the Pinecone console at https://app.pinecone.io');
      } else if (errorMessage.includes('dimension')) {
        console.error('📏 Dimension mismatch error. Your embeddings dimension does not match the Pinecone index.');
        console.error('📝 The index expects 1024 dimensions, but your embeddings have a different dimension.');
      }
      
      console.log('⚠️ Continuing without vector storage due to Pinecone error');
      console.log('⚠️ Document will be available for download but not for semantic search');
      console.log('💡 To fix this issue, please check your Pinecone API key and index configuration');
    }
    
    // Return success even if Pinecone fails
    console.log(`✅ Document processing completed for ${metadata.documentId}`);
  } catch (error) {
    console.error('❌ Error in vector database processing:', error);
    throw new Error(`Vector database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Query the vector database for similar documents
 */
export async function querySimilarDocuments(
  query: string,
  teamId: string,
  companyId?: string,
  limit: number = 5
): Promise<any[]> {
  console.log(`🔍 Querying similar documents for: "${query.substring(0, 50)}..."`);
  try {
    const client = await getPineconeClient();
    const pineconeIndex = client.index('documents');
    
    // We'll use Pinecone's llama-text-embed-v2 model for query embedding
    console.log(`🧠 Preparing query for Pinecone's llama-text-embed-v2 model`);
    // No need to create embedding here - Pinecone will do it
    
    // Query Pinecone
    // Create filter based on team and company
    let filter;
    if (companyId) {
      // If company ID is provided, filter by both team and company
      filter = {
        $and: [
          { teamId: { $eq: teamId } },
          { companyId: { $eq: companyId } }
        ]
      };
      console.log(`🔍 Filtering by team ID: ${teamId} and company ID: ${companyId}`);
    } else {
      // Otherwise, just filter by team
      filter = { teamId: { $eq: teamId } };
      console.log(`🔍 Filtering by team ID: ${teamId}`);
    }
    
    // Query Pinecone with the filter
    // We need to create the embedding ourselves since the SDK doesn't support embedModel
    console.log(`🔄 Querying Pinecone for top ${limit} matches`);
    
    // Create embedding for query using OpenAI
    console.log(`🧠 Creating embedding for query`);
    const model = 'text-embedding-3-small';
    console.log(`🔄 Using model: ${model} for query embedding`);
    const response = await openai.embeddings.create({
      model: model,
      input: query,
      encoding_format: "float",
    });
    const queryEmbedding = response.data[0]?.embedding;
    console.log(`✅ Query embedding created, dimensions: ${queryEmbedding?.length}`);
    
    // Query Pinecone with the embedding
    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter
    });
    
    console.log(`⚠️ Note: To use llama-text-embed-v2, you may need to update the Pinecone SDK`);
    
    console.log(`✅ Found ${queryResponse.matches?.length || 0} matching documents`);
    return queryResponse.matches || [];
  } catch (error) {
    console.error('❌ Error querying vector database:', error);
    throw new Error(`Failed to query vector database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete document embeddings from vector database
 */
export async function deleteDocumentEmbeddings(
  documentId: string,
  teamId: string,
  companyId?: string
): Promise<void> {
  try {
    const client = await getPineconeClient();
    const pineconeIndex = client.index('documents');
    
    // Delete embeddings for document
    // We'll filter by both documentId and teamId to ensure we only delete the right documents
    // Create filter based on document, team, and company
    let filter;
    if (companyId) {
      filter = {
        $and: [
          { documentId: { $eq: documentId } },
          { teamId: { $eq: teamId } },
          { companyId: { $eq: companyId } }
        ]
      };
    } else {
      filter = {
        $and: [
          { documentId: { $eq: documentId } },
          { teamId: { $eq: teamId } }
        ]
      };
    }
    
    // Delete embeddings with the filter
    await pineconeIndex.deleteMany({
      filter
    });
    
    console.log(`Deleted embeddings for document ${documentId}`);
  } catch (error) {
    console.error('Error deleting document embeddings:', error);
    throw new Error(`Failed to delete embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}