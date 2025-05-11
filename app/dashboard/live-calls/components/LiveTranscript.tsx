"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
}

export function LiveTranscript({ messages, caller, agent }: LiveTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col space-y-4 p-2">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={cn(
            "flex items-start gap-2 max-w-[80%]",
            message.sender === 'agent' ? "ml-auto" : "",
            message.sender === 'system' ? "mx-auto max-w-full w-full" : ""
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
              "rounded-lg p-3 text-sm",
              message.sender === 'caller' ? "bg-slate-100" : "",
              message.sender === 'agent' ? "bg-blue-100" : "",
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
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}