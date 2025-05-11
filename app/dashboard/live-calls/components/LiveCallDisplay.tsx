"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Clock,
  Mic,
  MicOff,
  PhoneForwarded,
  PhoneOff,
  Volume2,
  VolumeX,
  Lightbulb,
  MessageSquare,
  Info,
  Eye
} from "lucide-react";
import { LiveTranscript } from "./LiveTranscript";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/components/ui/use-toast";
import { AISuggestion } from "@/lib/services/ai-assistant";
import { useSession } from "next-auth/react";
import { TranscriptViewDialog } from "../../transcripts/components/TranscriptViewDialog";

interface Participant {
  name: string;
  avatar?: string;
}

interface CallData {
  id: string;
  callSid?: string; // Twilio Call SID
  status: 'connecting' | 'in-progress' | 'completed' | 'missed';
  startTime: Date;
  duration: number; // in seconds
  caller: {
    name: string;
    number: string;
    avatar?: string;
  };
  agent: {
    name: string;
    avatar?: string;
  };
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface Message {
  id: string;
  sender: 'caller' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  confidence?: number;
}

interface LiveCallDisplayProps {
  initialCallData: CallData;
  onEndCall?: (callId: string) => void;
  onTransferCall?: (callId: string) => void;
}

export function LiveCallDisplay({ initialCallData, onEndCall, onTransferCall }: LiveCallDisplayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(initialCallData.duration);
  const [callData, setCallData] = useState<CallData>(initialCallData);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'system',
      text: 'Call connected',
      timestamp: new Date(),
    }
  ]);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewTranscriptDialog, setViewTranscriptDialog] = useState(false);

  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const { data: session } = useSession();

  // Connect to the call room when the component mounts
  useEffect(() => {
    if (socket && isConnected) {
      console.log('Setting up socket listeners for call:', callData.id);
      console.log('Call SID:', initialCallData.callSid);
      
      // Join the call room
      socket.emit('call:join', {
        callId: callData.id,
        callSid: initialCallData.callSid
      });
      
      // Force a direct connection to ensure we're receiving events
      socket.emit('call:connect', {
        callId: callData.id,
        callSid: initialCallData.callSid
      });

      // Create a handler function for transcript updates
      const handleTranscriptUpdate = (data: any) => {
        console.log('RECEIVED TRANSCRIPT UPDATE:', data);
        console.log('Current call ID:', callData.id);
        console.log('Current call SID:', initialCallData.callSid);
        
        // Check if this update is for our call (using either ID or SID)
        const matchesId = data.callId === callData.id;
        const matchesSid = data.callSid === initialCallData.callSid;
        
        console.log('Matches ID:', matchesId);
        console.log('Matches SID:', matchesSid);
        
        if (matchesId || matchesSid) {
          console.log('✅ TRANSCRIPT MATCHES OUR CALL, ADDING TO MESSAGES');
          
          const newMessage: Message = {
            id: data.id || `msg-${Date.now()}`, // Use provided ID or generate one
            sender: data.speaker === 'caller' ? 'caller' :
                    data.speaker === 'agent' ? 'agent' : 'system',
            text: data.transcript,
            timestamp: new Date(data.timestamp || Date.now()),
            confidence: data.confidence,
          };
          
          // Log the message being added
          console.log('Adding message to transcript:', newMessage);
          
          // Use a callback to ensure we're working with the latest state
          setMessages(prevMessages => {
            // Check if this message already exists (avoid duplicates)
            const exists = prevMessages.some(msg =>
              msg.text === newMessage.text &&
              msg.sender === newMessage.sender
            );
            
            if (exists) {
              console.log('Message already exists, not adding duplicate');
              return prevMessages;
            }
            
            console.log('Adding new message to transcript');
            // Add the new message
            const updatedMessages = [...prevMessages, newMessage];
            
            // Process the new message for AI suggestions
            // Only process if we're not already processing and it's not a system message
            if (!isProcessing && newMessage.sender !== 'system') {
              setIsProcessing(true);
              
              // Only process if we have at least 3 messages (including the system message)
              if (updatedMessages.length >= 3) {
                // Call the AI suggestions API
                fetch('/api/ai-suggestions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    messages: updatedMessages,
                    callId: callData.id,
                  }),
                })
                  .then(response => {
                    if (response.status === 204) {
                      // No suggestion generated
                      console.log('No AI suggestion generated');
                      return null;
                    }
                    return response.json();
                  })
                  .then(suggestion => {
                    if (suggestion && suggestion.confidence >= 0.6) {
                      console.log('✅ New AI suggestion generated:', suggestion);
                      setAiSuggestion(suggestion);
                    }
                    setIsProcessing(false);
                  })
                  .catch(error => {
                    console.error('❌ Error processing message for AI suggestion:', error);
                    setIsProcessing(false);
                  });
              } else {
                // Not enough messages yet
                setIsProcessing(false);
              }
            }
            
            return updatedMessages;
          });
        } else {
          console.log('❌ Transcript does not match our call, ignoring');
          console.log('Data callId:', data.callId);
          console.log('Data callSid:', data.callSid);
        }
      };

      // Listen for transcript updates
      socket.on('call:transcript_update', handleTranscriptUpdate);
      
      // Also listen for the generic transcript event
      socket.on('transcript_update', handleTranscriptUpdate);
      
      // Add a test message to verify the component is working
      setTimeout(() => {
        console.log('Adding test message to transcript');
        setMessages(prev => [
          ...prev,
          {
            id: `test-${Date.now()}`,
            sender: 'system',
            text: 'Test message - If you see this, the component is working correctly',
            timestamp: new Date(),
          }
        ]);
      }, 2000);

      // Listen for call status updates
      socket.on('call:status_update', (data) => {
        if (data.callId === callData.id) {
          setCallData(prev => ({ ...prev, status: data.status }));
          
          if (data.status === 'completed') {
            toast({
              title: "Call Ended",
              description: `Call with ${callData.caller.name} has ended.`,
            });
          }
        }
      });

      // Listen for sentiment updates
      socket.on('call:sentiment_update', (data) => {
        if (data.callId === callData.id) {
          setCallData(prev => ({ ...prev, sentiment: data.sentiment }));
        }
      });

      // Clean up listeners when component unmounts
      return () => {
        socket.off('call:transcript_update');
        socket.off('call:status_update');
        socket.off('call:sentiment_update');
        socket.emit('call:leave', { callId: callData.id });
      };
    }
  }, [socket, isConnected, callData.id]);

  // Timer for call duration
  useEffect(() => {
    if (callData.status === 'in-progress') {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [callData.status]);

  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (socket && isConnected) {
      socket.emit('call:mute', { 
        callId: callData.id, 
        muted: !isMuted 
      });
    }
  };

  // Handle audio toggle
  const handleAudioToggle = () => {
    setIsListening(!isListening);
  };

  // Handle end call
  const handleEndCall = () => {
    if (socket && isConnected) {
      socket.emit('call:end', { callId: callData.id });
      setCallData(prev => ({ ...prev, status: 'completed' }));
    }
    
    if (onEndCall) {
      onEndCall(callData.id);
    }
  };

  // Handle transfer call
  const handleTransferCall = () => {
    if (onTransferCall) {
      onTransferCall(callData.id);
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(elapsedTime)}
            </Badge>
            {callData.sentiment && (
              <Badge variant="secondary" className={getSentimentColor(callData.sentiment)}>
                {callData.sentiment.charAt(0).toUpperCase() + callData.sentiment.slice(1)}
              </Badge>
            )}
          </div>
          <Badge 
            variant={callData.status === 'in-progress' ? 'default' : 'outline'}
            className={callData.status === 'in-progress' ? 'bg-green-100 text-green-800' : ''}
          >
            {callData.status === 'in-progress' ? 'Active Call' : 'Call Ended'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={callData.caller.avatar || "/placeholder.svg"} alt={callData.caller.name} />
              <AvatarFallback>{callData.caller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{callData.caller.name}</h4>
              <p className="text-sm text-muted-foreground">{callData.caller.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h4 className="font-medium">{callData.agent.name}</h4>
              <p className="text-sm text-muted-foreground">Agent</p>
            </div>
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={callData.agent.avatar || "/placeholder.svg"} alt={callData.agent.name} />
              <AvatarFallback>{callData.agent.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Live Transcript */}
        <div className="mt-4 border rounded-md p-2 h-80 overflow-y-auto bg-slate-50 relative">
          <LiveTranscript
            messages={messages}
            caller={callData.caller}
            agent={callData.agent}
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white"
            onClick={() => setViewTranscriptDialog(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Full
          </Button>
        </div>

        {/* Transcript Dialog */}
        {viewTranscriptDialog && (
          <TranscriptViewDialog
            transcript={{
              id: callData.callSid || callData.id,
              customer: {
                name: callData.caller.name,
                phone: callData.caller.number,
                avatar: callData.caller.avatar || "/placeholder.svg",
              },
              agent: {
                name: callData.agent.name,
                avatar: callData.agent.avatar || "/placeholder.svg",
              },
              duration: formatDuration(elapsedTime),
              date: new Date(callData.startTime).toLocaleString(),
              sentiment: callData.sentiment || "neutral",
              topics: ["Account Access", "Password Reset"],
              starred: false,
              flagged: false,
              summary: "Live call in progress",
            }}
            open={viewTranscriptDialog}
            onOpenChange={setViewTranscriptDialog}
          />
        )}

        {/* AI Assistance */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">AI Assistance:</p>
            {isProcessing && (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                Processing...
              </Badge>
            )}
          </div>
          
          {aiSuggestion ? (
            <div className="p-3 bg-indigo-50 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                {aiSuggestion.type === 'response' && <MessageSquare className="h-4 w-4 text-indigo-600 mt-1" />}
                {aiSuggestion.type === 'information' && <Info className="h-4 w-4 text-indigo-600 mt-1" />}
                {aiSuggestion.type === 'action' && <Lightbulb className="h-4 w-4 text-indigo-600 mt-1" />}
                
                <div className="flex-1">
                  <p className="text-indigo-800">
                    <strong>
                      {aiSuggestion.type === 'response' && 'Suggested response:'}
                      {aiSuggestion.type === 'information' && 'Helpful information:'}
                      {aiSuggestion.type === 'action' && 'Recommended action:'}
                    </strong> {aiSuggestion.text}
                  </p>
                  
                  {aiSuggestion.sources && aiSuggestion.sources.length > 0 && (
                    <div className="mt-2 text-xs text-indigo-600">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc list-inside">
                        {aiSuggestion.sources.slice(0, 2).map((source, index) => (
                          <li key={index}>{source.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-500 italic">
              AI suggestions will appear here as the conversation progresses...
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 flex justify-between p-3">
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleMuteToggle}
                  disabled={callData.status !== 'in-progress'}
                >
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleAudioToggle}
                  disabled={callData.status !== 'in-progress'}
                >
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
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleTransferCall}
            disabled={callData.status !== 'in-progress'}
          >
            <PhoneForwarded className="h-4 w-4 mr-1" />
            Transfer
          </Button>
          <Button 
            variant={callData.status === 'in-progress' ? 'destructive' : 'outline'} 
            size="sm" 
            className="h-8"
            onClick={handleEndCall}
            disabled={callData.status !== 'in-progress'}
          >
            <PhoneOff className="h-4 w-4 mr-1" />
            {callData.status === 'in-progress' ? 'End Call' : 'Call Ended'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}