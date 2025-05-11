import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import twilio from 'twilio';

// GET: List Twilio phone numbers for a team
export async function GET(request: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the team ID from the query parameters
    const { searchParams } = new URL(request.url);
    let teamId = searchParams.get('teamId');
    const country = searchParams.get('country') || 'US';
    const areaCode = searchParams.get('areaCode');
    const listAvailable = searchParams.get('listAvailable') === 'true';

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { team: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If teamId is not provided, use the user's team or create a default team
    if (!teamId) {
      if (user.teamId) {
        teamId = user.teamId;
      } else {
        // Create a default team for the user
        const team = await prisma.team.create({
          data: {
            name: `${user.name || 'Default'}'s Team`,
            description: 'Default team created for Twilio integration',
            ownerId: user.id,
            members: {
              connect: { id: user.id }
            }
          }
        });
        
        // Update the user with the new team
        await prisma.user.update({
          where: { id: user.id },
          data: { teamId: team.id }
        });
        
        teamId = team.id;
      }
    }

    // For demo purposes, return mock data if Twilio credentials are not set up
    // This allows the UI to work without actual Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Using mock Twilio data - no credentials found');
      
      if (listAvailable) {
        return NextResponse.json({
          availableNumbers: [
            {
              phoneNumber: "+1234567890",
              friendlyName: "Demo Number 1",
              locality: "San Francisco",
              region: "CA",
              isoCountry: "US",
              capabilities: { voice: true, sms: true, mms: false }
            },
            {
              phoneNumber: "+1987654321",
              friendlyName: "Demo Number 2",
              locality: "New York",
              region: "NY",
              isoCountry: "US",
              capabilities: { voice: true, sms: true, mms: true }
            }
          ]
        });
      } else {
        return NextResponse.json({
          phoneNumbers: [
            {
              sid: "PN123456789",
              phoneNumber: "+1234567890",
              friendlyName: "Support Line",
              dateCreated: new Date().toISOString(),
              capabilities: { voice: true, sms: true, mms: false },
              voiceUrl: "https://example.com/voice",
              smsUrl: "https://example.com/sms"
            }
          ]
        });
      }
    }

    // Find the Twilio integration for the team
    const integration = await prisma.integration.findFirst({
      where: {
        teamId,
        name: 'Twilio',
      },
    });

    if (!integration || integration.status !== 'Connected') {
      return NextResponse.json(
        { error: 'Twilio integration not found or not connected' },
        { status: 404 }
      );
    }

    // Get the Twilio credentials from the integration config
    const config = integration.config as any;
    const accountSid = config.accountSid;
    
    // In a real application, you would retrieve the auth token from a secure storage
    // For this example, we'll use the environment variable
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Twilio auth token not found in environment variables' },
        { status: 500 }
      );
    }

    // Initialize the Twilio client
    const twilioClient = twilio(accountSid, authToken);

    if (listAvailable) {
      // List available phone numbers
      const searchParams: any = {
        limit: 20,
      };

      if (areaCode) {
        searchParams.areaCode = areaCode;
      }

      const availableNumbers = await twilioClient.availablePhoneNumbers(country).local.list(searchParams);

      return NextResponse.json({
        availableNumbers: availableNumbers.map(number => ({
          phoneNumber: number.phoneNumber,
          friendlyName: number.friendlyName,
          locality: number.locality,
          region: number.region,
          isoCountry: number.isoCountry,
          capabilities: number.capabilities,
        })),
      });
    } else {
      // List the team's existing phone numbers
      const incomingPhoneNumbers = await twilioClient.incomingPhoneNumbers.list({
        limit: 50,
      });

      return NextResponse.json({
        phoneNumbers: incomingPhoneNumbers.map(number => ({
          sid: number.sid,
          phoneNumber: number.phoneNumber,
          friendlyName: number.friendlyName,
          dateCreated: number.dateCreated,
          capabilities: number.capabilities,
          voiceUrl: number.voiceUrl,
          smsUrl: number.smsUrl,
        })),
      });
    }
  } catch (error) {
    console.error('Error fetching Twilio phone numbers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twilio phone numbers' },
      { status: 500 }
    );
  }
}

// POST: Purchase a new phone number or update an existing one
export async function POST(request: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { teamId, phoneNumber, friendlyName, action } = data;

    if (!teamId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the Twilio integration for the team
    const integration = await prisma.integration.findFirst({
      where: {
        teamId,
        name: 'Twilio',
      },
    });

    if (!integration || integration.status !== 'Connected') {
      return NextResponse.json(
        { error: 'Twilio integration not found or not connected' },
        { status: 404 }
      );
    }

    // Get the Twilio credentials from the integration config
    const config = integration.config as any;
    const accountSid = config.accountSid;
    
    // In a real application, you would retrieve the auth token from a secure storage
    // For this example, we'll use the environment variable
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Twilio auth token not found in environment variables' },
        { status: 500 }
      );
    }

    // Initialize the Twilio client
    const twilioClient = twilio(accountSid, authToken);

    // Set up the webhook URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const voiceWebhookUrl = `${baseUrl}/api/integrations/twilio/voice/incoming`;
    const statusCallbackUrl = `${baseUrl}/api/integrations/twilio/voice/status`;

    if (action === 'purchase') {
      // Purchase a new phone number
      const purchasedNumber = await twilioClient.incomingPhoneNumbers.create({
        phoneNumber,
        friendlyName: friendlyName || `Team ${teamId} Number`,
        voiceUrl: voiceWebhookUrl,
        statusCallback: statusCallbackUrl,
      });

      return NextResponse.json({
        message: 'Phone number purchased successfully',
        phoneNumber: purchasedNumber,
      });
    } else if (action === 'update' && data.sid) {
      // Update an existing phone number
      const updatedNumber = await twilioClient.incomingPhoneNumbers(data.sid).update({
        friendlyName: friendlyName || `Team ${teamId} Number`,
        voiceUrl: voiceWebhookUrl,
        statusCallback: statusCallbackUrl,
      });

      return NextResponse.json({
        message: 'Phone number updated successfully',
        phoneNumber: updatedNumber,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error managing Twilio phone number:', error);
    return NextResponse.json(
      { error: 'Failed to manage Twilio phone number' },
      { status: 500 }
    );
  }
}

// DELETE: Release a phone number
export async function DELETE(request: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const sid = searchParams.get('sid');

    if (!teamId || !sid) {
      return NextResponse.json(
        { error: 'Team ID and phone number SID are required' },
        { status: 400 }
      );
    }

    // Find the Twilio integration for the team
    const integration = await prisma.integration.findFirst({
      where: {
        teamId,
        name: 'Twilio',
      },
    });

    if (!integration || integration.status !== 'Connected') {
      return NextResponse.json(
        { error: 'Twilio integration not found or not connected' },
        { status: 404 }
      );
    }

    // Get the Twilio credentials from the integration config
    const config = integration.config as any;
    const accountSid = config.accountSid;
    
    // In a real application, you would retrieve the auth token from a secure storage
    // For this example, we'll use the environment variable
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Twilio auth token not found in environment variables' },
        { status: 500 }
      );
    }

    // Initialize the Twilio client
    const twilioClient = twilio(accountSid, authToken);

    // Release the phone number
    await twilioClient.incomingPhoneNumbers(sid).remove();

    return NextResponse.json({
      message: 'Phone number released successfully',
    });
  } catch (error) {
    console.error('Error releasing Twilio phone number:', error);
    return NextResponse.json(
      { error: 'Failed to release Twilio phone number' },
      { status: 500 }
    );
  }
}