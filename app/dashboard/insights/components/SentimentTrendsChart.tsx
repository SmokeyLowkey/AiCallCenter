"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

interface SentimentTrendsChartProps {
  days?: number
}

export function SentimentTrendsChart({ days = 7 }: SentimentTrendsChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch analytics data for sentiment metrics
        const response = await fetch(`/api/analytics?days=${days}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch sentiment data')
        }
        
        const responseData = await response.json()
        
        // Format data for the chart
        // We're looking for sentiment-related metrics
        const sentimentData: any[] = []
        
        // If we have real data, use it
        if (responseData.CustomerSatisfaction) {
          // Convert the data to the format expected by recharts
          const dates = new Set<string>()
          
          // Collect all dates
          Object.values(responseData).forEach((metricData: any) => {
            metricData.forEach((item: any) => {
              dates.add(new Date(item.date).toLocaleDateString())
            })
          })
          
          // Create data points for each date
          Array.from(dates).sort().forEach(date => {
            const dataPoint: any = { date }
            
            // Add values for each sentiment type
            if (responseData.PositiveSentiment) {
              const item = responseData.PositiveSentiment.find(
                (i: any) => new Date(i.date).toLocaleDateString() === date
              )
              dataPoint.positive = item ? item.value : null
            }
            
            if (responseData.NeutralSentiment) {
              const item = responseData.NeutralSentiment.find(
                (i: any) => new Date(i.date).toLocaleDateString() === date
              )
              dataPoint.neutral = item ? item.value : null
            }
            
            if (responseData.NegativeSentiment) {
              const item = responseData.NegativeSentiment.find(
                (i: any) => new Date(i.date).toLocaleDateString() === date
              )
              dataPoint.negative = item ? item.value : null
            }
            
            sentimentData.push(dataPoint)
          })
        } else {
          // Use sample data if no real data is available
          sentimentData.push(
            { date: '5/1', positive: 65, neutral: 25, negative: 10 },
            { date: '5/2', positive: 62, neutral: 28, negative: 10 },
            { date: '5/3', positive: 60, neutral: 30, negative: 10 },
            { date: '5/4', positive: 63, neutral: 27, negative: 10 },
            { date: '5/5', positive: 65, neutral: 25, negative: 10 },
            { date: '5/6', positive: 68, neutral: 22, negative: 10 },
            { date: '5/7', positive: 70, neutral: 20, negative: 10 }
          )
        }
        
        setData(sentimentData)
      } catch (err) {
        console.error('Error fetching sentiment data:', err)
        setError('Failed to load sentiment data')
        
        // Use sample data as fallback
        setData([
          { date: '5/1', positive: 65, neutral: 25, negative: 10 },
          { date: '5/2', positive: 62, neutral: 28, negative: 10 },
          { date: '5/3', positive: 60, neutral: 30, negative: 10 },
          { date: '5/4', positive: 63, neutral: 27, negative: 10 },
          { date: '5/5', positive: 65, neutral: 25, negative: 10 },
          { date: '5/6', positive: 68, neutral: 22, negative: 10 },
          { date: '5/7', positive: 70, neutral: 20, negative: 10 }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days])

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickMargin={5}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickMargin={5}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
          formatter={(value) => [`${value}%`, '']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }}
        />
        <Line
          name="Positive"
          type="monotone"
          dataKey="positive"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={{ r: 0 }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          name="Neutral"
          type="monotone"
          dataKey="neutral"
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={{ r: 0 }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          name="Negative"
          type="monotone"
          dataKey="negative"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={{ r: 0 }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}