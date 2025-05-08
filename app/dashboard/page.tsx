"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Layers,
  Lightbulb,
  Phone,
  PhoneCall,
  Plus,
  Settings,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your call analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Call
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <MetricCard
          title="Total Calls"
          value="1,284"
          description="+12.5% from last week"
          icon={<PhoneCall className="h-4 w-4 text-indigo-600" />}
        />
        <MetricCard
          title="Average Duration"
          value="8m 42s"
          description="-2.3% from last week"
          icon={<Clock className="h-4 w-4 text-indigo-600" />}
        />
        <MetricCard
          title="Resolution Rate"
          value="78.3%"
          description="+5.2% from last week"
          icon={<CheckCircle className="h-4 w-4 text-indigo-600" />}
        />
        <MetricCard
          title="AI Assistance"
          value="92.7%"
          description="+3.1% from last week"
          icon={<Zap className="h-4 w-4 text-indigo-600" />}
        />
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <QuickAccessCard
          title="Live Calls"
          description="Monitor and manage active calls"
          icon={<PhoneCall className="h-10 w-10 text-indigo-600" />}
          count="2"
          href="/dashboard/live-calls"
        />
        <QuickAccessCard
          title="Analytics"
          description="View detailed call analytics"
          icon={<BarChart3 className="h-10 w-10 text-indigo-600" />}
          count=""
          href="/dashboard/analytics"
        />
        <QuickAccessCard
          title="Transcripts"
          description="Browse call transcripts"
          icon={<FileText className="h-10 w-10 text-indigo-600" />}
          count="256"
          href="/dashboard/transcripts"
        />
        <QuickAccessCard
          title="Insights"
          description="AI-generated insights"
          icon={<Lightbulb className="h-10 w-10 text-indigo-600" />}
          count="New"
          href="/dashboard/insights"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 w-full">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest call recordings and transcripts</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Last 7 days
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Today</DropdownMenuItem>
                <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Custom range</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <RecentCallsTable />
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Top performing agents this week</CardDescription>
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
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/team">
                <Users className="mr-2 h-4 w-4" />
                View All Team Members
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions and Integrations */}
      <div className="grid gap-4 md:grid-cols-2 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/live-calls">
                <PhoneCall className="mr-2 h-4 w-4" />
                Start New Call
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/knowledge-base">
                <FileText className="mr-2 h-4 w-4" />
                Update Knowledge Base
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/transcripts">
                <Headphones className="mr-2 h-4 w-4" />
                Review Recent Calls
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configure Settings
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations Status</CardTitle>
            <CardDescription>Connected systems and services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Database className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Salesforce</p>
                  <p className="text-xs text-muted-foreground">CRM Integration</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Twilio</p>
                  <p className="text-xs text-muted-foreground">Call Forwarding</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Microsoft Dynamics</p>
                  <p className="text-xs text-muted-foreground">CRM Integration</p>
                </div>
              </div>
              <Badge className="bg-slate-100 text-slate-800">Not Connected</Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/integrations">
                <Settings className="mr-2 h-4 w-4" />
                Manage Integrations
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Complete these steps to get the most out of AI Call Clarity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Set up your account</h3>
                <p className="text-sm text-muted-foreground">Your account is set up and ready to use.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Connect your first integration</h3>
                <p className="text-sm text-muted-foreground">You've connected Salesforce and Twilio.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-indigo-100 p-2">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium">Upload knowledge base documents</h3>
                <p className="text-sm text-muted-foreground">
                  Upload documents to your knowledge base to improve AI assistance during calls.
                </p>
                <Button variant="link" className="h-auto p-0 text-indigo-600" asChild>
                  <Link href="/dashboard/knowledge-base">
                    Upload Documents <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-slate-100 p-2">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-medium">Invite your team</h3>
                <p className="text-sm text-muted-foreground">Invite team members to collaborate and handle calls.</p>
                <Button variant="link" className="h-auto p-0 text-indigo-600" asChild>
                  <Link href="/dashboard/team">
                    Invite Team Members <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>All systems operational</AlertTitle>
        <AlertDescription>AI Call Clarity is running smoothly. Last checked 5 minutes ago.</AlertDescription>
      </Alert>
    </div>
  )
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: string;
  href: string;
}

function QuickAccessCard({ title, description, icon, count, href }: QuickAccessCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link href={href} className="block h-full">
        <div className="p-6 flex flex-col items-center text-center h-full">
          <div className="rounded-full bg-indigo-50 p-3 mb-4">{icon}</div>
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {count && (
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors">{count}</Badge>
          )}
        </div>
      </Link>
    </Card>
  )
}

function RecentCallsTable() {
  const calls = [
    {
      id: "CALL-1234",
      customer: "Sarah Johnson",
      type: "Support",
      duration: "12:34",
      date: "Today, 10:30 AM",
      sentiment: "Positive",
    },
    {
      id: "CALL-1235",
      customer: "Michael Chen",
      type: "Sales",
      duration: "8:12",
      date: "Today, 9:15 AM",
      sentiment: "Neutral",
    },
    {
      id: "CALL-1236",
      customer: "Emma Wilson",
      type: "Support",
      duration: "15:47",
      date: "Yesterday, 4:20 PM",
      sentiment: "Negative",
    },
    {
      id: "CALL-1237",
      customer: "James Rodriguez",
      type: "Technical",
      duration: "22:05",
      date: "Yesterday, 2:45 PM",
      sentiment: "Positive",
    },
    {
      id: "CALL-1238",
      customer: "Lisa Taylor",
      type: "Billing",
      duration: "5:18",
      date: "Yesterday, 11:30 AM",
      sentiment: "Neutral",
    },
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-green-100 text-green-800"
      case "Negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">ID</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Customer</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Type</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Duration</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Sentiment</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-b">
                <td className="p-4 align-middle font-medium">{call.id}</td>
                <td className="p-4 align-middle">{call.customer}</td>
                <td className="p-4 align-middle">{call.type}</td>
                <td className="p-4 align-middle">{call.duration}</td>
                <td className="p-4 align-middle">{call.date}</td>
                <td className="p-4 align-middle">
                  <Badge variant="secondary" className={getSentimentColor(call.sentiment)}>
                    {call.sentiment}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/transcripts`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

function Database(props: React.SVGProps<SVGSVGElement>) {
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
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
