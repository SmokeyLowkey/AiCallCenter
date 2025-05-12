import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  MessageSquare, 
  MoreHorizontal, 
  Share2, 
  Star, 
  Tag 
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TranscriptCardProps {
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
    recordingUrl?: string | null;
  };
  onView: () => void;
  showFlagReason?: boolean;
  showSharedInfo?: boolean;
}

export function TranscriptCard({ 
  transcript, 
  onView, 
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
                <DropdownMenuItem
                  onClick={() => {
                    if (transcript.recordingUrl) {
                      window.open(transcript.recordingUrl, '_blank');
                    }
                  }}
                  disabled={!transcript.recordingUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {transcript.recordingUrl ? 'Download Recording' : 'No Recording Available'}
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
          {transcript.agent ? (
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
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h4 className="font-medium">Unassigned</h4>
                <p className="text-sm text-muted-foreground">No Agent</p>
              </div>
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            </div>
          )}
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
              {transcript.topics.map((topic, i) => (
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
        <div className="flex gap-2">
          {transcript.recordingUrl && (
            <Button variant="outline" size="sm" onClick={() => window.open(transcript.recordingUrl!, '_blank')}>
              <Download className="mr-2 h-4 w-4" />
              Recording
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View Transcript
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}