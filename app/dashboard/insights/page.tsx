"use client"

import React from "react"

import { useState } from "react"
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Lightbulb,
  LineChart,
  MessageSquare,
  PieChart,
  RefreshCw,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedInsight, setSelectedInsight] = useState(null)
  const [viewInsightDialog, setViewInsightDialog] = useState(false)

  const handleViewInsight = (insight: any) => {
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
          <Input type="search" placeholder="Search insights by keyword or topic..." className="pl-8" />
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
                  <Lightbulb className="h-5 w-5 text-indigo-600" />
                  Key Insights
                </CardTitle>
                <CardDescription>Top insights from your call data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Customer Satisfaction Trend",
                      description:
                        "Customer satisfaction has increased by 12% over the past 30 days, correlating with the implementation of AI assistance.",
                      category: "Sentiment Analysis",
                      trend: "up",
                      change: "+12%",
                      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
                    },
                    {
                      title: "Common Customer Issues",
                      description:
                        "45% of support calls are related to account access issues. Creating a self-service password reset could reduce call volume.",
                      category: "Topic Analysis",
                      trend: "neutral",
                      icon: <PieChart className="h-5 w-5 text-indigo-600" />,
                    },
                    {
                      title: "Agent Performance Gap",
                      description:
                        "Agents using AI suggestions resolve calls 2.4 minutes faster on average than those who don't.",
                      category: "Performance",
                      trend: "up",
                      change: "-2.4 min",
                      icon: <BarChart3 className="h-5 w-5 text-indigo-600" />,
                    },
                  ].map((insight, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewInsight(insight)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{insight.title}</h3>
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
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{insight.description}</p>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {insight.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("customer")}>
                  View All Insights
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trends</CardTitle>
                <CardDescription>Customer sentiment over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <SentimentTrendsChart />
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
              <CardContent>
                <div className="h-[200px] w-full">
                  <TopicsChart />
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { name: "Account Access", percentage: 45, color: "bg-indigo-600" },
                    { name: "Billing Questions", percentage: 25, color: "bg-indigo-400" },
                    { name: "Technical Support", percentage: 15, color: "bg-indigo-300" },
                    { name: "Product Information", percentage: 10, color: "bg-indigo-200" },
                    { name: "Other", percentage: 5, color: "bg-indigo-100" },
                  ].map((topic, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${topic.color} mr-2`}></div>
                        {topic.name}
                      </span>
                      <span className="font-medium">{topic.percentage}%</span>
                    </div>
                  ))}
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
              <div className="space-y-4">
                {[
                  {
                    title: "Customer Satisfaction Drivers",
                    description:
                      "Analysis shows that calls where agents acknowledge the customer's issue within the first 30 seconds have 35% higher satisfaction ratings.",
                    category: "Customer Experience",
                    date: "Today, 10:30 AM",
                    confidence: "High",
                    icon: <ThumbsUp className="h-5 w-5 text-green-600" />,
                  },
                  {
                    title: "Call Volume Pattern",
                    description:
                      "Call volume is consistently highest between 10am-12pm and 2pm-4pm on weekdays. Consider adjusting staffing to match these peak times.",
                    category: "Operations",
                    date: "Yesterday, 3:15 PM",
                    confidence: "High",
                    icon: <LineChart className="h-5 w-5 text-indigo-600" />,
                  },
                  {
                    title: "Product Feedback Trend",
                    description:
                      "15 customers mentioned difficulty with the new checkout process in the past week. This represents a 200% increase from the previous period.",
                    category: "Product",
                    date: "Yesterday, 11:45 AM",
                    confidence: "Medium",
                    icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
                  },
                  {
                    title: "Agent Script Effectiveness",
                    description:
                      "Agents who use the recommended response templates for technical issues resolve calls 40% faster with no decrease in customer satisfaction.",
                    category: "Training",
                    date: "2 days ago, 2:30 PM",
                    confidence: "High",
                    icon: <MessageSquare className="h-5 w-5 text-indigo-600" />,
                  },
                ].map((insight, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewInsight(insight)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {insight.icon}
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{insight.date}</span>
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
              <div className="space-y-4">
                {[
                  {
                    title: "Customer Satisfaction Drivers",
                    description:
                      "Analysis shows that calls where agents acknowledge the customer's issue within the first 30 seconds have 35% higher satisfaction ratings.",
                    category: "Customer Experience",
                    date: "Today, 10:30 AM",
                    confidence: "High",
                    icon: <ThumbsUp className="h-5 w-5 text-green-600" />,
                    details:
                      "Our AI analyzed 1,284 calls and found a strong correlation between early acknowledgment of customer issues and overall satisfaction. When agents validate customer concerns in the first 30 seconds, satisfaction scores average 4.8/5 compared to 3.6/5 when acknowledgment happens later or not at all.",
                    recommendations: [
                      "Update agent scripts to include explicit acknowledgment of customer issues early in the call",
                      "Add this insight to agent training materials",
                      "Create a quick reference guide for common acknowledgment phrases",
                    ],
                  },
                  {
                    title: "First Call Resolution Impact",
                    description:
                      "Customers whose issues are resolved on the first call are 3x more likely to report high satisfaction and 2x more likely to make additional purchases within 30 days.",
                    category: "Customer Experience",
                    date: "Yesterday, 1:15 PM",
                    confidence: "High",
                    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                    details:
                      "Analysis of 856 customer journeys shows that first-call resolution has a significant impact on both satisfaction and future purchasing behavior. Customers who needed to call multiple times for the same issue reported 65% lower satisfaction and were half as likely to make additional purchases.",
                    recommendations: [
                      "Prioritize first-call resolution in agent performance metrics",
                      "Develop more comprehensive troubleshooting guides for common issues",
                      "Implement follow-up surveys to identify opportunities for improvement",
                    ],
                  },
                  {
                    title: "Customer Effort Score Correlation",
                    description:
                      "Calls requiring high customer effort (multiple transfers, repeated information) result in a 45% increase in churn risk, regardless of whether the issue was ultimately resolved.",
                    category: "Customer Experience",
                    date: "2 days ago, 9:45 AM",
                    confidence: "Medium",
                    icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
                    details:
                      "Our analysis found that customer effort is a stronger predictor of churn than issue resolution. Even when problems are solved, customers who experienced high effort (measured by transfers, hold time, and repeated information) were 45% more likely to cancel service within 90 days.",
                    recommendations: [
                      "Implement a customer effort score metric for all calls",
                      "Reduce the number of transfers by improving initial routing",
                      "Develop systems to share customer information between departments to avoid repetition",
                    ],
                  },
                  {
                    title: "Emotional Response Patterns",
                    description:
                      "Customers who express frustration in the first minute of a call but receive empathetic responses show a 70% improvement in sentiment by the end of the call.",
                    category: "Customer Experience",
                    date: "3 days ago, 2:30 PM",
                    confidence: "High",
                    icon: <MessageSquare className="h-5 w-5 text-indigo-600" />,
                    details:
                      "Sentiment analysis of 1,542 calls revealed that customer frustration at the beginning of a call can be effectively addressed through empathetic responses. When agents acknowledge emotions and express understanding, customer sentiment improves dramatically by the end of the interaction.",
                    recommendations: [
                      "Train agents on emotional intelligence and empathetic response techniques",
                      "Develop specific scripts for handling frustrated customers",
                      "Create a library of empathetic phrases for common situations",
                    ],
                  },
                ].map((insight, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewInsight(insight)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {insight.icon}
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{insight.date}</span>
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
              <div className="space-y-4">
                {[
                  {
                    title: "Agent Script Effectiveness",
                    description:
                      "Agents who use the recommended response templates for technical issues resolve calls 40% faster with no decrease in customer satisfaction.",
                    category: "Training",
                    date: "2 days ago, 2:30 PM",
                    confidence: "High",
                    icon: <MessageSquare className="h-5 w-5 text-indigo-600" />,
                    details:
                      "Analysis of 932 technical support calls shows that agents who follow the recommended response templates resolve issues in an average of 7.2 minutes, compared to 12 minutes for those who don't. Customer satisfaction ratings remained consistent between both groups.",
                    recommendations: [
                      "Expand the template library to cover more common technical issues",
                      "Create a quick-access system for agents to find relevant templates",
                      "Include template usage in agent training programs",
                    ],
                  },
                  {
                    title: "AI Assistance Adoption",
                    description:
                      "Agents with high AI tool adoption (>80% of suggestions) have 28% higher resolution rates and 15% higher customer satisfaction scores.",
                    category: "Technology",
                    date: "3 days ago, 11:15 AM",
                    confidence: "High",
                    icon: <Zap className="h-5 w-5 text-indigo-600" />,
                    details:
                      "Comparing performance metrics between agents with high AI tool adoption and those with low adoption reveals significant differences. High adopters resolve 28% more issues on the first call and receive customer satisfaction scores averaging 4.7/5 compared to 4.1/5 for low adopters.",
                    recommendations: [
                      "Develop targeted training for agents with low AI tool adoption",
                      "Create an agent feedback mechanism to improve AI suggestions",
                      "Recognize and reward high AI adoption as part of performance reviews",
                    ],
                  },
                  {
                    title: "Agent Empathy Impact",
                    description:
                      "Agents who score in the top quartile for empathy expressions handle 22% more calls per day while maintaining higher customer satisfaction scores.",
                    category: "Soft Skills",
                    date: "4 days ago, 3:45 PM",
                    confidence: "Medium",
                    icon: <Heart className="h-5 w-5 text-red-600" />,
                    details:
                      "Our AI analyzed agent language patterns and identified expressions of empathy (acknowledging feelings, showing understanding, etc.). Agents in the top quartile for empathy expressions handle an average of 22% more calls daily while maintaining customer satisfaction scores 0.4 points higher than the average.",
                    recommendations: [
                      "Develop empathy training modules for all agents",
                      "Create a library of empathetic phrases for common situations",
                      "Include empathy metrics in agent performance evaluations",
                    ],
                  },
                  {
                    title: "Knowledge Gap Identification",
                    description:
                      "Analysis identified three common technical issues where agents frequently need to escalate or place customers on hold to research solutions.",
                    category: "Training",
                    date: "5 days ago, 10:30 AM",
                    confidence: "High",
                    icon: <BookOpen className="h-5 w-5 text-amber-600" />,
                    details:
                      "Our AI identified specific knowledge gaps by analyzing patterns in call escalations and hold times. The three most common issues requiring additional research are: advanced account security settings, multi-device synchronization problems, and custom integration troubleshooting.",
                    recommendations: [
                      "Develop targeted training modules for the identified knowledge gaps",
                      "Create comprehensive reference materials for these specific issues",
                      "Consider specialized training for a subset of agents to become experts in these areas",
                    ],
                  },
                ].map((insight, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewInsight(insight)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {insight.icon}
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{insight.date}</span>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Analysis</CardTitle>
              <CardDescription>AI-generated insights about call topics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Account Access Issues",
                    description:
                      "45% of support calls are related to account access issues. Creating a self-service password reset could reduce call volume by an estimated 30%.",
                    category: "Topic Analysis",
                    date: "Today, 9:15 AM",
                    confidence: "High",
                    icon: <Lock className="h-5 w-5 text-indigo-600" />,
                    details:
                      "Our AI analyzed 1,284 calls and found that account access issues represent the largest category of support requests. Of these, 68% are related to password resets or account recovery. The average handling time for these calls is 8.5 minutes.",
                    recommendations: [
                      "Implement a more intuitive self-service password reset system",
                      "Create a video tutorial for account recovery",
                      "Add a prominent link to password reset on the login page",
                    ],
                    subtopics: [
                      { name: "Password Reset", percentage: 68 },
                      { name: "Account Lockout", percentage: 15 },
                      { name: "Two-Factor Authentication", percentage: 12 },
                      { name: "Other Access Issues", percentage: 5 },
                    ],
                  },
                  {
                    title: "Billing Questions",
                    description:
                      "Billing-related calls have increased by 25% following the recent price change. Most customers are confused about the new tiered pricing structure.",
                    category: "Topic Analysis",
                    date: "Yesterday, 2:30 PM",
                    confidence: "High",
                    icon: <CreditCard className="h-5 w-5 text-indigo-600" />,
                    details:
                      "Since the price change on May 1st, billing-related calls have increased from 15% to 25% of total call volume. Analysis of these calls shows that 72% involve confusion about which tier applies to the customer's usage patterns.",
                    recommendations: [
                      "Create a personalized tier recommendation tool for customers",
                      "Simplify the explanation of tier benefits in billing communications",
                      "Train agents on a simplified explanation of the pricing structure",
                    ],
                    subtopics: [
                      { name: "Tier Confusion", percentage: 72 },
                      { name: "Unexpected Charges", percentage: 15 },
                      { name: "Payment Issues", percentage: 8 },
                      { name: "Other Billing Questions", percentage: 5 },
                    ],
                  },
                  {
                    title: "Product Feature Requests",
                    description:
                      "Analysis of customer calls identified three frequently requested features that are not currently on the product roadmap.",
                    category: "Product Feedback",
                    date: "3 days ago, 11:45 AM",
                    confidence: "Medium",
                    icon: <Lightbulb className="h-5 w-5 text-amber-600" />,
                    details:
                      "Our AI identified patterns in feature requests mentioned during customer calls. The three most requested features not currently on the roadmap are: bulk editing capabilities, advanced export options, and customizable notification settings.",
                    recommendations: [
                      "Share these findings with the product team for roadmap consideration",
                      "Develop interim workarounds for agents to suggest to customers",
                      "Create a formal process for tracking feature requests from calls",
                    ],
                    subtopics: [
                      { name: "Bulk Editing", percentage: 45 },
                      { name: "Advanced Export", percentage: 30 },
                      { name: "Custom Notifications", percentage: 25 },
                    ],
                  },
                  {
                    title: "Technical Issue Patterns",
                    description:
                      "Technical support calls show a 40% increase on Mondays, with most issues related to weekend software updates.",
                    category: "Topic Analysis",
                    date: "4 days ago, 3:15 PM",
                    confidence: "High",
                    icon: <Bug className="h-5 w-5 text-red-600" />,
                    details:
                      "Analysis of call patterns shows a consistent spike in technical support calls on Mondays. 65% of these calls are related to issues that arise after weekend software updates. The most common issues involve integration failures with third-party services.",
                    recommendations: [
                      "Consider moving software updates to mid-week",
                      "Implement more thorough pre-release testing with third-party integrations",
                      "Increase technical support staffing on Mondays",
                    ],
                    subtopics: [
                      { name: "Integration Failures", percentage: 65 },
                      { name: "Performance Issues", percentage: 20 },
                      { name: "UI/UX Problems", percentage: 10 },
                      { name: "Other Technical Issues", percentage: 5 },
                    ],
                  },
                ].map((insight, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewInsight(insight)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {insight.icon}
                      <div>
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{insight.date}</span>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedInsight && (
        <InsightDetailDialog insight={selectedInsight} open={viewInsightDialog} onOpenChange={setViewInsightDialog} />
      )}
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
    </div>
  )
}

function TopicsChart() {
  // This would be replaced with a real chart library like Recharts
  const categories = [
    { name: "Account Access", value: 45, color: "bg-indigo-600" },
    { name: "Billing Questions", value: 25, color: "bg-indigo-400" },
    { name: "Technical Support", value: 15, color: "bg-indigo-300" },
    { name: "Product Information", value: 10, color: "bg-indigo-200" },
    { name: "Other", value: 5, color: "bg-indigo-100" },
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
    </div>
  )
}

interface InsightDetailDialogProps {
  insight: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InsightDetailDialog({ insight, open, onOpenChange }: InsightDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {insight.icon && React.cloneElement(insight.icon, { className: "h-5 w-5" })}
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
          <DialogDescription>
            Generated on {insight.date} • {insight.confidence} Confidence
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-sm text-slate-600">{insight.description}</p>
            </div>

            {insight.details && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Detailed Analysis</h3>
                <p className="text-sm text-slate-600">{insight.details}</p>
              </div>
            )}

            {insight.recommendations && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {insight.recommendations.map((recommendation: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="rounded-full bg-indigo-100 text-indigo-600 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.subtopics && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-4">Subtopic Breakdown</h3>
                <div className="space-y-3">
                  {insight.subtopics.map((subtopic: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{subtopic.name}</span>
                        <span className="text-sm font-medium">{subtopic.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${subtopic.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Data Sources</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>This insight was generated based on analysis of:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>1,284 call transcripts from the past 30 days</li>
                  <li>Customer satisfaction survey responses</li>
                  <li>Agent performance metrics</li>
                  <li>Historical trend data from the past 6 months</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-4">
          <div className="flex items-center gap-2 mr-auto">
            <Button variant="outline" size="sm">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Helpful
            </Button>
            <Button variant="outline" size="sm">
              <ThumbsDown className="mr-2 h-4 w-4" />
              Not Helpful
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

function Heart(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

function BookOpen(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function Lock(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function Bug(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
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
