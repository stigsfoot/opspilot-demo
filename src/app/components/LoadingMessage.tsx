"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const standardLoadingSteps = [
  "Analyzing your issue...",
  "Classifying problem type...",
  "Searching knowledge base...",
  "Finding relevant solutions...",
  "Evaluating best response..."
];

const imageLoadingSteps = [
  "Processing image data...",
  "Analyzing screenshots...",
  "Extracting visual information...",
  "Identifying error messages...",
  "Matching visual patterns...",
  "Integrating image analysis..."
];

interface LoadingMessageProps {
  className?: string;
  processingImages?: boolean;
  stage?: number;
}

export function LoadingMessage({ className, processingImages = false, stage = 0 }: LoadingMessageProps) {
  // If stage is provided, use it instead of the animated state
  const [currentStep, setCurrentStep] = useState(stage || 0);
  
  // Select the appropriate loading steps based on whether we're processing images
  const loadingSteps = processingImages ? imageLoadingSteps : standardLoadingSteps;
  
  // Advance through the loading steps every 1.5 seconds if no stage is provided
  useEffect(() => {
    // Only use the animation if stage is 0 (not specifically provided)
    if (stage === 0) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
      }, 1500);
      
      return () => clearInterval(interval);
    } else {
      // If stage is provided, update currentStep when it changes
      setCurrentStep(Math.min(stage - 1, loadingSteps.length - 1));
    }
  }, [loadingSteps.length, stage]);

  return (
    <Card className={cn(
      "px-4 py-3 shadow-sm flex flex-col bg-muted/50 space-y-2",
      className
    )}>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <div className="animate-pulse h-2 w-2 rounded-full bg-current" />
          <div className="animate-pulse h-2 w-2 rounded-full bg-current delay-150" />
          <div className="animate-pulse h-2 w-2 rounded-full bg-current delay-300" />
        </div>
        <span className="text-sm font-medium">{loadingSteps[currentStep]}</span>
      </div>
      
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full animate-progress"
          style={{
            width: `${(currentStep + 1) * (100 / loadingSteps.length)}%`,
            transition: "width 1.5s ease"
          }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground italic">
        {processingImages 
          ? "The AI assistant is analyzing your images and working on your request..."
          : "The AI assistant is working on your request..."}
      </div>
    </Card>
  );
}