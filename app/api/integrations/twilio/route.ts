import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import twilio from 'twilio';

// GET: Fetch Twilio integration settings
export async function GET(request: NextRequest) {
  try {
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // If no token is provided, return a default response
    // This allows the page to load without authentication errors
    if (!token || !token.sub) {
      return NextResponse.json(
        { status: 'disconnected', message: 'No authentication token provided' },
        { status: 200 }
      );
    }

    // Get the team ID from the query parameters
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
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

    if (!integration) {
      return NextResponse.json(
        { status: 'not-connected' }
      );
    }

    // Return the integration status and configuration
    return NextResponse.json({
      status: integration.status,
      config: integration.config,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching Twilio integration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twilio integration' },
      { status: 500 }
    );
  }
}

// POST: Create or update Twilio integration
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
    let { teamId, accountSid, authToken, webhooks, config } = data;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Missing required fields: Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    // Store webhook configuration for later use
    const webhookConfig = webhooks || [];
    
    // Store additional configuration
    const twilioConfig = config || {};

    // Validate the Twilio credentials
    try {
      const twilioClient = twilio(accountSid, authToken);
      await twilioClient.api.accounts(accountSid).fetch();
    } catch (twilioError) {
      return NextResponse.json(
        { error: 'Invalid Twilio credentials' },
        { status: 400 }
      );
    }

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

    // If teamId is not provided or the team doesn't exist, create or use a default team
    let team;
    if (!teamId) {
      // Check if user already has a team
      if (user.teamId) {
        teamId = user.teamId;
        team = user.team;
      } else {
        // Create a default team for the user
        team = await prisma.team.create({
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
    } else {
      // Check if the specified team exists
      team = await prisma.team.findUnique({
        where: { id: teamId }
      });
      
      if (!team) {
        // Create the team with the specified ID
        team = await prisma.team.create({
          data: {
            id: teamId,
            name: `${user.name || 'Default'}'s Team`,
            description: 'Team created for Twilio integration',
            ownerId: user.id,
            members: {
              connect: { id: user.id }
            }
          }
        });
      }
    }

    // Check if the integration already exists
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        teamId,
        name: 'Twilio',
      },
    });

    // Store Twilio credentials in environment variables
    // In a production environment, you would use a secure vault
    process.env.TWILIO_ACCOUNT_SID = accountSid;
    process.env.TWILIO_AUTH_TOKEN = authToken;

    // In a real application, you would configure the webhooks in Twilio
    // For this example, we'll just log them
    console.log('Webhook configuration:', webhookConfig);
    console.log('Twilio configuration:', twilioConfig);
    
    // If we had a Twilio phone number, we would configure it like this:
    // const twilioClient = twilio(accountSid, authToken);
    // const phoneNumbers = await twilioClient.incomingPhoneNumbers.list();
    // if (phoneNumbers.length > 0) {
    //   await twilioClient.incomingPhoneNumbers(phoneNumbers[0].sid).update({
    //     voiceUrl: webhookConfig.find(w => w.name === 'Voice Incoming')?.url,
    //     statusCallbackUrl: webhookConfig.find(w => w.name === 'Voice Status')?.url,
    //   });
    // }

    if (existingIntegration) {
      // Update existing integration
      const integration = await prisma.integration.update({
        where: {
          id: existingIntegration.id,
        },
        data: {
          status: 'Connected',
          config: {
            accountSid,
            authToken: authToken.substring(0, 5) + '***', // Store partial token for security
            webhooks: webhookConfig,
            ...twilioConfig
          },
        },
      });
      
      return NextResponse.json({
        status: 'connected',
        message: 'Twilio integration updated successfully',
      });
    } else {
      // Create new integration
      const integration = await prisma.integration.create({
        data: {
          name: 'Twilio',
          type: 'Calling',
          status: 'Connected',
          config: {
            accountSid,
            authToken: authToken.substring(0, 5) + '***', // Store partial token for security
            webhooks: webhookConfig,
            ...twilioConfig
          },
          team: {
            connect: {
              id: teamId,
            },
          },
        },
      });
      
      return NextResponse.json({
        status: 'connected',
        message: 'Twilio integration configured successfully',
      });
    }

    // Store the actual auth token in environment variables or a secure vault in a production environment
    // For this example, we'll just use the partial token in the database

    return NextResponse.json({
      status: 'connected',
      message: 'Twilio integration configured successfully',
    });
  } catch (error) {
    console.error('Error configuring Twilio integration:', error);
    return NextResponse.json(
      { error: 'Failed to configure Twilio integration' },
      { status: 500 }
    );
  }
}

// DELETE: Remove Twilio integration
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

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
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

    if (!integration) {
      return NextResponse.json(
        { error: 'Twilio integration not found' },
        { status: 404 }
      );
    }

    // Delete the integration
    await prisma.integration.delete({
      where: {
        id: integration.id,
      },
    });

    return NextResponse.json({
      message: 'Twilio integration removed successfully',
    });
  } catch (error) {
    console.error('Error removing Twilio integration:', error);
    return NextResponse.json(
      { error: 'Failed to remove Twilio integration' },
      { status: 500 }
    );
  }
}