"use client"

import { useState, useEffect } from "react"
import { 
  AlertCircle,
  Star,
  MoreHorizontal,
  Eye,
  Download,
  Share2,
  Tag,
  Flag,
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Utility functions
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

interface Transcript {
  id: string
  callId: string
  customer: {
    name: string
    phone: string
    avatar: string
  }
  agent: {
    id: string
    name: string
    avatar: string
  } | null
  date: string
  duration: number
  sentiment: string
  topics: string[]
  starred: boolean
  flagged: boolean
  flagReason?: string
  shared: {
    by: string
    date: string
    with: string[]
  } | null
  summary: string
  content: any
}

interface TranscriptsListProps {
  filter?: 'all' | 'flagged' | 'starred' | 'shared'
  search?: string
  sortBy?: string
  onViewTranscript: (transcript: Transcript) => void
}

export function TranscriptsList({ 
  filter = 'all', 
  search = '', 
  sortBy = 'date-desc',
  onViewTranscript 
}: TranscriptsListProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })

  useEffect(() => {
    const fetchTranscripts = async () => {
      setLoading(true)
      try {
        // Build query parameters
        const params = new URLSearchParams()
        
        if (search) {
          params.append('search', search)
        }
        
        if (sortBy) {
          params.append('sortBy', sortBy)
        }
        
        if (filter === 'flagged') {
          params.append('flagged', 'true')
        } else if (filter === 'starred') {
          params.append('starred', 'true')
        } else if (filter === 'shared') {
          params.append('shared', 'true')
        }
        
        params.append('page', pagination.page.toString())
        params.append('limit', pagination.limit.toString())
        
        // Fetch transcripts from API
        const response = await fetch(`/api/transcripts?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch transcripts')
        }
        
        const data = await response.json()
        setTranscripts(data.transcripts)
        setPagination(data.pagination)
      } catch (err) {
        console.error('Error fetching transcripts:', err)
        setError('Failed to load transcripts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscripts()
  }, [filter, search, sortBy, pagination.page, pagination.limit])

  const handleStarTranscript = async (id: string, starred: boolean) => {
    try {
      const response = await fetch('/api/transcripts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'star',
          value: !starred
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update transcript')
      }
      
      // Update local state
      setTranscripts(prevTranscripts => 
        prevTranscripts.map(transcript => 
          transcript.id === id 
            ? { ...transcript, starred: !starred } 
            : transcript
        )
      )
    } catch (err) {
      console.error('Error updating transcript:', err)
    }
  }

  const handleFlagTranscript = async (id: string, flagged: boolean, reason?: string) => {
    try {
      const response = await fetch('/api/transcripts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'flag',
          value: !flagged,
          reason
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update transcript')
      }
      
      // Update local state
      setTranscripts(prevTranscripts => 
        prevTranscripts.map(transcript => 
          transcript.id === id 
            ? { ...transcript, flagged: !flagged, flagReason: !flagged ? reason : undefined } 
            : transcript
        )
      )
    } catch (err) {
      console.error('Error updating transcript:', err)
    }
  }

  if (loading && transcripts.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading transcripts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (transcripts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        <p>No transcripts found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {transcripts.map((transcript) => (
          <TranscriptCard
            key={transcript.id}
            transcript={transcript}
            onView={() => onViewTranscript(transcript)}
            onStar={() => handleStarTranscript(transcript.id, transcript.starred)}
            onFlag={(reason) => handleFlagTranscript(transcript.id, transcript.flagged, reason)}
            showFlagReason={filter === 'flagged'}
            showSharedInfo={filter === 'shared'}
          />
        ))}
      </div>

      <div className="flex items-center justify-center">
        <Button 
          variant="outline" 
          className="mx-2"
          disabled={pagination.page <= 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Previous
        </Button>
        <div className="flex items-center">
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const pageNumber = i + 1
            const isCurrentPage = pageNumber === pagination.page
            
            return (
              <Button 
                key={pageNumber}
                variant={isCurrentPage ? "outline" : "ghost"} 
                className="h-8 w-8 p-0"
                disabled={isCurrentPage}
                onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
              >
                {pageNumber}
              </Button>
            )
          })}
          
          {pagination.pages > 5 && (
            <>
              <span className="mx-2">...</span>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => setPagination(prev => ({ ...prev, page: pagination.pages }))}
              >
                {pagination.pages}
              </Button>
            </>
          )}
        </div>
        <Button 
          variant="outline" 
          className="mx-2"
          disabled={pagination.page >= pagination.pages}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

interface TranscriptCardProps {
  transcript: Transcript
  onView: () => void
  onStar: () => void
  onFlag: (reason?: string) => void
  showFlagReason?: boolean
  showSharedInfo?: boolean
}

function TranscriptCard({ 
  transcript, 
  onView, 
  onStar,
  onFlag,
  showFlagReason = false, 
  showSharedInfo = false 
}: TranscriptCardProps) {
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
              {transcript.callId}
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onStar()
              }}
            >
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
                <DropdownMenuItem onClick={() => onFlag(transcript.flagged ? undefined : "Needs review")}>
                  <Flag className="mr-2 h-4 w-4" />
                  {transcript.flagged ? "Remove Flag" : "Flag for Review"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={transcript.customer.avatar} alt={transcript.customer.name} />
              <AvatarFallback>{transcript.customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{transcript.customer.name}</div>
              <div className="text-sm text-muted-foreground">{transcript.customer.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {transcript.agent && (
              <>
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage src={transcript.agent.avatar} alt={transcript.agent.name} />
                  <AvatarFallback>{transcript.agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{transcript.agent.name}</div>
                  <div className="text-sm text-muted-foreground">Agent</div>
                </div>
              </>
            )}
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
            <AlertTitle>Shared</AlertTitle>
            <AlertDescription>
              Shared by {transcript.shared.by} on{" "}
              {new Date(transcript.shared.date).toLocaleDateString()} with{" "}
              {transcript.shared.with.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <div className="text-sm font-medium mb-1">Summary</div>
          <p className="text-sm text-slate-600">{transcript.summary}</p>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-1">Topics</div>
          <div className="flex flex-wrap gap-2">
            {transcript.topics.map((topic, i) => (
              <Badge key={i} variant="outline" className="bg-slate-100">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 flex justify-between p-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <span className="mr-1">Date:</span>
            <span>{formatDate(transcript.date)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">Duration:</span>
            <span>{formatDuration(transcript.duration)}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          View Transcript
        </Button>
      </CardFooter>
    </Card>
  )
}