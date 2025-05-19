"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { VisualGuide } from "../lib/api";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Clipboard, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface VisualTroubleshootingGuideProps {
  guide: VisualGuide;
  className?: string;
}

export function VisualTroubleshootingGuide({ guide, className }: VisualTroubleshootingGuideProps) {
  // Function to handle guide download
  const handleDownload = () => {
    // Create blob from content
    const blob = new Blob([guide.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    
    // Create temporary anchor to download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${guide.title.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Function to copy guide to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(guide.content)
      .then(() => {
        // You could add a toast notification here
        console.log("Guide copied to clipboard");
      })
      .catch(err => {
        console.error("Failed to copy guide: ", err);
      });
  };
  
  return (
    <Card className={`overflow-hidden ${className || ""}`}>
      <CardHeader className="bg-muted/20 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {guide.title}
            </CardTitle>
            <CardDescription>
              Troubleshooting guide based on your IT issue
              {guide.category && (
                <span className="ml-1">({guide.category})</span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className="text-xs">
              {guide.format}
            </Badge>
            {guide.difficulty && (
              <Badge 
                variant="outline" 
                className={`text-xs ${guide.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 
                  guide.difficulty === 'medium' ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 
                  'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}
              >
                {guide.difficulty.charAt(0).toUpperCase() + guide.difficulty.slice(1)} difficulty
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {(guide.time_estimate || guide.success_rate) && (
          <div className="px-4 pt-3 pb-1 flex flex-wrap gap-3">
            {guide.time_estimate && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Est. time: {guide.time_estimate}</span>
              </div>
            )}
            {guide.success_rate && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Success rate: {Math.round(guide.success_rate * 100)}%</span>
              </div>
            )}
          </div>
        )}
        
        {guide.prerequisites && guide.prerequisites.length > 0 && (
          <div className="mx-4 mt-2 mb-1">
            <Alert variant="warning" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Prerequisites: {guide.prerequisites.join(", ")}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Accordion type="single" collapsible defaultValue="guide-content">
          <AccordionItem value="guide-content" className="border-0">
            <AccordionTrigger className="px-4 py-2 text-sm">
              Step-by-step instructions
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <ScrollArea className="max-h-80 rounded-md">
                <div className="px-4 pb-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{guide.content}</ReactMarkdown>
                  </div>
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 py-2 px-4 bg-muted/20">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8"
          onClick={handleCopy}
        >
          <Clipboard className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}