"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  metricType: string
  description?: string
  icon?: React.ReactNode
  valueFormatter?: (value: number) => string
  previousPeriod?: boolean
}

export function MetricCard({ 
  title, 
  metricType, 
  description = "vs. previous period", 
  icon,
  valueFormatter = (value) => value.toString(),
  previousPeriod = true
}: MetricCardProps) {
  const [value, setValue] = useState<string>("--")
  const [change, setChange] = useState<string>("0%")
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetric = async () => {
      setLoading(true)
      try {
        // Fetch current period data
        const response = await fetch('/api/analytics/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metricTypes: [metricType]
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch metric data')
        }
        
        const data = await response.json()
        
        if (data[metricType] !== undefined) {
          setValue(valueFormatter(data[metricType]))
          
          // If we need to compare with previous period
          if (previousPeriod) {
            // Fetch previous period data for comparison
            const prevResponse = await fetch(`/api/analytics?metricType=${metricType}&days=14`)
            
            if (!prevResponse.ok) {
              throw new Error('Failed to fetch previous period data')
            }
            
            const prevData = await prevResponse.json()
            
            if (prevData && prevData.length >= 2) {
              // Sort by date descending
              const sortedData = [...prevData].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              
              // Get current and previous values
              const currentValue = sortedData[0].value
              const previousValue = sortedData[sortedData.length - 1].value
              
              // Calculate percentage change
              if (previousValue !== 0) {
                const percentChange = ((currentValue - previousValue) / previousValue) * 100
                setChange(`${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`)
                setTrend(percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral")
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching metric:', err)
        setError('Failed to load metric')
      } finally {
        setLoading(false)
      }
    }

    fetchMetric()
  }, [metricType, valueFormatter, previousPeriod])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-slate-100"></div>
          ) : error ? (
            <span className="text-red-500 text-sm">Error</span>
          ) : (
            value
          )}
        </div>
        {previousPeriod && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {loading ? (
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100"></div>
            ) : (
              <>
                {trend === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                ) : trend === "down" ? (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                ) : null}
                <span className={trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : ""}>
                  {change}
                </span>
                <span className="ml-1">{description}</span>
              </>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}