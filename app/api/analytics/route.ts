import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metricType = searchParams.get('metricType');
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 7;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Build where clause
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (metricType) {
      whereClause.metricType = metricType;
    }
    
    const analyticsData = await prisma.analyticsData.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      }
    });

    // If a specific metric type was requested, return the raw data
    if (metricType) {
      return NextResponse.json(analyticsData);
    }
    
    // Otherwise, group by metric type
    const groupedData: Record<string, any[]> = {};
    analyticsData.forEach(item => {
      if (!groupedData[item.metricType]) {
        groupedData[item.metricType] = [];
      }
      groupedData[item.metricType].push({
        date: item.date,
        value: item.value
      });
    });
    
    return NextResponse.json(groupedData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// API to get summary metrics (latest values)
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
    
    // For each metric type, get the most recent value
    for (const metricType of metricTypes) {
      const latestData = await prisma.analyticsData.findFirst({
        where: { metricType },
        orderBy: { date: 'desc' }
      });
      
      if (latestData) {
        results[metricType] = latestData.value;
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