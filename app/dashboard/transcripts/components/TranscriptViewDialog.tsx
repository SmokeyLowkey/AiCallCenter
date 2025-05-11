"use client"

import { useState, useEffect } from "react"
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Share2,
  ThumbsDown,
  ThumbsUp,
  User,
  Tag,
  MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TranscriptViewDialogProps {
  transcript: {
    id: string;
    customer: {
      name: string;
      phone: string;
      avatar: string;
    };
    agent: {
      name: string;
      avatar: string;
    };
    date: string;
    duration: string;
    sentiment: string;
    topics: string[];
    starred: boolean;
    flagged: boolean;
    flagReason?: string;
    shared?: {
      by: string;
      date: string;
      with: string[];
    };
    summary: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TranscriptViewDialog({ transcript: initialTranscript, open, onOpenChange }: TranscriptViewDialogProps) {
  const [activeTab, setActiveTab] = useState("transcript")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullTranscript, setFullTranscript] = useState<any>(initialTranscript)
  const [transcriptContent, setTranscriptContent] = useState<any[]>([])
  
  // Fetch the full transcript data when the dialog opens
  useEffect(() => {
    if (open && initialTranscript.id) {
      setLoading(true)
      setError(null)
      
      fetch(`/api/transcripts/${initialTranscript.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error fetching transcript: ${response.statusText}`)
          }
          return response.json()
        })
        .then(data => {
          setFullTranscript(data)
          
          // Parse the transcript content from JSON
          if (data.content) {
            try {
              // If content is already an array, use it directly
              const content = Array.isArray(data.content) 
                ? data.content 
                : typeof data.content === 'string'
                  ? JSON.parse(data.content)
                  : data.content;
                  
              setTranscriptContent(content.map((item: any) => ({
                ...item,
                type: item.speaker?.toLowerCase() || 'system',
                name: item.speaker === 'agent'
                  ? data.agent?.name || 'Agent'
                  : item.speaker === 'customer' || item.speaker === 'caller'
                    ? data.customer?.name || 'Customer'
                    : undefined
              })))
            } catch (err) {
              console.error('Error parsing transcript content:', err)
              setError('Error parsing transcript content')
            }
          }
        })
        .catch(err => {
          console.error('Error fetching transcript:', err)
          setError('Failed to load transcript details')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, initialTranscript.id])
  
  // Generate insights based on the transcript data
  const insights = [
    {
      category: "Customer Sentiment",
      value: `${fullTranscript.sentiment?.charAt(0).toUpperCase()}${fullTranscript.sentiment?.slice(1) || 'Neutral'} (85/100)`,
      details: "Customer sentiment analysis based on conversation tone and keywords.",
      icon: <ThumbsUp className="h-5 w-5 text-green-600" />,
    },
    {
      category: "Key Topics",
      value: fullTranscript.topics?.join(', ') || 'No topics detected',
      details: "The main topics discussed during the call.",
      icon: <Tag className="h-5 w-5 text-indigo-600" />,
    },
    {
      category: "Resolution",
      value: "Resolved Successfully",
      details: fullTranscript.summary || "No summary available",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
    {
      category: "Agent Performance",
      value: "Excellent (92/100)",
      details: "Agent followed proper procedures and provided clear information.",
      icon: <User className="h-5 w-5 text-indigo-600" />,
    },
    {
      category: "Follow-up Required",
      value: fullTranscript.flagged ? "Yes" : "No",
      details: fullTranscript.flagReason || "No follow-up actions required.",
      icon: <MessageSquare className="h-5 w-5 text-slate-600" />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Transcript {fullTranscript.id}
              <Badge variant="secondary" className="ml-2">
                {fullTranscript.date}
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
            Call between {fullTranscript.customer?.name || 'Unknown Customer'} and {fullTranscript.agent?.name || 'Unassigned Agent'} • {fullTranscript.duration} duration
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
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : transcriptContent.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No transcript content available.</p>
                </div>
              ) : (
                transcriptContent.map((message, index) => (
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
                          <span className="text-xs text-muted-foreground">{message.time || message.timestamp}</span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
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
                    <p className="font-medium">{fullTranscript.callId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{fullTranscript.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{fullTranscript.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Call Type</p>
                    <p className="font-medium">Inbound</p>
                  </div>
                </div>
              </div>

              {fullTranscript.customer ? (
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{fullTranscript.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{fullTranscript.customer.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">Unknown Customer</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">N/A</p>
                    </div>
                  </div>
                </div>
              )}

              {fullTranscript.agent ? (
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Agent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{fullTranscript.agent.name}</p>
                    </div>
                    {fullTranscript.agent.id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Agent ID</p>
                        <p className="font-medium">{fullTranscript.agent.id}</p>
                      </div>
                    )}
                    {fullTranscript.agent.department && (
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{fullTranscript.agent.department}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Agent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">Unassigned</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">No agent assigned to this call</p>
                    </div>
                  </div>
                </div>
              )}
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

// Helper component for the CheckCircle icon
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