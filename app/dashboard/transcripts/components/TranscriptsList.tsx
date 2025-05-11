"use client"

import { useState, useEffect } from "react"
import { TranscriptCard } from "./TranscriptCard"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

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

interface TranscriptsListProps {
  filter: 'all' | 'flagged' | 'starred' | 'shared';
  search: string;
  sortBy: string;
  onViewTranscript: (transcript: Transcript) => void;
}

export function TranscriptsList({ filter, search, sortBy, onViewTranscript }: TranscriptsListProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const pageSize = 5

  useEffect(() => {
    const fetchTranscripts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Build the query parameters
        const params = new URLSearchParams({
          filter,
          page: page.toString(),
          pageSize: pageSize.toString(),
          sortBy
        })
        
        if (search) {
          params.append('search', search)
        }
        
        // Make the API call
        const response = await fetch(`/api/transcripts?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Error fetching transcripts: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        setTranscripts(data.transcripts)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.totalCount)
      } catch (err) {
        console.error('Failed to fetch transcripts:', err)
        setError('Failed to load transcripts. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to load transcripts. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchTranscripts()
  }, [filter, search, sortBy, page, toast])

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-slate-100 animate-pulse rounded-lg"></div>
        <div className="h-40 bg-slate-100 animate-pulse rounded-lg"></div>
        <div className="h-40 bg-slate-100 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (transcripts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No transcripts found matching your criteria.</p>
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
            showFlagReason={filter === 'flagged'}
            showSharedInfo={filter === 'shared'}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)}</strong> of <strong>{totalCount}</strong> transcripts
          </div>
          <Button 
            variant="outline" 
            className="mx-2" 
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNumber = i + 1
              return (
                <Button
                  key={i}
                  variant={pageNumber === page ? "outline" : "ghost"}
                  className="h-8 w-8 p-0"
                  disabled={pageNumber === page}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            {totalPages > 5 && (
              <>
                <span className="mx-2">...</span>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          <Button 
            variant="outline" 
            className="mx-2" 
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}