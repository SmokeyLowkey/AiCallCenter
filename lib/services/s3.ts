import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: 'ca-central-1', // Updated to match the bucket's region
  credentials: {
    accessKeyId: process.env.AWS_MANAGER_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_MANAGER_SECRET_ACCESS_KEY || '',
  },
});

console.log('🔄 Initialized S3 client with region:', 'ca-central-1');

const bucketName = process.env.S3_BUCKET || '';

/**
 * Generate a unique S3 key for a document
 * Format: teams/{teamId}/documents/{categoryId}/{fileName}
 */
export const generateS3Key = (
  teamId: string,
  categoryId: string | null,
  fileName: string
): string => {
  const categoryPath = categoryId ? `categories/${categoryId}` : 'uncategorized';
  return `teams/${teamId}/${categoryPath}/${Date.now()}-${fileName}`;
};

/**
 * Upload a file to S3
 */
export const uploadFile = async (
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  console.log('📤 S3 uploadFile: Starting upload', {
    key,
    contentType,
    fileSize: file.length,
    bucketName
  });

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  try {
    console.log('📤 S3 uploadFile: Sending PutObjectCommand');
    await s3Client.send(new PutObjectCommand(params));
    console.log('✅ S3 uploadFile: Upload successful', { key });
    return key;
  } catch (error) {
    console.error('❌ S3 uploadFile: Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Get a presigned URL for downloading a file
 * The URL will expire after the specified time
 */
export const getPresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (key: string): Promise<void> => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Get a file from S3
 */
export const getFile = async (key: string): Promise<Buffer> => {
  console.log('📥 S3 getFile: Starting file retrieval', { key, bucketName });
  
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    console.log('📥 S3 getFile: Sending GetObjectCommand');
    const { Body } = await s3Client.send(new GetObjectCommand(params));
    
    if (!Body) {
      console.error('❌ S3 getFile: Empty response body');
      throw new Error('Empty response body');
    }
    
    console.log('📥 S3 getFile: Response received, converting stream to buffer');
    // Convert the readable stream to a buffer
    const bufferChunks = await streamToBuffer(Body as any);
    const buffer = Buffer.concat(bufferChunks);
    console.log('✅ S3 getFile: File retrieved successfully', { key, bufferSize: buffer.length });
    
    return buffer;
  } catch (error) {
    console.error('❌ S3 getFile: Error retrieving file from S3:', error);
    throw new Error('Failed to retrieve file from S3');
  }
};

/**
 * Helper function to convert a readable stream to a buffer
 */
const streamToBuffer = async (stream: NodeJS.ReadableStream): Promise<Buffer[]> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(chunks));
  });
};

/**
 * Check if a team has access to a document
 */
export const checkTeamAccess = (documentTeamId: string, userTeamId: string): boolean => {
  // For now, simple check if the team IDs match
  // In the future, this could be expanded to support shared access between teams
  return documentTeamId === userTeamId;
};