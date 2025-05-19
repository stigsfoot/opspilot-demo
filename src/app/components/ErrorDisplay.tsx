"use client";

import React from "react";
import { 
  AlertCircle, 
  ImageOff, 
  WifiOff, 
  ServerCrash, 
  RefreshCcw,
  FileWarning
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorDisplay({ error, onRetry, showRetry = true }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Determine the error type based on the error message
  const getErrorTypeInfo = () => {
    const lowerMsg = errorMessage.toLowerCase();
    
    if (lowerMsg.includes('image') && (lowerMsg.includes('processing') || lowerMsg.includes('size'))) {
      return {
        icon: <ImageOff className="h-5 w-5 text-destructive" />,
        title: "Image Processing Error",
        description: errorMessage,
        suggestion: "Try using a smaller image or a different format (JPEG, PNG)."
      };
    } else if (lowerMsg.includes('network') || lowerMsg.includes('connect') || lowerMsg.includes('timeout')) {
      return {
        icon: <WifiOff className="h-5 w-5 text-destructive" />,
        title: "Connection Error",
        description: errorMessage,
        suggestion: "Check your internet connection and try again."
      };
    } else if (lowerMsg.includes('server') || lowerMsg.includes('500')) {
      return {
        icon: <ServerCrash className="h-5 w-5 text-destructive" />,
        title: "Server Error",
        description: errorMessage,
        suggestion: "There was a problem with the server. Please try again later."
      };
    } else if (lowerMsg.includes('multimodal') || lowerMsg.includes('reasoning')) {
      return {
        icon: <FileWarning className="h-5 w-5 text-destructive" />,
        title: "Processing Error",
        description: errorMessage,
        suggestion: "The system couldn't process your request with the provided context."
      };
    } else {
      return {
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        title: "Error",
        description: errorMessage,
        suggestion: "Please try again or contact support if the problem persists."
      };
    }
  };
  
  const errorInfo = getErrorTypeInfo();
  
  return (
    <Alert variant="destructive" className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        {errorInfo.icon}
        <div>
          <AlertTitle>{errorInfo.title}</AlertTitle>
          <AlertDescription className="mt-1">
            {errorInfo.description}
          </AlertDescription>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <p className="text-sm text-muted-foreground">
          {errorInfo.suggestion}
        </p>
        
        {showRetry && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 self-end"
            onClick={onRetry}
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            Try Again
          </Button>
        )}
      </div>
    </Alert>
  );
}