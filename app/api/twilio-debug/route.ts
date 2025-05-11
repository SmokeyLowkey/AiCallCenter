import { NextRequest, NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import fs from 'fs';
import path from 'path';

// This endpoint will log all incoming requests and return a simple TwiML response
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body
    const rawBody = await request.text();
    
    // Parse the form data
    const formData = await request.formData();
    
    // Convert formData to a regular object
    const formDataObj: Record<string, any> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    
    // Get request headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Create a log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      headers,
      formData: formDataObj,
      rawBody
    };
    
    // Log to console
    console.log('Twilio Debug Request:', JSON.stringify(logEntry, null, 2));
    
    // Try to write to a log file (this may fail in some environments)
    try {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, 'twilio-debug.log');
      fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n\n');
    } catch (fileError) {
      console.error('Error writing to log file:', fileError);
    }
    
    // Create a TwiML response
    const twiml = new VoiceResponse();
    twiml.say('Debug endpoint reached. Check your server logs for details.');
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in twilio-debug endpoint:', error);
    
    // Log the error
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
    
    console.log('Twilio Debug Error:', JSON.stringify(errorLog, null, 2));
    
    // Create a simple error response
    const twiml = new VoiceResponse();
    twiml.say(`Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// Also handle GET requests for testing in browser
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Twilio debug endpoint is working. Use POST for actual Twilio requests.'
  });
}