"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Lightbulb, MessageSquare, Info } from "lucide-react";
import { AISuggestion } from "@/lib/services/ai-assistant";

interface Message {
  id: string;
  sender: 'caller' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  confidence?: number;
}

interface Participant {
  name: string;
  avatar?: string;
}

interface LiveTranscriptProps {
  messages: Message[];
  caller: Participant;
  agent: Participant;
  aiSuggestion: AISuggestion | null;
  afterCallerMessage?: boolean; // Show AI suggestion after caller messages
}

export function LiveTranscript({ 
  messages, 
  caller, 
  agent, 
  aiSuggestion, 
  afterCallerMessage = true 
}: LiveTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiSuggestion]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Find the last caller message index to insert AI suggestion after it
  const lastCallerMessageIndex = afterCallerMessage 
    ? messages.map(m => m.sender).lastIndexOf('caller')
    : -1;

  return (
    <div className="flex flex-col space-y-4 p-2">
      {messages.map((message, index) => (
        <div key={message.id}>
          <div
            className={cn(
              "flex items-start gap-3",
              message.sender === 'caller' ? "justify-start max-w-[85%]" : "",
              message.sender === 'agent' ? "justify-end ml-auto max-w-[85%]" : "",
              message.sender === 'system' ? "justify-center mx-auto max-w-full w-full" : ""
            )}
          >
            {message.sender === 'caller' && (
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={caller.avatar || "/placeholder.svg"} alt={caller.name} />
                <AvatarFallback>{caller.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "rounded-lg p-3 text-sm flex-1",
                message.sender === 'caller' ? "bg-slate-100 mr-12" : "",
                message.sender === 'agent' ? "bg-blue-100 ml-12" : "",
                message.sender === 'system' ? "bg-slate-50 text-slate-500 text-center text-xs py-1" : ""
              )}
            >
              {message.sender !== 'system' && (
                <div className="font-medium mb-1">
                  {message.sender === 'caller' ? caller.name : agent.name}
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              <div>{message.text}</div>
              {message.confidence !== undefined && (
                <div className="text-xs text-muted-foreground mt-1">
                  Confidence: {Math.round(message.confidence * 100)}%
                </div>
              )}
            </div>

            {message.sender === 'agent' && (
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Insert AI suggestion after the last caller message */}
          {aiSuggestion && index === lastCallerMessageIndex && (
            <div className="mx-auto my-4 max-w-[90%]">
              <div className="p-4 bg-indigo-50 rounded-lg text-sm border border-indigo-100 shadow-sm">
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
                          {aiSuggestion.sources.slice(0, 2).map((source, idx) => (
                            <li key={idx}>{source.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}