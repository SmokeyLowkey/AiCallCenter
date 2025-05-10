import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import OpenAI from "openai";
import pdfParse from 'pdf-parse';

// Promisify fs functions
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract text from a document based on its MIME type
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  console.log(`📄 Text extraction started for file type: ${mimeType}, size: ${fileBuffer.length} bytes`);
  try {
    // Create a temporary file path
    const tempDir = path.join(process.cwd(), 'tmp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      console.log(`📁 Creating temporary directory: ${tempDir}`);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`);
    console.log(`📝 Created temporary file path: ${tempFilePath}`);
    
    // Write buffer to temporary file
    console.log(`💾 Writing buffer to temporary file`);
    await writeFile(tempFilePath, fileBuffer);
    console.log(`✅ Buffer written to temporary file`);
    
    let text = '';
    
    // Extract text based on MIME type
    console.log(`🔍 Determining extraction method for MIME type: ${mimeType}`);
    if (mimeType.includes('pdf')) {
      console.log(`📑 Extracting text from PDF`);
      text = await extractFromPDF(tempFilePath);
    } else if (mimeType.includes('word') || mimeType.includes('docx')) {
      console.log(`📝 Extracting text from DOCX/Word document`);
      text = await extractFromDOCX(tempFilePath);
    } else if (mimeType.includes('text/plain') || mimeType.includes('txt')) {
      console.log(`📄 Extracting text from plain text file`);
      text = await extractFromText(tempFilePath);
    } else if (mimeType.includes('csv')) {
      console.log(`📊 Extracting text from CSV file`);
      text = await extractFromCSV(tempFilePath);
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('xlsx') || mimeType.includes('xls')) {
      console.log(`📊 Extracting text from Excel file`);
      text = await extractFromExcel(tempFilePath);
    } else {
      console.error(`❌ Unsupported file type: ${mimeType}`);
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
    console.log(`🧹 Cleaning up temporary file: ${tempFilePath}`);
    // Clean up temporary file
    await unlink(tempFilePath);
    console.log(`✅ Temporary file removed`);
    
    // Log a preview of the extracted text (first 500 characters)
    const textPreview = text.length > 500 ? text.substring(0, 500) + '...' : text;
    console.log(`📄 EXTRACTED TEXT PREVIEW:\n${textPreview}`);
    console.log(`✅ Text extraction completed, extracted ${text.length} characters`);
    return text;
  } catch (error) {
    console.error('❌ Error extracting text from document:', error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a PDF file using the pdf-parse library
 */
async function extractFromPDF(filePath: string): Promise<string> {
  try {
    console.log(`Extracting text from PDF: ${filePath}`);
    
    // Read the file as binary
    const buffer = await readFile(filePath);
    
    // Use pdf-parse to extract text from the PDF
    const data = await pdfParse(buffer, {
      // Optional: Limit the number of pages to parse
      // max: 10,
    });
    
    // Get the text content
    let extractedText = data.text || '';
    
    // If we couldn't extract anything meaningful, provide a fallback
    if (!extractedText || extractedText.length < 10) {
      console.log(`⚠️ Could not extract meaningful text from PDF, using filename as content`);
      return `Document: ${path.basename(filePath)}\n\nThis document appears to be a PDF file but text extraction was limited. The file may be password protected, corrupted, or contain primarily non-text content.`;
    }
    
    // Log a preview of the extracted text (first 500 characters)
    const textPreview = extractedText.length > 500 ? extractedText.substring(0, 500) + '...' : extractedText;
    console.log(`📄 EXTRACTED PDF TEXT PREVIEW:\n${textPreview}`);
    console.log(`✅ Extracted ${extractedText.length} characters from PDF file`);
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // If pdf-parse fails, try to use OpenAI for extraction if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log(`🤖 Attempting LLM-based PDF text extraction after pdf-parse failure`);
        
        // Read the file as base64 for OpenAI
        const buffer = await readFile(filePath);
        const base64Data = buffer.toString('base64');
        
        // Use OpenAI to extract text from the PDF
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: "You are a document text extractor. Extract all the text content from this PDF document. Return ONLY the extracted text content, nothing else."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Extract all text from this PDF document:" },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
        });
        
        const llmExtractedText = response.choices[0]?.message?.content?.trim() || '';
        
        if (llmExtractedText && llmExtractedText.length > 20) {
          console.log(`🤖 LLM successfully extracted text from PDF (${llmExtractedText.length} characters)`);
          return llmExtractedText;
        } else {
          console.log(`⚠️ LLM extraction returned insufficient text, falling back to default message`);
        }
      } catch (llmError) {
        console.error('❌ Error during LLM-based PDF text extraction:', llmError);
      }
    }
    
    // Fallback message if both pdf-parse and LLM extraction fail
    return `Document: ${path.basename(filePath)}\n\nThis document appears to be a PDF file but text extraction failed. The file may be password protected, corrupted, or in an unsupported format.`;
  }
}

/**
 * Extract text from a DOCX file
 * Note: In a production environment, you would use a proper DOCX parsing library
 */
async function extractFromDOCX(filePath: string): Promise<string> {
  try {
    // For now, we'll read the file as binary and extract any text we can find
    console.log(`Extracting text from DOCX: ${filePath}`);
    
    // Read the file as binary
    const buffer = await readFile(filePath);
    
    // Convert buffer to string and extract text
    // This is a simple approach that works for basic DOCX files
    // In a real implementation, you would use a library like mammoth
    const content = buffer.toString('utf8');
    
    // Extract text between tags or look for plain text sections
    let extractedText = '';
    
    try {
      // Try multiple patterns to extract text from DOCX files
      
      // First attempt: Look for <w:t> tags (most common in newer DOCX files)
      const textTagMatches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      
      if (textTagMatches.length > 0) {
        // Extract the text from inside the tags
        const actualTextContent = textTagMatches
          .map(tag => {
            // Extract content between <w:t> and </w:t>
            const match = tag.match(/<w:t[^>]*>(.*?)<\/w:t>/);
            return match ? match[1] : '';
          })
          .filter(text => text.trim().length > 0)
          .join(' ');
        
        console.log(`🔍 Found ${textTagMatches.length} text tags with actual document content`);
        extractedText = actualTextContent;
      } else {
        // Second attempt: Look for paragraphs (common in some DOCX files)
        const paragraphMatches = content.match(/<w:p\b[^>]*>.*?<\/w:p>/g) || [];
        
        if (paragraphMatches.length > 0) {
          console.log(`🔍 Found ${paragraphMatches.length} paragraph tags, extracting text from them`);
          
          // Extract text from paragraphs
          const paragraphText = paragraphMatches
            .map(para => {
              // Remove all XML tags and keep only text
              return para.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            })
            .filter(text => text.trim().length > 0)
            .join('\n\n');
          
          if (paragraphText.trim().length > 0) {
            extractedText = paragraphText;
          } else {
            console.log(`⚠️ Could not extract text from paragraphs, falling back to general text extraction`);
          }
        } else {
          console.log(`⚠️ Could not find text tags or paragraphs, falling back to general text extraction`);
        }
      }
      
      // If we still don't have any text, try LLM-based extraction before falling back to general extraction
      if (!extractedText || extractedText.trim().length === 0) {
        // Try LLM-based extraction if we have an API key
        if (process.env.OPENAI_API_KEY) {
          try {
            console.log(`🤖 Attempting LLM-based text extraction`);
            
            // Get a sample of the content (to avoid token limits)
            const contentSample = content.substring(0, 10000);
            
            // Use OpenAI to extract meaningful text
            const llmResponse = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a document text extractor. Your task is to analyze the provided content from a DOCX file and extract only the meaningful text content, ignoring XML tags, metadata, and binary data. Return ONLY the extracted text content, nothing else."
                },
                {
                  role: "user",
                  content: `Extract the meaningful text from this DOCX file content:\n\n${contentSample}`
                }
              ],
              temperature: 0.1,
              max_tokens: 1000
            });
            
            const llmExtractedText = llmResponse.choices[0]?.message?.content?.trim() || '';
            
            if (llmExtractedText && llmExtractedText.length > 20) {
              console.log(`🤖 LLM successfully extracted text (${llmExtractedText.length} characters)`);
              extractedText = llmExtractedText;
            } else {
              console.log(`⚠️ LLM extraction returned insufficient text, falling back to general extraction`);
            }
          } catch (llmError) {
            console.error('❌ Error during LLM-based text extraction:', llmError);
            console.log(`⚠️ Falling back to general text extraction due to LLM error`);
          }
        }
      }
      
      // If LLM extraction also failed, fall back to general extraction
      if (!extractedText || extractedText.trim().length === 0) {
        
        // Look for text content in the binary data
        const textMatches = content.match(/[\x20-\x7E\s]{5,}/g) || [];
        
        // Filter out XML tags, binary data, and other non-readable content
        const filteredMatches = textMatches.filter(match => {
          // Skip XML tags and binary data
          if (match.includes('<?xml') ||
              match.includes('<w:') ||
              match.includes('Content_Types') ||
              match.includes('_rels') ||
              match.includes('word/document.xml') ||
              match.includes('word/footnotes.xml') ||
              match.includes('word/endnotes.xml') ||
              match.includes('word/header') ||
              match.includes('word/footer') ||
              match.includes('word/media') ||
              match.includes('http://') ||
              match.includes('xmlns:') ||
              match.match(/[^\x20-\x7E\s]{3,}/) || // Contains 3+ non-ASCII chars in a row
              match.split('\n').length > match.length / 10) { // Too many newlines
            return false;
          }
          
          // Keep only text that looks like real content
          return (
            // Has some lowercase letters (likely real text)
            match.match(/[a-z]{3,}/) &&
            // Not too many special characters
            (match.match(/[a-zA-Z0-9]/g)?.length || 0) > match.length / 3
          );
        });
        
        console.log(`🔍 Found ${textMatches.length} text segments, filtered to ${filteredMatches.length} readable segments`);
        extractedText = filteredMatches.join('\n\n');
      }
    } catch (extractError) {
      console.error('❌ Error during advanced text extraction:', extractError);
      
      // Fallback to basic extraction if advanced extraction fails
      const textMatches = content.match(/[\x20-\x7E\s]{5,}/g) || [];
      const basicFilteredMatches = textMatches.filter(match =>
        !match.includes('<') && !match.includes('>') && match.match(/[a-z]{3,}/)
      );
      
      console.log(`⚠️ Falling back to basic extraction: ${basicFilteredMatches.length} segments`);
      extractedText = basicFilteredMatches.join('\n\n');
    }
    
    // If we couldn't extract anything meaningful, provide a fallback
    if (!extractedText || extractedText.length < 10) {
      console.log(`⚠️ Could not extract meaningful text from DOCX, using filename as content`);
      return `Document: ${path.basename(filePath)}\n\nThis document appears to be a DOCX file but text extraction was limited. The file may be password protected, corrupted, or contain primarily non-text content.`;
    }
    
    // Log a preview of the extracted text (first 500 characters)
    const textPreview = extractedText.length > 500 ? extractedText.substring(0, 500) + '...' : extractedText;
    console.log(`📄 EXTRACTED DOCX TEXT PREVIEW:\n${textPreview}`);
    console.log(`✅ Extracted ${extractedText.length} characters from DOCX file`);
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
}

/**
 * Extract text from a plain text file
 */
async function extractFromText(filePath: string): Promise<string> {
  try {
    // Read the file directly
    const content = await readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error extracting text from text file:', error);
    throw error;
  }
}

/**
 * Extract text from a CSV file
 * Note: In a production environment, you would use a proper CSV parsing library
 */
async function extractFromCSV(filePath: string): Promise<string> {
  try {
    // For demonstration purposes, we'll use a simple approach
    // In a real implementation, you would use a library like csv-parse
    console.log(`Extracting text from CSV: ${filePath}`);
    
    // Read the file directly
    const content = await readFile(filePath, 'utf8');
    
    // Convert CSV to a more readable format
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    
    let result = '';
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      result += 'Record ' + i + ':\n';
      
      for (let j = 0; j < headers.length; j++) {
        result += `${headers[j]}: ${values[j] || ''}\n`;
      }
      
      result += '\n';
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    throw error;
  }
}

/**
 * Extract text from an Excel file (XLSX/XLS)
 * Note: In a production environment, you would use a proper Excel parsing library
 */
async function extractFromExcel(filePath: string): Promise<string> {
  try {
    // For now, we'll read the file as binary and extract any text we can find
    console.log(`Extracting text from Excel: ${filePath}`);
    
    // Read the file as binary
    const buffer = await readFile(filePath);
    
    // Convert buffer to string and extract text
    // This is a simple approach that works for basic Excel files
    // In a real implementation, you would use a library like xlsx or exceljs
    const content = buffer.toString('utf8');
    
    // Extract text between tags or look for plain text sections
    let extractedText = '';
    
    // Look for text content in the binary data
    // This is a very simplified approach
    const textMatches = content.match(/[\x20-\x7E\s]{5,}/g);
    
    if (textMatches) {
      // Filter out XML tags, binary data, and other non-readable content
      const filteredMatches = textMatches.filter(match => {
        // Skip XML tags and binary data
        if (match.includes('<?xml') ||
            match.includes('<x:') ||
            match.includes('<workbook') ||
            match.includes('<sheet') ||
            match.includes('Content_Types') ||
            match.includes('_rels') ||
            match.includes('http://') ||
            match.match(/[^\x20-\x7E\s]{3,}/) || // Contains 3+ non-ASCII chars in a row
            match.split('\n').length > match.length / 10) { // Too many newlines
          return false;
        }
        
        // Keep only text that looks like real content
        return (
          // Has some alphanumeric characters (likely real text)
          (match.match(/[a-zA-Z0-9]/g)?.length || 0) > 5 &&
          // Not too many special characters
          (match.match(/[a-zA-Z0-9]/g)?.length || 0) > match.length / 3
        );
      });
      
      console.log(`🔍 Found ${textMatches.length} text segments, filtered to ${filteredMatches.length} readable segments`);
      extractedText = filteredMatches.join('\n\n');
    }
    
    // If we couldn't extract anything meaningful, provide a fallback
    if (!extractedText || extractedText.length < 10) {
      console.log(`⚠️ Could not extract meaningful text from Excel, using filename as content`);
      return `Document: ${path.basename(filePath)}\n\nThis document appears to be an Excel file but text extraction was limited. The file may be password protected, corrupted, or contain primarily non-text content.`;
    }
    
    // Log a preview of the extracted text (first 500 characters)
    const textPreview = extractedText.length > 500 ? extractedText.substring(0, 500) + '...' : extractedText;
    console.log(`📄 EXTRACTED EXCEL TEXT PREVIEW:\n${textPreview}`);
    console.log(`✅ Extracted ${extractedText.length} characters from Excel file`);
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from Excel:', error);
    throw error;
  }
}