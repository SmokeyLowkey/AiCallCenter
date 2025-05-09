"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  LineChart,
  AlertCircle,
  ThumbsUp,
  MessageSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Insight {
  id: string
  title: string
  description: string
  details?: string
  category: string
  confidence: string
  trend?: string
  change?: string
  recommendations: string[]
  createdAt: string
  updatedAt: string
}

interface InsightsListProps {
  category?: string
  limit?: number
  onInsightClick?: (insight: Insight) => void
}

export function InsightsList({ category, limit, onInsightClick }: InsightsListProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      try {
        let url = '/api/insights'
        const params = new URLSearchParams()
        
        if (category) {
          params.append('category', category)
        }
        
        if (limit) {
          params.append('limit', limit.toString())
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch insights')
        }
        
        const data = await response.json()
        setInsights(data)
      } catch (err) {
        console.error('Error fetching insights:', err)
        setError('Failed to load insights. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [category, limit])

  const getInsightIcon = (insight: Insight) => {
    switch (insight.category) {
      case 'Sentiment Analysis':
        return <ThumbsUp className="h-5 w-5 text-green-600" />
      case 'Topic Analysis':
        return <PieChart className="h-5 w-5 text-indigo-600" />
      case 'Performance':
        return <BarChart3 className="h-5 w-5 text-indigo-600" />
      case 'Operations':
        return <LineChart className="h-5 w-5 text-indigo-600" />
      case 'Product':
        return <AlertCircle className="h-5 w-5 text-amber-600" />
      default:
        return <MessageSquare className="h-5 w-5 text-indigo-600" />
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading insights...</div>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-4 text-slate-500">
        <p>No insights found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className="rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => onInsightClick?.(insight)}
        >
          <div className="flex items-start gap-3 mb-2">
            {getInsightIcon(insight)}
            <div>
              <h3 className="font-medium">{insight.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <Badge
                  variant="outline"
                  className={
                    insight.confidence === "High"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : insight.confidence === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {insight.confidence} Confidence
                </Badge>
                {insight.trend && (
                  <>
                    <span>•</span>
                    {insight.trend === "up" ? (
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {insight.change}
                      </Badge>
                    ) : insight.trend === "down" ? (
                      <Badge className="bg-red-100 text-red-800">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        {insight.change}
                      </Badge>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-2">{insight.description}</p>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {insight.category}
          </Badge>
        </div>
      ))}
    </div>
  )
}