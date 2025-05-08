"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Clock,
  Headphones,
  Mic,
  MicOff,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Plus,
  Settings,
  Volume2,
  VolumeX,
  Filter,
  Download,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LiveCallsPage() {
  const [activeTab, setActiveTab] = useState("active-calls")
  const [twilioConfigured, setTwilioConfigured] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Calls</h1>
          <p className="text-muted-foreground">Manage and monitor your active calls in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/live-calls/settings">
              <Settings className="mr-2 h-4 w-4" />
              Call Settings
            </Link>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Call
          </Button>
        </div>
      </div>

      {!twilioConfigured && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Twilio integration not configured</AlertTitle>
          <AlertDescription>
            Set up your Twilio integration to enable live call forwarding and management.
            <Button variant="link" className="text-amber-800 p-0 h-auto ml-2" onClick={() => setShowSetupDialog(true)}>
              Configure now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active-calls" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active-calls">Active Calls</TabsTrigger>
            <TabsTrigger value="call-queue">Call Queue</TabsTrigger>
            <TabsTrigger value="forwarding">Call Forwarding</TabsTrigger>
            <TabsTrigger value="history">Recent History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active-calls" className="space-y-4">
          {twilioConfigured ? (
            <ActiveCallsPanel />
          ) : (
            <SetupRequiredPanel
              title="Set up Twilio to manage live calls"
              description="Configure your Twilio integration to start managing and monitoring live calls."
              buttonText="Configure Twilio"
              onClick={() => setShowSetupDialog(true)}
              icon={<PhoneCall className="h-12 w-12 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        <TabsContent value="call-queue" className="space-y-4">
          {twilioConfigured ? (
            <CallQueuePanel />
          ) : (
            <SetupRequiredPanel
              title="Set up Twilio to manage call queue"
              description="Configure your Twilio integration to start managing your call queue."
              buttonText="Configure Twilio"
              onClick={() => setShowSetupDialog(true)}
              icon={<Clock className="h-12 w-12 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        <TabsContent value="forwarding" className="space-y-4">
          <CallForwardingPanel isConfigured={twilioConfigured} onSetupClick={() => setShowSetupDialog(true)} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <RecentCallHistoryPanel />
        </TabsContent>
      </Tabs>

      <TwilioSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        onComplete={() => {
          setTwilioConfigured(true)
          setShowSetupDialog(false)
        }}
      />
    </div>
  )
}

function ActiveCallsPanel() {
  const activeCalls = [
    {
      id: "call-1234",
      caller: {
        name: "Sarah Johnson",
        number: "+1 (555) 123-4567",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      agent: {
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      duration: "12:34",
      status: "in-progress",
      sentiment: "positive",
      topics: ["Account Access", "Password Reset"],
    },
    {
      id: "call-1235",
      caller: {
        name: "James Wilson",
        number: "+1 (555) 987-6543",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      agent: {
        name: "Emma Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      duration: "03:18",
      status: "in-progress",
      sentiment: "neutral",
      topics: ["Billing Question", "Subscription"],
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Active Calls ({activeCalls.length})</h3>
        <Button variant="outline" size="sm">
          <PhoneCall className="mr-2 h-4 w-4" />
          View All Agents
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {activeCalls.map((call) => (
          <ActiveCallCard key={call.id} call={call} />
        ))}
      </div>

      {activeCalls.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <PhoneOff className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Active Calls</h3>
          <p className="text-sm text-muted-foreground mt-1">There are currently no active calls in your system.</p>
        </div>
      )}
    </div>
  )
}

function ActiveCallCard({ call }) {
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(true)

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
              <Clock className="h-3 w-3 mr-1" />
              {call.duration}
            </Badge>
            <Badge variant="secondary" className={getSentimentColor(call.sentiment)}>
              {call.sentiment.charAt(0).toUpperCase() + call.sentiment.slice(1)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={call.caller.avatar || "/placeholder.svg"} alt={call.caller.name} />
              <AvatarFallback>{call.caller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{call.caller.name}</h4>
              <p className="text-sm text-muted-foreground">{call.caller.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h4 className="font-medium">{call.agent.name}</h4>
              <p className="text-sm text-muted-foreground">Agent</p>
            </div>
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={call.agent.avatar || "/placeholder.svg"} alt={call.agent.name} />
              <AvatarFallback>{call.agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Detected Topics:</p>
            <div className="flex flex-wrap gap-1">
              {call.topics.map((topic, i) => (
                <Badge key={i} variant="outline" className="bg-slate-100">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Live Sentiment:</p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: call.sentiment === "positive" ? "70%" : call.sentiment === "neutral" ? "50%" : "30%" }}
              ></div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium mb-2">AI Assistance:</p>
            <div className="p-3 bg-indigo-50 rounded-lg text-sm">
              <p className="text-indigo-800">
                <strong>Suggested response:</strong> "I understand you're having trouble with your account access. I can
                help reset your password and get you back into your account right away."
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 flex justify-between p-3">
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute" : "Mute"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsListening(!isListening)}>
                  {isListening ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListening ? "Mute Audio" : "Unmute Audio"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-8">
            <PhoneForwarded className="h-4 w-4 mr-1" />
            Transfer
          </Button>
          <Button variant="destructive" size="sm" className="h-8">
            <PhoneOff className="h-4 w-4 mr-1" />
            End Call
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function CallQueuePanel() {
  const queuedCalls = [
    {
      id: "queue-1",
      caller: {
        name: "Robert Smith",
        number: "+1 (555) 234-5678",
      },
      waitTime: "2:45",
      estimatedWait: "~5 min",
      reason: "Technical Support",
      priority: "High",
    },
    {
      id: "queue-2",
      caller: {
        name: "Jennifer Lopez",
        number: "+1 (555) 876-5432",
      },
      waitTime: "1:30",
      estimatedWait: "~3 min",
      reason: "Billing Question",
      priority: "Medium",
    },
    {
      id: "queue-3",
      caller: {
        name: "David Williams",
        number: "+1 (555) 345-6789",
      },
      waitTime: "0:45",
      estimatedWait: "~2 min",
      reason: "Sales Inquiry",
      priority: "Medium",
    },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-amber-100 text-amber-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Call Queue ({queuedCalls.length})</h3>
        <div className="flex gap-2">
          <Select defaultValue="all-agents">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-agents">All Available Agents</SelectItem>
              <SelectItem value="support">Support Team</SelectItem>
              <SelectItem value="sales">Sales Team</SelectItem>
              <SelectItem value="technical">Technical Team</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Queue Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Caller</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Wait Time</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Est. Wait</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Reason</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Priority</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queuedCalls.map((call) => (
                    <tr key={call.id} className="border-b">
                      <td className="p-4 align-middle">
                        <div>
                          <p className="font-medium">{call.caller.name}</p>
                          <p className="text-sm text-muted-foreground">{call.caller.number}</p>
                        </div>
                      </td>
                      <td className="p-4 align-middle font-medium">{call.waitTime}</td>
                      <td className="p-4 align-middle text-muted-foreground">{call.estimatedWait}</td>
                      <td className="p-4 align-middle">{call.reason}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="secondary" className={getPriorityColor(call.priority)}>
                          {call.priority}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-2">
                          <Button size="sm">
                            <PhoneCall className="h-4 w-4 mr-1" />
                            Answer
                          </Button>
                          <Button variant="outline" size="sm">
                            <PhoneForwarded className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {queuedCalls.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <Clock className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Calls in Queue</h3>
          <p className="text-sm text-muted-foreground mt-1">There are currently no calls waiting in the queue.</p>
        </div>
      )}
    </div>
  )
}

function CallForwardingPanel({ isConfigured, onSetupClick }) {
  const [forwardingEnabled, setForwardingEnabled] = useState(true)

  const forwardingRules = [
    {
      id: "rule-1",
      name: "Business Hours",
      description: "Monday-Friday, 9am-5pm",
      destination: "Support Team",
      status: "active",
    },
    {
      id: "rule-2",
      name: "After Hours",
      description: "Evenings and weekends",
      destination: "Voicemail",
      status: "active",
    },
    {
      id: "rule-3",
      name: "VIP Customers",
      description: "Priority customers",
      destination: "Senior Support Team",
      status: "active",
    },
    {
      id: "rule-4",
      name: "Overflow",
      description: "When queue > 10 callers",
      destination: "External Call Center",
      status: "inactive",
    },
  ]

  if (!isConfigured) {
    return (
      <SetupRequiredPanel
        title="Set up Twilio to configure call forwarding"
        description="Configure your Twilio integration to start setting up call forwarding rules."
        buttonText="Configure Twilio"
        onClick={onSetupClick}
        icon={<PhoneForwarded className="h-12 w-12 text-muted-foreground" />}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Call Forwarding</CardTitle>
              <CardDescription>Configure how incoming calls are routed</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="forwarding-mode" checked={forwardingEnabled} onCheckedChange={setForwardingEnabled} />
              <Label htmlFor="forwarding-mode">{forwardingEnabled ? "Enabled" : "Disabled"}</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Forwarding Rules</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-3">
              {forwardingRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="flex items-center mt-1">
                      <PhoneForwarded className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm">{rule.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                      {rule.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phone Numbers</CardTitle>
          <CardDescription>Manage your Twilio phone numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Numbers</h3>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Number
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Phone Number</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Assigned To</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 align-middle font-medium">+1 (555) 123-4567</td>
                      <td className="p-4 align-middle">Main Line</td>
                      <td className="p-4 align-middle">Support Team</td>
                      <td className="p-4 align-middle">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 align-middle font-medium">+1 (555) 987-6543</td>
                      <td className="p-4 align-middle">Sales Line</td>
                      <td className="p-4 align-middle">Sales Team</td>
                      <td className="p-4 align-middle">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecentCallHistoryPanel() {
  const recentCalls = [
    {
      id: "call-1001",
      caller: {
        name: "Sarah Johnson",
        number: "+1 (555) 123-4567",
      },
      agent: "Michael Chen",
      duration: "12:34",
      time: "Today, 10:30 AM",
      status: "completed",
      recording: true,
      transcript: true,
    },
    {
      id: "call-1002",
      caller: {
        name: "James Wilson",
        number: "+1 (555) 987-6543",
      },
      agent: "Emma Rodriguez",
      duration: "8:12",
      time: "Today, 9:15 AM",
      status: "completed",
      recording: true,
      transcript: true,
    },
    {
      id: "call-1003",
      caller: {
        name: "Robert Smith",
        number: "+1 (555) 234-5678",
      },
      agent: "Lisa Taylor",
      duration: "3:45",
      time: "Yesterday, 4:20 PM",
      status: "missed",
      recording: false,
      transcript: false,
    },
    {
      id: "call-1004",
      caller: {
        name: "Jennifer Lopez",
        number: "+1 (555) 876-5432",
      },
      agent: "David Williams",
      duration: "15:22",
      time: "Yesterday, 2:45 PM",
      status: "completed",
      recording: true,
      transcript: true,
    },
    {
      id: "call-1005",
      caller: {
        name: "Unknown",
        number: "+1 (555) 345-6789",
      },
      agent: "System",
      duration: "0:12",
      time: "Yesterday, 11:30 AM",
      status: "rejected",
      recording: false,
      transcript: false,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "missed":
        return "bg-amber-100 text-amber-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "missed":
        return "Missed"
      case "rejected":
        return "Rejected"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Call History</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Caller</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Agent</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Duration</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Time</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Recording</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="border-b">
                      <td className="p-4 align-middle">
                        <div>
                          <p className="font-medium">{call.caller.name}</p>
                          <p className="text-sm text-muted-foreground">{call.caller.number}</p>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{call.agent}</td>
                      <td className="p-4 align-middle font-medium">{call.duration}</td>
                      <td className="p-4 align-middle text-muted-foreground">{call.time}</td>
                      <td className="p-4 align-middle">
                        <Badge variant="secondary" className={getStatusColor(call.status)}>
                          {getStatusLabel(call.status)}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        {call.recording ? (
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Headphones className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-1">
                          {call.transcript && (
                            <Button variant="outline" size="sm" className="h-8 px-2">
                              <FileText className="h-4 w-4 mr-1" />
                              Transcript
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SetupRequiredPanel({ title, description, buttonText, onClick, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      {icon}
      <h3 className="text-lg font-medium mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      <Button className="mt-4" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
  )
}

function TwilioSetupDialog({ open, onOpenChange, onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        onComplete()
      }, 1500)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Set up Twilio Integration</DialogTitle>
          <DialogDescription>
            Configure your Twilio account to enable live call management and forwarding.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Twilio Credentials</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Phone Numbers</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Webhooks</span>
            </div>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-sid">Twilio Account SID</Label>
              <Input id="account-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <p className="text-xs text-muted-foreground">You can find this in your Twilio Console Dashboard.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-token">Twilio Auth Token</Label>
              <Input id="auth-token" type="password" placeholder="Your Twilio Auth Token" />
              <p className="text-xs text-muted-foreground">
                Keep this secure. You can find this in your Twilio Console Dashboard.
              </p>
            </div>
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Don't have a Twilio account?</AlertTitle>
              <AlertDescription>
                <Link href="https://www.twilio.com/try-twilio" className="underline" target="_blank">
                  Sign up for a free Twilio account
                </Link>{" "}
                to get started.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Numbers</Label>
              <div className="rounded-md border">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Main Line</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="p-4">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Add a Twilio Phone Number
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You can purchase and configure phone numbers directly from Twilio.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-greeting">Default Greeting</Label>
              <Input id="default-greeting" placeholder="Welcome to AI Call Clarity..." />
              <p className="text-xs text-muted-foreground">This message will be played when a call is received.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="flex">
                <Input id="webhook-url" value="https://your-domain.com/api/twilio/webhook" readOnly />
                <Button variant="outline" className="ml-2">
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configure this URL in your Twilio Phone Number settings to handle incoming calls.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Webhook Events</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="event-incoming" defaultChecked />
                  <Label htmlFor="event-incoming">Incoming Calls</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="event-completed" defaultChecked />
                  <Label htmlFor="event-completed">Call Completed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="event-recording" defaultChecked />
                  <Label htmlFor="event-recording">Recording Available</Label>
                </div>
              </div>
            </div>
            <Alert variant="default" className="bg-indigo-50 border-indigo-200 text-indigo-800">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Webhook Configuration</AlertTitle>
              <AlertDescription>
                After completing this setup, you'll need to configure these webhook URLs in your Twilio Console.
                <Link href="#" className="underline block mt-1">
                  View detailed instructions
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configuring...
              </>
            ) : step === 3 ? (
              "Complete Setup"
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MoreVertical(props) {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function InfoIcon(props) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function Loader2(props) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
