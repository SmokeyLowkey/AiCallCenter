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

interface CallMetricsChartProps {
  days?: number
}

export function CallMetricsChart({ days = 7 }: CallMetricsChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch multiple metrics
        const metricTypes = [
          'ResolutionRate',
          'AverageCallDuration',
          'CustomerSatisfaction'
        ]
        
        const promises = metricTypes.map(metricType => 
          fetch(`/api/analytics?metricType=${metricType}&days=${days}`)
            .then(res => res.ok ? res.json() : null)
        )
        
        const results = await Promise.all(promises)
        
        // Check if we have valid data
        if (results.some(result => !result)) {
          throw new Error('Failed to fetch one or more metrics')
        }
        
        // Combine the data
        const combinedData: Record<string, any> = {}
        
        // Process resolution rate data
        if (results[0] && results[0].length > 0) {
          results[0].forEach((item: any) => {
            const date = new Date(item.date).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric' 
            })
            
            if (!combinedData[date]) {
              combinedData[date] = { date }
            }
            
            combinedData[date].resolutionRate = item.value
          })
        }
        
        // Process average call duration data
        if (results[1] && results[1].length > 0) {
          results[1].forEach((item: any) => {
            const date = new Date(item.date).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric' 
            })
            
            if (!combinedData[date]) {
              combinedData[date] = { date }
            }
            
            // Convert seconds to minutes for better display
            combinedData[date].avgDuration = Math.round(item.value / 60 * 10) / 10
          })
        }
        
        // Process customer satisfaction data
        if (results[2] && results[2].length > 0) {
          results[2].forEach((item: any) => {
            const date = new Date(item.date).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric' 
            })
            
            if (!combinedData[date]) {
              combinedData[date] = { date }
            }
            
            combinedData[date].satisfaction = item.value
          })
        }
        
        // Convert to array and sort by date
        const formattedData = Object.values(combinedData)
        formattedData.sort((a: any, b: any) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
        
        setData(formattedData)
      } catch (err) {
        console.error('Error fetching call metrics:', err)
        setError('Failed to load call metrics')
        
        // Use sample data as fallback
        const today = new Date()
        const sampleData = Array.from({ length: days }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() - (days - 1) + i)
          return {
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            resolutionRate: 75 + Math.random() * 10,
            avgDuration: 7 + Math.random() * 3,
            satisfaction: 4 + Math.random()
          }
        })
        
        setData(sampleData)
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
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
          domain={[0, 100]}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
          domain={[0, 15]}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
          formatter={(value: any, name) => {
            if (name === 'Resolution Rate') return [`${Number(value).toFixed(1)}%`, name]
            if (name === 'Avg. Duration') return [`${Number(value).toFixed(1)} min`, name]
            if (name === 'Satisfaction') return [`${Number(value).toFixed(1)}/5`, name]
            return [value, name]
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }}
        />
        <Line 
          yAxisId="left"
          name="Resolution Rate" 
          type="monotone" 
          dataKey="resolutionRate" 
          stroke="#6366f1" 
          strokeWidth={2} 
          dot={{ r: 3 }} 
          activeDot={{ r: 5 }} 
        />
        <Line 
          yAxisId="right"
          name="Avg. Duration" 
          type="monotone" 
          dataKey="avgDuration" 
          stroke="#f43f5e" 
          strokeWidth={2} 
          dot={{ r: 3 }} 
          activeDot={{ r: 5 }} 
        />
        <Line 
          yAxisId="right"
          name="Satisfaction" 
          type="monotone" 
          dataKey="satisfaction" 
          stroke="#10b981" 
          strokeWidth={2} 
          dot={{ r: 3 }} 
          activeDot={{ r: 5 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}