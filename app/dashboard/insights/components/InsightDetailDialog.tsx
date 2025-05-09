"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Share2, 
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  PieChart,
  BarChart3,
  LineChart,
  AlertCircle,
  MessageSquare,
  Check
} from "lucide-react"

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

interface InsightDetailDialogProps {
  insight: Insight | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InsightDetailDialog({ insight, open, onOpenChange }: InsightDetailDialogProps) {
  if (!insight) return null

  const getInsightIcon = (category: string) => {
    switch (category) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getInsightIcon(insight.category)}
              {insight.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
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
            <span>•</span>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {insight.category}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-slate-600">{insight.description}</p>
            </div>
            
            {insight.details && (
              <div>
                <h3 className="text-lg font-medium mb-2">Details</h3>
                <p className="text-slate-600">{insight.details}</p>
              </div>
            )}
            
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {insight.recommendations.map((recommendation, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 p-1 mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-slate-600">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="border-t p-4">
          <div className="flex items-center gap-2 mr-auto">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share with Team
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}