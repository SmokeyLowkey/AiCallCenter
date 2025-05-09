"use client"

import { useState } from "react"
import {
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Search,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InsightsList } from "./components/InsightsList"
import { InsightDetailDialog } from "./components/InsightDetailDialog"
import { SentimentTrendsChart } from "./components/SentimentTrendsChart"
import { TopicsChart } from "./components/TopicsChart"

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

export default function InsightsPageClient() {
  const [dateRange, setDateRange] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
  const [viewInsightDialog, setViewInsightDialog] = useState(false)

  const handleViewInsight = (insight: Insight) => {
    setSelectedInsight(insight)
    setViewInsightDialog(true)
  }

  return (
    <div className="flex flex-col space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">AI-generated insights from your call data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search insights by keyword or topic..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customer">Customer Insights</TabsTrigger>
            <TabsTrigger value="agent">Agent Insights</TabsTrigger>
            <TabsTrigger value="topics">Topic Analysis</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
            <Card className="bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Key Insights
                </CardTitle>
                <CardDescription>Top insights from your call data</CardDescription>
              </CardHeader>
              <CardContent>
                <InsightsList limit={3} onInsightClick={handleViewInsight} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("customer")}>
                  View All Insights
                </Button>
              </CardFooter>
            </Card>

            {/* Keep the existing Sentiment Trends and Top Call Topics cards */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
                <CardDescription>Customer sentiment over time</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-[220px] w-full">
                  <SentimentTrendsChart days={dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 7} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Positive
                    </span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      Neutral
                    </span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Negative
                    </span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Detailed Analysis
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Call Topics</CardTitle>
                <CardDescription>Most common topics in customer calls</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-[220px] w-full">
                  <TopicsChart limit={5} />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                      Account Access
                    </span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-400 mr-2"></div>
                      Billing Questions
                    </span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-300 mr-2"></div>
                      Technical Support
                    </span>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("topics")}>
                  View Topic Analysis
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
              <CardDescription>Latest AI-generated insights from your calls</CardDescription>
            </CardHeader>
            <CardContent>
              <InsightsList limit={4} onInsightClick={handleViewInsight} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Insights
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Experience Insights</CardTitle>
              <CardDescription>AI-generated insights about customer experience</CardDescription>
            </CardHeader>
            <CardContent>
              <InsightsList category="Customer Experience" onInsightClick={handleViewInsight} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Insights</CardTitle>
              <CardDescription>AI-generated insights about agent performance</CardDescription>
            </CardHeader>
            <CardContent>
              <InsightsList category="Performance" onInsightClick={handleViewInsight} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Analysis Insights</CardTitle>
              <CardDescription>AI-generated insights about call topics</CardDescription>
            </CardHeader>
            <CardContent>
              <InsightsList category="Topic Analysis" onInsightClick={handleViewInsight} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInsight && (
        <InsightDetailDialog
          insight={selectedInsight}
          open={viewInsightDialog}
          onOpenChange={setViewInsightDialog}
        />
      )}
    </div>
  )
}