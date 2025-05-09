"use client"

import { useState } from "react"
import {
  Calendar,
  Download,
  Filter,
  Search,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TranscriptsList } from "./components/TranscriptsList"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export default function TranscriptsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'flagged' | 'starred' | 'shared'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)
  const [viewTranscriptDialog, setViewTranscriptDialog] = useState(false)

  const handleViewTranscript = (transcript: Transcript) => {
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
        <Select value={sortBy} onValueChange={setSortBy}>
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

      <Tabs defaultValue="all" className="space-y-4" onValueChange={(value) => setActiveTab(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Transcripts</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <TranscriptsList 
            filter="all"
            search={searchQuery}
            sortBy={sortBy}
            onViewTranscript={handleViewTranscript}
          />
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <TranscriptsList 
            filter="flagged"
            search={searchQuery}
            sortBy={sortBy}
            onViewTranscript={handleViewTranscript}
          />
        </TabsContent>

        <TabsContent value="starred" className="space-y-4">
          <TranscriptsList 
            filter="starred"
            search={searchQuery}
            sortBy={sortBy}
            onViewTranscript={handleViewTranscript}
          />
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <TranscriptsList 
            filter="shared"
            search={searchQuery}
            sortBy={sortBy}
            onViewTranscript={handleViewTranscript}
          />
        </TabsContent>
      </Tabs>

      {selectedTranscript && (
        <Dialog open={viewTranscriptDialog} onOpenChange={setViewTranscriptDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Transcript: {selectedTranscript.callId}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Customer</h3>
                  <p>{selectedTranscript.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTranscript.customer.phone}</p>
                </div>
                {selectedTranscript.agent && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Agent</h3>
                    <p>{selectedTranscript.agent.name}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Summary</h3>
                <p className="text-sm">{selectedTranscript.summary}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTranscript.topics.map((topic, i) => (
                    <div key={i} className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Transcript</h3>
                <div className="border rounded-md p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {Array.isArray(selectedTranscript.content) ? (
                    selectedTranscript.content.map((message: any, index: number) => (
                      <div 
                        key={index} 
                        className={`flex ${message.speaker === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.speaker === 'agent' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="text-xs font-medium mb-1">
                            {message.speaker === 'agent' 
                              ? selectedTranscript.agent?.name || 'Agent' 
                              : selectedTranscript.customer.name}
                          </div>
                          <div>{message.text}</div>
                          {message.timestamp && (
                            <div className="text-xs text-right mt-1 opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Transcript content not available in the expected format.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
