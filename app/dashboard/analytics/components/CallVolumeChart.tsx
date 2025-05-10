"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

interface CallVolumeChartProps {
  days?: number
}

export function CallVolumeChart({ days = 7 }: CallVolumeChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch call volume data
        const response = await fetch(`/api/analytics?metricType=CallVolume&days=${days}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch call volume data')
        }
        
        const responseData = await response.json()
        
        // Format data for the chart
        const formattedData = responseData.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric' 
          }),
          calls: item.value
        }))
        
        setData(formattedData)
      } catch (err) {
        console.error('Error fetching call volume data:', err)
        setError('Failed to load call volume data')
        
        // Use sample data as fallback
        const today = new Date()
        const sampleData = Array.from({ length: days }, (_, i) => {
          const date = new Date(today)
          date.setDate(date.getDate() - (days - 1) + i)
          return {
            date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            calls: Math.floor(Math.random() * 50) + 80 // Random value between 80-130
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
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }}
        />
        <Bar 
          name="Call Volume" 
          dataKey="calls" 
          fill="#6366f1" 
          radius={[4, 4, 0, 0]} 
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}