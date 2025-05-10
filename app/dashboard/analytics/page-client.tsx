"use client"

import { useState } from "react"
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Filter,
  LineChart,
  PieChart,
  Phone,
  RefreshCw,
  Share2,
  Sliders,
  Users,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { MetricCard } from "./components/MetricCard"
import { CallVolumeChart } from "./components/CallVolumeChart"
import { CallDistributionChart } from "./components/CallDistributionChart"
import { CallMetricsChart } from "./components/CallMetricsChart"
import { TopPerformingAgents } from "./components/TopPerformingAgents"
import { InsightCard } from "./components/InsightCard"

export default function AnalyticsPageClient() {
  const [dateRange, setDateRange] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")
  const [distributionView, setDistributionView] = useState("type")

  // Convert dateRange to days for API calls
  const getDays = () => {
    switch (dateRange) {
      case "24h": return 1
      case "7d": return 7
      case "30d": return 30
      case "90d": return 90
      default: return 7
    }
  }

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
          metricType="TotalCalls"
          icon={<Phone className="h-4 w-4 text-indigo-600" />}
          valueFormatter={(value) => value.toLocaleString()}
        />
        <MetricCard
          title="Average Duration"
          metricType="AverageDuration"
          icon={<Clock className="h-4 w-4 text-indigo-600" />}
          valueFormatter={(value) => {
            const minutes = Math.floor(value / 60);
            const seconds = Math.floor(value % 60);
            return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
          }}
        />
        <MetricCard
          title="Resolution Rate"
          metricType="ResolutionRate"
          icon={<CheckCircle className="h-4 w-4 text-indigo-600" />}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
        />
        <MetricCard
          title="AI Assistance"
          metricType="AIAssistance"
          icon={<Zap className="h-4 w-4 text-indigo-600" />}
          valueFormatter={(value) => `${value.toFixed(1)}%`}
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
                  <CallVolumeChart days={getDays()} />
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Call Distribution</CardTitle>
                  <CardDescription>Breakdown by call type and outcome</CardDescription>
                </div>
                <Select value={distributionView} onValueChange={setDistributionView}>
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
                  <CallDistributionChart view={distributionView as any} days={getDays()} />
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
                <TopPerformingAgents limit={3} days={getDays()} />
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
                  <CallMetricsChart days={getDays()} />
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

        {/* Keep the other tabs from the original page */}
        <TabsContent value="performance" className="space-y-4">
          {/* Performance tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section will display detailed agent performance metrics.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {/* Quality tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Call Quality Metrics</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section will display detailed call quality metrics.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Trends tab content */}
          <Card>
            <CardHeader>
              <CardTitle>Call Trends</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section will display detailed call trend analysis.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}