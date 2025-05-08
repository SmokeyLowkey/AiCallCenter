"use client"

import { useState } from "react"
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Search,
  Share2,
  Star,
  Tag,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TranscriptsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTranscript, setSelectedTranscript] = useState(null)
  const [viewTranscriptDialog, setViewTranscriptDialog] = useState(false)

  const handleViewTranscript = (transcript: any) => {
    setSelectedTranscript(transcript)
    setViewTranscriptDialog(true)
  }

  return (
    <div className="flex flex-col space-y-6 p-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transcripts</h1>
          <p className="text-muted-foreground">Browse and search through your call transcripts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transcripts by keyword, customer name, or agent..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="date-desc">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="duration-desc">Longest First</SelectItem>
            <SelectItem value="duration-asc">Shortest First</SelectItem>
            <SelectItem value="sentiment-desc">Most Positive</SelectItem>
            <SelectItem value="sentiment-asc">Most Negative</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Transcripts</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            Showing <strong>1-10</strong> of <strong>256</strong> transcripts
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-2">
            {[
              {
                id: "TR-1234",
                customer: {
                  name: "Sarah Johnson",
                  phone: "+1 (555) 123-4567",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Michael Chen",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Today, 10:30 AM",
                duration: "12:34",
                sentiment: "positive",
                topics: ["Account Access", "Password Reset"],
                starred: true,
                flagged: false,
                summary:
                  "Customer called about issues accessing their account. Agent helped reset their password and verified security questions. Issue was resolved successfully.",
              },
              {
                id: "TR-1235",
                customer: {
                  name: "James Wilson",
                  phone: "+1 (555) 987-6543",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Emma Rodriguez",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Today, 9:15 AM",
                duration: "8:12",
                sentiment: "neutral",
                topics: ["Billing Question", "Subscription"],
                starred: false,
                flagged: true,
                summary:
                  "Customer had questions about their recent bill. Agent explained the charges and offered to adjust a late fee. Customer was satisfied with the resolution.",
              },
              {
                id: "TR-1236",
                customer: {
                  name: "Robert Smith",
                  phone: "+1 (555) 234-5678",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Lisa Taylor",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Yesterday, 4:20 PM",
                duration: "15:47",
                sentiment: "negative",
                topics: ["Technical Issue", "Product Complaint"],
                starred: false,
                flagged: true,
                summary:
                  "Customer reported issues with the product not working as expected. Agent troubleshooted but couldn't resolve the issue. Escalated to technical team for follow-up.",
              },
              {
                id: "TR-1237",
                customer: {
                  name: "Jennifer Lopez",
                  phone: "+1 (555) 876-5432",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "David Williams",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Yesterday, 2:45 PM",
                duration: "22:05",
                sentiment: "positive",
                topics: ["Product Information", "Sales"],
                starred: true,
                flagged: false,
                summary:
                  "Customer inquired about product features and pricing. Agent provided detailed information and offered a promotional discount. Customer made a purchase.",
              },
              {
                id: "TR-1238",
                customer: {
                  name: "Michael Brown",
                  phone: "+1 (555) 345-6789",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Sarah Johnson",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Yesterday, 11:30 AM",
                duration: "5:18",
                sentiment: "neutral",
                topics: ["Return Policy", "Order Status"],
                starred: false,
                flagged: false,
                summary:
                  "Customer asked about return policy for a recent purchase. Agent explained the policy and checked the status of their order. Customer decided to keep the product.",
              },
            ].map((transcript) => (
              <TranscriptCard
                key={transcript.id}
                transcript={transcript}
                onView={() => handleViewTranscript(transcript)}
              />
            ))}
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline" className="mx-2">
              Previous
            </Button>
            <div className="flex items-center">
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                1
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0">
                2
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0">
                3
              </Button>
              <span className="mx-2">...</span>
              <Button variant="ghost" className="h-8 w-8 p-0">
                24
              </Button>
            </div>
            <Button variant="outline" className="mx-2">
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Flagged Transcripts</AlertTitle>
            <AlertDescription>
              These transcripts have been flagged for review due to customer sentiment, compliance issues, or agent
              escalation.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            {[
              {
                id: "TR-1235",
                customer: {
                  name: "James Wilson",
                  phone: "+1 (555) 987-6543",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Emma Rodriguez",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Today, 9:15 AM",
                duration: "8:12",
                sentiment: "neutral",
                topics: ["Billing Question", "Subscription"],
                starred: false,
                flagged: true,
                flagReason: "Billing dispute",
                summary:
                  "Customer had questions about their recent bill. Agent explained the charges and offered to adjust a late fee. Customer was satisfied with the resolution.",
              },
              {
                id: "TR-1236",
                customer: {
                  name: "Robert Smith",
                  phone: "+1 (555) 234-5678",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Lisa Taylor",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Yesterday, 4:20 PM",
                duration: "15:47",
                sentiment: "negative",
                topics: ["Technical Issue", "Product Complaint"],
                starred: false,
                flagged: true,
                flagReason: "Customer dissatisfaction",
                summary:
                  "Customer reported issues with the product not working as expected. Agent troubleshooted but couldn't resolve the issue. Escalated to technical team for follow-up.",
              },
            ].map((transcript) => (
              <TranscriptCard
                key={transcript.id}
                transcript={transcript}
                onView={() => handleViewTranscript(transcript)}
                showFlagReason
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="starred" className="space-y-4">
          <div className="space-y-2">
            {[
              {
                id: "TR-1234",
                customer: {
                  name: "Sarah Johnson",
                  phone: "+1 (555) 123-4567",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Michael Chen",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Today, 10:30 AM",
                duration: "12:34",
                sentiment: "positive",
                topics: ["Account Access", "Password Reset"],
                starred: true,
                flagged: false,
                summary:
                  "Customer called about issues accessing their account. Agent helped reset their password and verified security questions. Issue was resolved successfully.",
              },
              {
                id: "TR-1237",
                customer: {
                  name: "Jennifer Lopez",
                  phone: "+1 (555) 876-5432",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "David Williams",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Yesterday, 2:45 PM",
                duration: "22:05",
                sentiment: "positive",
                topics: ["Product Information", "Sales"],
                starred: true,
                flagged: false,
                summary:
                  "Customer inquired about product features and pricing. Agent provided detailed information and offered a promotional discount. Customer made a purchase.",
              },
            ].map((transcript) => (
              <TranscriptCard
                key={transcript.id}
                transcript={transcript}
                onView={() => handleViewTranscript(transcript)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="space-y-2">
            {[
              {
                id: "TR-1234",
                customer: {
                  name: "Sarah Johnson",
                  phone: "+1 (555) 123-4567",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                agent: {
                  name: "Michael Chen",
                  avatar: "/placeholder.svg?height=40&width=40",
                },
                date: "Today, 10:30 AM",
                duration: "12:34",
                sentiment: "positive",
                topics: ["Account Access", "Password Reset"],
                starred: true,
                flagged: false,
                shared: {
                  by: "Emma Rodriguez",
                  date: "Today, 11:45 AM",
                  with: ["Support Team", "Training Department"],
                },
                summary:
                  "Customer called about issues accessing their account. Agent helped reset their password and verified security questions. Issue was resolved successfully.",
              },
            ].map((transcript) => (
              <TranscriptCard
                key={transcript.id}
                transcript={transcript}
                onView={() => handleViewTranscript(transcript)}
                showSharedInfo
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedTranscript && (
        <TranscriptViewDialog
          transcript={selectedTranscript}
          open={viewTranscriptDialog}
          onOpenChange={setViewTranscriptDialog}
        />
      )}
    </div>
  )
}

interface TranscriptCardProps {
  transcript: any;
  onView: () => void;
  showFlagReason?: boolean;
  showSharedInfo?: boolean;
}

function TranscriptCard({ transcript, onView, showFlagReason = false, showSharedInfo = false }: TranscriptCardProps) {
  const getSentimentColor = (sentiment: string) => {
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
              {transcript.id}
            </Badge>
            <Badge variant="secondary" className={getSentimentColor(transcript.sentiment)}>
              {transcript.sentiment.charAt(0).toUpperCase() + transcript.sentiment.slice(1)}
            </Badge>
            {transcript.starred && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                Starred
              </Badge>
            )}
            {transcript.flagged && (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Flagged
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Star
                className={`h-4 w-4 ${transcript.starred ? "fill-yellow-500 text-yellow-500" : "text-slate-400"}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Transcript
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Tag className="mr-2 h-4 w-4" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Comment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Flag for Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={transcript.customer.avatar || "/placeholder.svg"} alt={transcript.customer.name} />
              <AvatarFallback>{transcript.customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{transcript.customer.name}</h4>
              <p className="text-sm text-muted-foreground">{transcript.customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h4 className="font-medium">{transcript.agent.name}</h4>
              <p className="text-sm text-muted-foreground">Agent</p>
            </div>
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={transcript.agent.avatar || "/placeholder.svg"} alt={transcript.agent.name} />
              <AvatarFallback>{transcript.agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {showFlagReason && transcript.flagReason && (
          <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Flag Reason</AlertTitle>
            <AlertDescription>{transcript.flagReason}</AlertDescription>
          </Alert>
        )}

        {showSharedInfo && transcript.shared && (
          <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
            <Share2 className="h-4 w-4" />
            <AlertTitle>Shared by {transcript.shared.by}</AlertTitle>
            <AlertDescription>
              Shared on {transcript.shared.date} with {transcript.shared.with.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Topics:</p>
            <div className="flex flex-wrap gap-1">
              {transcript.topics.map((topic: string, i: number) => (
                <Badge key={i} variant="outline" className="bg-slate-100">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Summary:</p>
            <p className="text-sm text-slate-600">{transcript.summary}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 flex justify-between p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{transcript.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{transcript.duration}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View Transcript
        </Button>
      </CardFooter>
    </Card>
  )
}

interface TranscriptViewDialogProps {
  transcript: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TranscriptViewDialog({ transcript, open, onOpenChange }: TranscriptViewDialogProps) {
  const [activeTab, setActiveTab] = useState("transcript")

  const transcriptContent = [
    {
      speaker: "System",
      time: "00:00",
      text: "Call started",
      type: "system",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "00:05",
      text: "Thank you for calling AI Call Clarity. My name is Michael. How can I help you today?",
      type: "agent",
    },
    {
      speaker: "Customer",
      name: transcript.customer.name,
      time: "00:12",
      text: "Hi Michael, I'm having trouble logging into my account. I've tried resetting my password but I'm still not able to get in.",
      type: "customer",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "00:25",
      text: "I'm sorry to hear that you're having trouble accessing your account. I'd be happy to help you with that. Could you please verify your email address and the last four digits of your phone number for security purposes?",
      type: "agent",
    },
    {
      speaker: "Customer",
      name: transcript.customer.name,
      time: "00:38",
      text: "Sure, my email is sarah.johnson@example.com and the last four digits are 4567.",
      type: "customer",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "00:45",
      text: "Thank you for verifying that information. I can see your account here. It looks like there might be an issue with your account being temporarily locked due to multiple failed login attempts. I can help you unlock it and reset your password.",
      type: "agent",
    },
    {
      speaker: "Customer",
      name: transcript.customer.name,
      time: "01:02",
      text: "Oh, that makes sense. I did try to log in several times. Yes, please help me unlock it.",
      type: "customer",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "01:10",
      text: "I'll do that right away. I'm going to send a verification code to your email address. Once you receive it, please share it with me so I can verify your identity and unlock your account.",
      type: "agent",
    },
    {
      speaker: "System",
      time: "01:25",
      text: "Verification code sent to customer's email",
      type: "system",
    },
    {
      speaker: "Customer",
      name: transcript.customer.name,
      time: "01:45",
      text: "I just got the email. The code is 123456.",
      type: "customer",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "01:52",
      text: "Thank you for providing the verification code. I've verified it and unlocked your account. Now, let's reset your password. I'll send you a password reset link to your email. Once you receive it, please click on it and follow the instructions to create a new password.",
      type: "agent",
    },
    {
      speaker: "System",
      time: "02:10",
      text: "Password reset link sent to customer's email",
      type: "system",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "02:15",
      text: "The password reset link has been sent to your email. Please check your inbox and follow the instructions to create a new password. Is there anything else you'd like me to help you with today?",
      type: "agent",
    },
    {
      speaker: "Customer",
      name: transcript.customer.name,
      time: "02:30",
      text: "I got the email and I'll reset my password right away. Thank you so much for your help!",
      type: "customer",
    },
    {
      speaker: "Agent",
      name: transcript.agent.name,
      time: "02:38",
      text: "You're very welcome! I'm glad I could help you regain access to your account. If you have any other questions or concerns, please don't hesitate to call us back. Have a great day!",
      type: "agent",
    },
    {
      speaker: "Customer",
      name: transcript.customer.name,
      time: "02:50",
      text: "You too, goodbye!",
      type: "customer",
    },
    {
      speaker: "System",
      time: "02:55",
      text: "Call ended",
      type: "system",
    },
  ]

  const insights = [
    {
      category: "Customer Sentiment",
      value: "Positive (85/100)",
      details: "Customer sentiment improved from neutral to positive during the call.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600" />,
    },
    {
      category: "Key Topics",
      value: "Account Access, Password Reset",
      details: "The main topics discussed were related to account access issues and password reset procedures.",
      icon: <Tag className="h-5 w-5 text-indigo-600" />,
    },
    {
      category: "Resolution",
      value: "Resolved Successfully",
      details: "The customer's issue was successfully resolved during the call.",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
    {
      category: "Agent Performance",
      value: "Excellent (92/100)",
      details: "Agent followed proper verification procedures and provided clear instructions.",
      icon: <User className="h-5 w-5 text-indigo-600" />,
    },
    {
      category: "Follow-up Required",
      value: "No",
      details: "No follow-up actions are required as the issue was resolved during the call.",
      icon: <MessageSquare className="h-5 w-5 text-slate-600" />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Transcript {transcript.id}
              <Badge variant="secondary" className="ml-2">
                {transcript.date}
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Full View
              </Button>
            </div>
          </div>
          <DialogDescription>
            Call between {transcript.customer.name} and {transcript.agent.name} • {transcript.duration} duration
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "transcript" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("transcript")}
          >
            Transcript
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "insights" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("insights")}
          >
            Insights
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "metadata" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("metadata")}
          >
            Metadata
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === "transcript" && (
            <div className="space-y-4">
              {transcriptContent.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.type === "system"
                      ? "justify-center"
                      : message.type === "agent"
                        ? "justify-start"
                        : "justify-end"
                  }`}
                >
                  {message.type === "system" ? (
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      {message.text}
                    </div>
                  ) : (
                    <div
                      className={`flex max-w-[80%] flex-col gap-1 rounded-lg p-3 ${
                        message.type === "agent" ? "bg-slate-100" : "bg-indigo-100 text-indigo-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.name || message.speaker}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {insight.icon}
                    <div>
                      <h4 className="font-medium">{insight.category}</h4>
                      <p className="text-sm font-semibold">{insight.value}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.details}</p>
                </div>
              ))}

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Sentiment Analysis</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Overall Sentiment</span>
                      <span className="text-sm font-medium">85/100</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="text-sm font-medium">90/100</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Agent Empathy</span>
                      <span className="text-sm font-medium">88/100</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "metadata" && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3">Call Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Call ID</p>
                    <p className="font-medium">{transcript.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{transcript.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{transcript.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call Type</p>
                    <p className="font-medium">Inbound</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{transcript.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{transcript.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium">CUS-7890</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Since</p>
                    <p className="font-medium">Jan 15, 2023</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-3">Agent Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{transcript.agent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agent ID</p>
                    <p className="font-medium">AGT-1234</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">Customer Support</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="font-medium">Account Services</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
