"use client"

import { useState } from "react"
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  Share2,
  Sliders,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and metrics for your calls</p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <MetricCard
          title="Total Calls"
          value="1,284"
          change="+12.5%"
          trend="up"
          description="vs. previous period"
          icon={<Phone className="h-4 w-4 text-indigo-600" />}
        />
        <MetricCard
          title="Average Duration"
          value="8m 42s"
          change="-2.3%"
          trend="down"
          description="vs. previous period"
          icon={<Clock className="h-4 w-4 text-indigo-600" />}
        />
        <MetricCard
          title="Resolution Rate"
          value="78.3%"
          change="+5.2%"
          trend="up"
          description="vs. previous period"
          icon={<CheckCircle className="h-4 w-4 text-indigo-600" />}
        />
        <MetricCard
          title="AI Assistance"
          value="92.7%"
          change="+3.1%"
          trend="up"
          description="vs. previous period"
          icon={<Zap className="h-4 w-4 text-indigo-600" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Agent Performance</TabsTrigger>
            <TabsTrigger value="quality">Call Quality</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Call Volume</CardTitle>
                  <CardDescription>Daily call volume for the selected period</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Sliders className="mr-2 h-4 w-4" />
                      Options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Chart Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Show Inbound Calls</DropdownMenuItem>
                    <DropdownMenuItem>Show Outbound Calls</DropdownMenuItem>
                    <DropdownMenuItem>Show Missed Calls</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View as Bar Chart</DropdownMenuItem>
                    <DropdownMenuItem>View as Line Chart</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <CallVolumeChart />
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Call Distribution</CardTitle>
                  <CardDescription>Breakdown by call type and outcome</CardDescription>
                </div>
                <Select defaultValue="type">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type">By Type</SelectItem>
                    <SelectItem value="outcome">By Outcome</SelectItem>
                    <SelectItem value="duration">By Duration</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <CallDistributionChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
                <CardDescription>Based on call resolution rate and customer satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      name: "Emma Rodriguez",
                      avatar: "/placeholder.svg?height=40&width=40",
                      role: "Senior Support Agent",
                      calls: 145,
                      resolution: 92,
                      satisfaction: 4.8,
                    },
                    {
                      name: "Michael Chen",
                      avatar: "/placeholder.svg?height=40&width=40",
                      role: "Technical Support",
                      calls: 132,
                      resolution: 89,
                      satisfaction: 4.7,
                    },
                    {
                      name: "Sarah Johnson",
                      avatar: "/placeholder.svg?height=40&width=40",
                      role: "Customer Support",
                      calls: 128,
                      resolution: 85,
                      satisfaction: 4.6,
                    },
                  ].map((agent, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                            <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                            {i + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Calls</p>
                          <p className="font-medium">{agent.calls}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Resolution</p>
                          <p className="font-medium">{agent.resolution}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Satisfaction</p>
                          <p className="font-medium">{agent.satisfaction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  View All Agents
                </Button>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Call Metrics Over Time</CardTitle>
                <CardDescription>Trends in key metrics over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <CallMetricsChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Insights</CardTitle>
              <CardDescription>AI-generated insights from your call data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
                <InsightCard
                  title="Peak Call Times"
                  description="Call volume is highest between 10am-12pm and 2pm-4pm. Consider adjusting staffing to match these peak times."
                  category="Volume Analysis"
                  icon={<BarChart3 className="h-5 w-5 text-indigo-600" />}
                />
                <InsightCard
                  title="Common Issues"
                  description="'Password reset' and 'billing questions' account for 45% of all support calls. Creating self-service options could reduce call volume."
                  category="Topic Analysis"
                  icon={<PieChart className="h-5 w-5 text-indigo-600" />}
                />
                <InsightCard
                  title="Resolution Time"
                  description="Average resolution time has decreased by 18% since implementing AI assistance. Agents using suggested responses resolve calls faster."
                  category="Performance"
                  icon={<LineChart className="h-5 w-5 text-indigo-600" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Detailed performance metrics for all agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Agent</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Calls Handled</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Avg. Duration</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Resolution Rate</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Customer Satisfaction</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">AI Usage</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "Emma Rodriguez",
                          avatar: "/placeholder.svg?height=32&width=32",
                          calls: 145,
                          duration: "7m 12s",
                          resolution: 92,
                          satisfaction: 4.8,
                          aiUsage: 95,
                          performance: "Excellent",
                        },
                        {
                          name: "Michael Chen",
                          avatar: "/placeholder.svg?height=32&width=32",
                          calls: 132,
                          duration: "8m 45s",
                          resolution: 89,
                          satisfaction: 4.7,
                          aiUsage: 88,
                          performance: "Excellent",
                        },
                        {
                          name: "Sarah Johnson",
                          avatar: "/placeholder.svg?height=32&width=32",
                          calls: 128,
                          duration: "6m 30s",
                          resolution: 85,
                          satisfaction: 4.6,
                          aiUsage: 92,
                          performance: "Good",
                        },
                        {
                          name: "David Williams",
                          avatar: "/placeholder.svg?height=32&width=32",
                          calls: 115,
                          duration: "9m 20s",
                          resolution: 82,
                          satisfaction: 4.5,
                          aiUsage: 78,
                          performance: "Good",
                        },
                        {
                          name: "Lisa Taylor",
                          avatar: "/placeholder.svg?height=32&width=32",
                          calls: 98,
                          duration: "10m 15s",
                          resolution: 79,
                          satisfaction: 4.3,
                          aiUsage: 85,
                          performance: "Average",
                        },
                      ].map((agent, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{agent.name}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{agent.calls}</td>
                          <td className="p-4 align-middle">{agent.duration}</td>
                          <td className="p-4 align-middle">{agent.resolution}%</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <span className="mr-2">{agent.satisfaction}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.round(agent.satisfaction)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{agent.aiUsage}%</td>
                          <td className="p-4 align-middle">
                            <Badge
                              className={
                                agent.performance === "Excellent"
                                  ? "bg-green-100 text-green-800"
                                  : agent.performance === "Good"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                              }
                            >
                              {agent.performance}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Team</CardTitle>
                <CardDescription>Comparison of team performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <TeamPerformanceChart />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>How agent performance has changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <PerformanceTrendsChart />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Quality Metrics</CardTitle>
              <CardDescription>Detailed quality metrics for all calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Sentiment Score</p>
                      <h3 className="text-2xl font-bold mt-1">78/100</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on AI analysis of customer tone and language
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">First Call Resolution</p>
                      <h3 className="text-2xl font-bold mt-1">72.5%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Percentage of issues resolved in the first call</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Hold Time</p>
                      <h3 className="text-2xl font-bold mt-1">1m 45s</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Average time customers spend on hold during calls
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Script Adherence</p>
                      <h3 className="text-2xl font-bold mt-1">94.2%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">How closely agents follow recommended scripts</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Call Quality Distribution</h3>
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Quality Score</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Number of Calls</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Percentage</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { score: "Excellent (90-100)", calls: 428, percentage: 33.3, trend: "up" },
                          { score: "Good (75-89)", calls: 512, percentage: 39.9, trend: "up" },
                          { score: "Average (60-74)", calls: 245, percentage: 19.1, trend: "down" },
                          { score: "Below Average (40-59)", calls: 78, percentage: 6.1, trend: "down" },
                          { score: "Poor (0-39)", calls: 21, percentage: 1.6, trend: "down" },
                        ].map((row, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4 align-middle font-medium">{row.score}</td>
                            <td className="p-4 align-middle">{row.calls}</td>
                            <td className="p-4 align-middle">{row.percentage}%</td>
                            <td className="p-4 align-middle">
                              {row.trend === "up" ? (
                                <div className="flex items-center text-green-600">
                                  <TrendingUp className="mr-1 h-4 w-4" />
                                  <span>Improving</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <TrendingDown className="mr-1 h-4 w-4" />
                                  <span>Declining</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality by Call Type</CardTitle>
                <CardDescription>How quality varies across different call types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <QualityByTypeChart />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>How call quality has changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <QualityTrendsChart />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Volume Trends</CardTitle>
              <CardDescription>How call volume has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <CallVolumeTrendsChart />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Topic Trends</CardTitle>
                <CardDescription>How call topics have changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <TopicTrendsChart />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
                <CardDescription>How customer sentiment has changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <SentimentTrendsChart />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns</CardTitle>
              <CardDescription>Identifying seasonal patterns in call data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-2">Daily Patterns</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Call volume is consistently highest between 10am-12pm and 2pm-4pm on weekdays. Weekend volume is
                    approximately 40% lower than weekday volume.
                  </p>
                  <div className="h-[100px] w-full">
                    <DailyPatternsChart />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-2">Monthly Patterns</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Call volume tends to increase at the beginning of each month and during holiday seasons. January and
                    December show the highest volumes.
                  </p>
                  <div className="h-[100px] w-full">
                    <MonthlyPatternsChart />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-2">Quarterly Patterns</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Q4 consistently shows the highest call volume, followed by Q1. Technical support calls increase in
                    Q1, while billing inquiries peak in Q4.
                  </p>
                  <div className="h-[100px] w-full">
                    <QuarterlyPatternsChart />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: string;
  description: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs">
          {trend === "up" ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
          )}
          <span className={trend === "up" ? "text-green-600" : "text-red-600"}>{change}</span>
          <span className="text-muted-foreground ml-1">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CallVolumeChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-7 grid-rows-3 gap-2 items-end pb-6">
        {[35, 42, 58, 48, 38, 60, 55].map((height, i) => (
          <div key={i} className="relative w-full h-full flex items-end">
            <div className="w-full bg-indigo-200 rounded-sm relative" style={{ height: `${height}%` }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full bg-indigo-600 rounded-sm" style={{ height: `${height * 0.7}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground text-center">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>
    </div>
  )
}

function CallDistributionChart() {
  // This would be replaced with a real chart library like Recharts
  const categories = [
    { name: "Customer Support", value: 45, color: "bg-indigo-600" },
    { name: "Sales Inquiries", value: 30, color: "bg-indigo-400" },
    { name: "Technical Support", value: 15, color: "bg-indigo-300" },
    { name: "Billing Questions", value: 10, color: "bg-indigo-200" },
  ]

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="w-full h-40 relative flex items-center justify-center">
        <div className="w-40 h-40 rounded-full border-8 border-slate-100"></div>
        <div className="absolute inset-0">
          <div className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
            {categories.map((category, i) => {
              const previousTotal = categories.slice(0, i).reduce((acc, curr) => acc + curr.value, 0)
              const offset = previousTotal * 3.6
              const width = category.value * 3.6
              return (
                <div
                  key={i}
                  className={`absolute w-20 h-20 rounded-full ${category.color}`}
                  style={{
                    top: "calc(50% - 5rem)",
                    left: "calc(50% - 5rem)",
                    width: "10rem",
                    height: "10rem",
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + width}% 0%, ${50 + width}% ${
                      width > 180 ? 100 : 0
                    }%, ${width > 270 ? 0 : 50 + width}% ${width > 270 ? 0 : 100}%, 0% ${
                      width > 270 ? 0 : 100
                    }%, 0% 50%)`,
                    transform: `rotate(${offset}deg)`,
                  }}
                ></div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-8">
        {categories.map((category, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
            <div className="text-sm">{category.name}</div>
            <div className="text-sm font-medium ml-auto">{category.value}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CallMetricsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-0">
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-7 gap-0">
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <svg className="w-full h-full">
            <path
              d="M0,100 C50,80 100,90 150,60 C200,30 250,40 300,20 C350,0 400,10 450,30 C500,50 550,40 600,20"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <path
              d="M0,120 C50,100 100,110 150,90 C200,70 250,80 300,60 C350,40 400,50 450,70 C500,90 550,80 600,60"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
            />
            <path
              d="M0,140 C50,150 100,130 150,140 C200,150 250,130 300,120 C350,110 400,130 450,120 C500,110 550,130 600,120"
              fill="none"
              stroke="#c7d2fe"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
          <div className="text-sm">Resolution Rate</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          <div className="text-sm">Call Duration</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-200"></div>
          <div className="text-sm">Customer Satisfaction</div>
        </div>
      </div>
    </div>
  )
}

interface InsightCardProps {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

function InsightCard({ title, description, category, icon }: InsightCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
        {category}
      </Badge>
    </div>
  )
}

function TeamPerformanceChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-3 gap-4 items-end pb-6">
        {[
          { name: "Support Team", height: 75, color: "bg-indigo-600" },
          { name: "Sales Team", height: 85, color: "bg-blue-500" },
          { name: "Technical Team", height: 65, color: "bg-purple-500" },
        ].map((team, i) => (
          <div key={i} className="relative w-full h-full flex flex-col items-center justify-end">
            <div className={`w-full ${team.color} rounded-t-sm`} style={{ height: `${team.height}%` }}></div>
            <div className="mt-2 text-xs text-center text-muted-foreground">{team.name}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-sm font-medium">78%</div>
          <div className="text-xs text-muted-foreground">Resolution Rate</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">85%</div>
          <div className="text-xs text-muted-foreground">Resolution Rate</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">65%</div>
          <div className="text-xs text-muted-foreground">Resolution Rate</div>
        </div>
      </div>
    </div>
  )
}

function PerformanceTrendsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-0">
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-6 gap-0">
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <svg className="w-full h-full">
            <path
              d="M0,100 C50,90 100,80 150,70 C200,60 250,50 300,40 C350,30 400,20 450,10 C500,0"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-6 text-xs text-muted-foreground text-center mt-2">
        <div>Jan</div>
        <div>Feb</div>
        <div>Mar</div>
        <div>Apr</div>
        <div>May</div>
        <div>Jun</div>
      </div>
    </div>
  )
}

function QualityByTypeChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-4 gap-4 items-end pb-6">
        {[
          { name: "Support", score: 85, color: "bg-indigo-600" },
          { name: "Sales", score: 78, color: "bg-indigo-600" },
          { name: "Technical", score: 92, color: "bg-indigo-600" },
          { name: "Billing", score: 75, color: "bg-indigo-600" },
        ].map((type, i) => (
          <div key={i} className="relative w-full h-full flex flex-col items-center justify-end">
            <div className={`w-full ${type.color} rounded-t-sm relative`} style={{ height: `${type.score}%` }}>
              <div className="absolute -top-6 w-full text-center text-sm font-medium">{type.score}</div>
            </div>
            <div className="mt-2 text-xs text-center text-muted-foreground">{type.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QualityTrendsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-0">
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-6 gap-0">
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <svg className="w-full h-full">
            <path
              d="M0,80 C50,70 100,90 150,60 C200,30 250,50 300,40 C350,30 400,20 450,10 C500,30"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-6 text-xs text-muted-foreground text-center mt-2">
        <div>Jan</div>
        <div>Feb</div>
        <div>Mar</div>
        <div>Apr</div>
        <div>May</div>
        <div>Jun</div>
      </div>
    </div>
  )
}

function CallVolumeTrendsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-0">
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-12 gap-0">
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <svg className="w-full h-full">
            <path
              d="M0,100 C25,90 50,80 75,90 C100,100 125,110 150,100 C175,90 200,80 225,70 C250,60 275,50 300,60 C325,70 350,80 375,70 C400,60 425,50 450,40 C475,30 500,20 525,30 C550,40 575,50 600,40"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-12 text-xs text-muted-foreground text-center mt-2">
        <div>Jan</div>
        <div>Feb</div>
        <div>Mar</div>
        <div>Apr</div>
        <div>May</div>
        <div>Jun</div>
        <div>Jul</div>
        <div>Aug</div>
        <div>Sep</div>
        <div>Oct</div>
        <div>Nov</div>
        <div>Dec</div>
      </div>
    </div>
  )
}

function TopicTrendsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-0">
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-6 gap-0">
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <svg className="w-full h-full">
            <path
              d="M0,100 C50,90 100,80 150,70 C200,60 250,50 300,40 C350,30 400,20 450,10 C500,0"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
            />
            <path
              d="M0,120 C50,110 100,100 150,110 C200,120 250,110 300,100 C350,90 400,80 450,90 C500,100"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <path
              d="M0,140 C50,150 100,140 150,130 C200,120 250,130 300,140 C350,150 400,140 450,130 C500,120"
              fill="none"
              stroke="#c7d2fe"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          <div className="text-sm">Technical Issues</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
          <div className="text-sm">Billing Questions</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-200"></div>
          <div className="text-sm">Account Access</div>
        </div>
      </div>
    </div>
  )
}

function SentimentTrendsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-4 gap-0">
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div className="border-b border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-0 grid grid-cols-6 gap-0">
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div className="border-r border-dashed border-slate-200"></div>
          <div></div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[80%]">
          <svg className="w-full h-full">
            <path
              d="M0,100 C50,110 100,90 150,80 C200,70 250,60 300,50 C350,40 400,30 450,20 C500,10"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            />
            <path
              d="M0,120 C50,130 100,120 150,110 C200,100 250,90 300,100 C350,110 400,100 450,90 C500,80"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <path
              d="M0,140 C50,130 100,140 150,150 C200,160 250,150 300,140 C350,130 400,140 450,150 C500,160"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="text-sm">Positive</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="text-sm">Neutral</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="text-sm">Negative</div>
        </div>
      </div>
    </div>
  )
}

function DailyPatternsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-7 gap-1 items-end">
        {[60, 75, 80, 85, 78, 45, 30].map((height, i) => (
          <div key={i} className="relative w-full h-full flex items-end">
            <div className="w-full bg-indigo-600 rounded-sm" style={{ height: `${height}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthlyPatternsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-12 gap-1 items-end">
        {[85, 70, 65, 60, 55, 50, 55, 60, 65, 70, 75, 90].map((height, i) => (
          <div key={i} className="relative w-full h-full flex items-end">
            <div className="w-full bg-indigo-600 rounded-sm" style={{ height: `${height}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuarterlyPatternsChart() {
  // This would be replaced with a real chart library like Recharts
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 grid grid-cols-4 gap-4 items-end">
        {[75, 60, 65, 90].map((height, i) => (
          <div key={i} className="relative w-full h-full flex items-end">
            <div className="w-full bg-indigo-600 rounded-sm" style={{ height: `${height}%` }}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Phone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function TrendingDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    </svg>
  )
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function Zap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
