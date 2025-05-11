import { NextRequest, NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

// This is a simple test endpoint to verify that Twilio can reach your server
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', message: 'Twilio test endpoint is working' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to test-twilio endpoint');
    
    // Create a simple TwiML response
    const twiml = new VoiceResponse();
    twiml.say('This is a test response from your server. The connection is working correctly.');
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in test-twilio endpoint:', error);
    
    // Create a simple error response
    const twiml = new VoiceResponse();
    twiml.say('There was an error processing your request.');
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}