import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { metricTypes } = await request.json();
    
    if (!Array.isArray(metricTypes)) {
      return NextResponse.json(
        { error: 'metricTypes must be an array' },
        { status: 400 }
      );
    }
    
    const results: Record<string, number> = {};
    
    // For each metric type, get the most recent value from AnalyticsData
    for (const metricType of metricTypes) {
      const latestData = await prisma.analyticsData.findFirst({
        where: { metricType },
        orderBy: { date: 'desc' }
      });
      
      if (latestData) {
        results[metricType] = latestData.value;
      } else {
        // If no data found in AnalyticsData, try to calculate it from other models
        switch (metricType) {
          case 'TotalCalls':
            // Count total calls
            const callCount = await prisma.call.count();
            results[metricType] = callCount;
            break;
            
          case 'AverageDuration':
            // Calculate average call duration
            const durationResult = await prisma.call.aggregate({
              _avg: {
                duration: true
              },
              where: {
                duration: {
                  not: null
                }
              }
            });
            results[metricType] = durationResult._avg.duration || 0;
            break;
            
          case 'ResolutionRate':
            // Calculate resolution rate
            const resolutionTotalCalls = await prisma.call.count();
            
            const resolvedCalls = await prisma.call.count({
              where: {
                resolution: true
              }
            });
            
            results[metricType] = resolutionTotalCalls > 0 
              ? (resolvedCalls / resolutionTotalCalls) * 100 
              : 0;
            break;
            
          case 'AIAssistance':
            // Calculate AI assistance rate
            const aiTotalCalls = await prisma.call.count();
            
            const aiAssistedCalls = await prisma.call.count({
              where: {
                aiAssisted: true
              }
            });
            
            results[metricType] = aiTotalCalls > 0 
              ? (aiAssistedCalls / aiTotalCalls) * 100 
              : 0;
            break;
            
          default:
            // For unknown metrics, return 0 or null
            results[metricType] = 0;
        }
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching summary metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary metrics' },
      { status: 500 }
    );
  }
}