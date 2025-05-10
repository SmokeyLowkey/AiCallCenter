import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 7;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all agents with their performance metrics
    const agents = await prisma.user.findMany({
      where: {
        // Only include agents who have handled calls
        callsHandled: {
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        jobTitle: true,
        callsHandled: true,
        avgCallDuration: true,
        resolutionRate: true,
        satisfactionScore: true,
        aiUsageRate: true,
        // Get calls handled in the specified period
        handledCalls: {
          where: {
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            id: true,
            resolution: true,
            duration: true,
            sentiment: true
          }
        }
      },
      orderBy: [
        { resolutionRate: 'desc' },
        { satisfactionScore: 'desc' }
      ],
      take: limit
    });
    
    // Format the response
    const formattedAgents = agents.map(agent => {
      // Calculate period-specific metrics if there are calls in the period
      const periodCalls = agent.handledCalls.length;
      
      let periodResolution = agent.resolutionRate || 0;
      let periodSatisfaction = agent.satisfactionScore || 0;
      
      if (periodCalls > 0) {
        // Calculate resolution rate for the period
        const resolvedCalls = agent.handledCalls.filter(call => call.resolution).length;
        periodResolution = Math.round((resolvedCalls / periodCalls) * 100);
        
        // Calculate average sentiment for the period (assuming sentiment is stored as a string)
        const sentimentMap: Record<string, number> = {
          'positive': 5,
          'neutral': 3,
          'negative': 1
        };
        
        const totalSentiment = agent.handledCalls.reduce((sum, call) => {
          const sentimentValue = call.sentiment ? sentimentMap[call.sentiment.toLowerCase()] || 3 : 3;
          return sum + sentimentValue;
        }, 0);
        
        periodSatisfaction = Math.round((totalSentiment / periodCalls) * 10) / 10;
      }
      
      return {
        id: agent.id,
        name: agent.name || 'Unknown Agent',
        email: agent.email,
        avatar: agent.image,
        role: agent.jobTitle,
        calls: periodCalls,
        resolution: periodResolution,
        satisfaction: periodSatisfaction,
        aiUsage: agent.aiUsageRate || 0
      };
    });
    
    return NextResponse.json(formattedAgents);
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent performance data' },
      { status: 500 }
    );
  }
}