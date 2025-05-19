"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Message } from "../lib/types";
import { Bot, User, Info, Lightbulb } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import { MessageImages } from "./MessageImages";
import { VisualTroubleshootingGuide } from "./VisualTroubleshootingGuide";

interface ChatMessageProps {
  message: Message;
  onViewTrace?: () => void;
  className?: string;
}

export function ChatMessage({ message, onViewTrace, className }: ChatMessageProps) {
  const isUser = message.role === "user";
  const formattedTime = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
  }).format(message.timestamp);

  // Determine badge color based on confidence
  const getBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.6) return "secondary";
    return "outline";
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 items-start mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 mt-0.5">
          <Bot className="h-4 w-4" />
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[80%]", isUser && "items-end")}>
        <Card
          className={cn(
            "px-4 py-3 shadow-sm",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/50"
          )}
        >
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          
          {/* Display attached images if any */}
          {message.images && message.images.length > 0 && (
            <MessageImages images={message.images} className="mt-3" />
          )}
          
          {/* Display visual troubleshooting guides if any */}
          {message.visualGuides && message.visualGuides.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.visualGuides.map((guide, index) => (
                <VisualTroubleshootingGuide
                  key={`guide-${index}`}
                  guide={guide}
                />
              ))}
            </div>
          )}
        </Card>
        
        <div className="flex items-center mt-1 space-x-2 text-xs text-muted-foreground">
          <span>{formattedTime}</span>
          
          {message.classification && message.classification.length > 0 && (
            <div className="flex items-center gap-1">
              <TooltipProvider>
                {message.classification.slice(0, 2).map((cat) => (
                  <Tooltip key={cat.category}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant={getBadgeVariant(cat.confidence)}
                        className={cn(
                          "text-xs px-2 py-0 animate-badge-pulse", 
                          cat.confidence >= 0.8 && "animate-badge-pulse"
                        )}
                        style={{
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      >
                        {cat.category.replace(/_/g, " ")}
                        <span className="ml-1 opacity-80 font-mono">
                          {Math.round(cat.confidence * 100)}%
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="font-medium">{cat.category.replace(/_/g, " ")}</p>
                      <p>Confidence: {Math.round(cat.confidence * 100)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to filter by this category</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          )}
          
          {message.traceId && onViewTrace && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 rounded-full" 
                    onClick={onViewTrace}
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>View reasoning trace</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-0.5">
          <User className="h-4 w-4" />
        </Avatar>
      )}
    </div>
  );
}