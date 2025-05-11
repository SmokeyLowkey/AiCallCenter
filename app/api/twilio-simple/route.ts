import { NextRequest, NextResponse } from 'next/server';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

// This is a simplified Twilio webhook handler without database or Socket.IO dependencies
export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to twilio-simple endpoint');
    
    // Parse the form data from Twilio
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    
    console.log(`Simple handler - Call: ${callSid} from ${from} to ${to}`);

    // Create a new TwiML response
    const twiml = new VoiceResponse();
    
    // Add a simple greeting
    twiml.say('Thank you for calling. This is a simplified response from your server.');
    
    // Add a pause
    twiml.pause({ length: 1 });
    
    // Add another message
    twiml.say('Your call is being processed through the simplified handler.');
    
    // End the call
    twiml.hangup();
    
    // Return the TwiML response
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error in simplified Twilio handler:', error);
    
    // Create a TwiML response for the error case
    const twiml = new VoiceResponse();
    twiml.say(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    message: 'Simplified Twilio handler is ready. Use POST for actual Twilio requests.'
  });
}