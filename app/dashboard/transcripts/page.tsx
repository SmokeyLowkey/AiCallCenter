"use client"

import { useState } from "react"
import {
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TranscriptsList } from "./components/TranscriptsList"
import { TranscriptViewDialog } from "./components/TranscriptViewDialog"

interface Transcript {
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
          <div className="text-sm text-muted-foreground">
            Showing transcripts matching your search criteria
          </div>
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
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Flagged Transcripts</AlertTitle>
            <AlertDescription>
              These transcripts have been flagged for review due to customer sentiment, compliance issues, or agent
              escalation.
            </AlertDescription>
          </Alert>
          
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
        <TranscriptViewDialog
          transcript={selectedTranscript}
          open={viewTranscriptDialog}
          onOpenChange={setViewTranscriptDialog}
        />
      )}
    </div>
  )
}
