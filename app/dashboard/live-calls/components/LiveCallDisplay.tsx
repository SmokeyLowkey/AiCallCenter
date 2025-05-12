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
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewTranscriptDialog, setViewTranscriptDialog] = useState(false);

  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const { data: session } = useSession();

  // Fetch existing transcript when the component mounts
  useEffect(() => {
    // Initialize with a system message
    setMessages([
      {
        id: 'system-connected',
        sender: 'system',
        text: 'Call connected',
        timestamp: new Date(),
      }
    ]);

    // Fetch any existing transcript for this call
    const fetchExistingTranscript = async () => {
      try {
        const response = await fetch(`/api/transcripts/call/${callData.id}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.content && Array.isArray(data.content)) {
            // Transform the transcript content into messages
            const existingMessages = data.content.map((item: any) => ({
              id: item.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sender: item.speaker === 'caller' ? 'caller' :
                     item.speaker === 'agent' ? 'agent' : 'system',
              text: item.text || item.transcript,
              timestamp: new Date(item.timestamp || Date.now()),
              confidence: item.confidence,
            }));
            
            // Add the existing messages to the state
            setMessages(prev => {
              // Filter out duplicates
              const newMessages = existingMessages.filter((newMsg: Message) =>
                !prev.some((existingMsg: Message) =>
                  existingMsg.text === newMsg.text &&
                  existingMsg.sender === newMsg.sender
                )
              );
              
              return [...prev, ...newMessages];
            });
          }
        }
      } catch (error) {
        console.error('Error fetching existing transcript:', error);
      }
    };
    
    fetchExistingTranscript();
  }, [callData.id]);

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

      // Request the latest transcript
      socket.emit('call:request_transcript', {
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
            // Use the message ID if available, otherwise fall back to text+sender comparison
            const exists = prevMessages.some(msg => {
              // If both messages have IDs, compare them
              if (msg.id && newMessage.id) {
                return msg.id === newMessage.id;
              }
              
              // Otherwise, compare text and sender
              return msg.text === newMessage.text &&
                     msg.sender === newMessage.sender;
            });
            
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
                      
                      // Add the AI suggestion to the transcript immediately
                      const suggestionMessage: Message = {
                        id: `ai-suggestion-${Date.now()}`,
                        sender: 'system',
                        text: `AI Suggestion: ${suggestion.type} - ${suggestion.text}`,
                        timestamp: new Date(),
                      };
                      
                      // Add the suggestion to the messages
                      setMessages(prev => [...prev, suggestionMessage]);
                      
                      // Send the suggestion to the server to be saved with the transcript
                      if (socket && isConnected) {
                        socket.emit('call:transcript_update', {
                          callId: callData.id,
                          callSid: callData.callSid,
                          id: suggestionMessage.id,
                          speaker: 'system',
                          transcript: suggestionMessage.text,
                          timestamp: suggestionMessage.timestamp,
                        });
                      }
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
      
      // No longer need the test message as we're fetching real data

      // Listen for call status updates
      socket.on('call:status_update', (data) => {
        if (data.callId === callData.id) {
          setCallData(prev => ({ ...prev, status: data.status }));
          
          if (data.status === 'completed') {
            // Save AI suggestion to transcript if available
            if (aiSuggestion) {
              const suggestionMessage: Message = {
                id: `ai-suggestion-${Date.now()}`,
                sender: 'system',
                text: `AI Suggestion: ${aiSuggestion.type} - ${aiSuggestion.text}`,
                timestamp: new Date(),
              };
              
              // Add the suggestion to the messages
              setMessages(prev => [...prev, suggestionMessage]);
              
              // Send the suggestion to the server to be saved with the transcript
              if (socket && isConnected) {
                socket.emit('call:transcript_update', {
                  callId: callData.id,
                  callSid: callData.callSid,
                  id: suggestionMessage.id,
                  speaker: 'system',
                  transcript: suggestionMessage.text,
                  timestamp: suggestionMessage.timestamp,
                });
              }
            }
            
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
        <div className="mt-4 border rounded-md p-2 h-[32rem] overflow-y-auto bg-slate-50 relative">
          {isProcessing && (
            <Badge
              variant="outline"
              className="absolute top-2 left-2 bg-blue-50 text-blue-800 border-blue-200 z-10"
            >
              Processing...
            </Badge>
          )}
          <LiveTranscript
            messages={messages}
            caller={callData.caller}
            agent={callData.agent}
            aiSuggestion={aiSuggestion}
            afterCallerMessage={true}
          />
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