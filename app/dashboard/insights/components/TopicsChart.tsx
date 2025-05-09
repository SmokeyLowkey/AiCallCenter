"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"

interface TopicsChartProps {
  limit?: number
}

export function TopicsChart({ limit = 5 }: TopicsChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff']

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch topics data
        const response = await fetch(`/api/topics`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch topics data')
        }
        
        const topics = await response.json()
        
        // For a real implementation, we would need an API that returns topic counts
        // For now, we'll simulate this with random data
        const topicCounts = topics.slice(0, limit).map((topic: any, index: number) => ({
          name: topic.name,
          value: 100 - (index * 15), // Simulate decreasing counts
          color: COLORS[index % COLORS.length]
        }))
        
        // Sort by value (count) in descending order
        topicCounts.sort((a: any, b: any) => b.value - a.value)
        
        // Calculate percentages
        const total = topicCounts.reduce((sum: number, item: any) => sum + item.value, 0)
        const topicPercentages = topicCounts.map((topic: any) => ({
          ...topic,
          percentage: Math.round((topic.value / total) * 100)
        }))
        
        setData(topicPercentages)
      } catch (err) {
        console.error('Error fetching topics data:', err)
        setError('Failed to load topics data')
        
        // Use sample data as fallback
        setData([
          { name: 'Account Access', value: 45, percentage: 45, color: COLORS[0] },
          { name: 'Billing Questions', value: 25, percentage: 25, color: COLORS[1] },
          { name: 'Technical Support', value: 15, percentage: 15, color: COLORS[2] },
          { name: 'Product Information', value: 10, percentage: 10, color: COLORS[3] },
          { name: 'Other', value: 5, percentage: 5, color: COLORS[4] }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [limit])

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
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          labelLine={false}
          outerRadius={70}
          innerRadius={30}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
          label={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || COLORS[index % COLORS.length]}
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => [`${props.payload.percentage}%`, name]}
          contentStyle={{
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            fontSize: '12px'
          }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconSize={10}
          iconType="circle"
          wrapperStyle={{
            fontSize: '12px',
            paddingLeft: '10px',
            lineHeight: '20px'
          }}
          formatter={(value, entry, index) => {
            const { payload } = entry as any;
            return `${value}: ${payload.percentage}%`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}