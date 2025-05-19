"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Layers, Search, Zap, Lightbulb, Info, X } from "lucide-react";

interface WelcomeScreenProps {
  onClose: () => void;
  isOpen: boolean;
}

export function WelcomeScreen({ onClose, isOpen }: WelcomeScreenProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Ask about IT issues",
      description: "Describe your IT problem in detail for better results. Include error messages, affected systems, and what you were trying to do. You can also attach screenshots!",
      example: "My computer screen is black and won't turn on even though the power light is on."
    },
    {
      icon: <Layers className="h-10 w-10 text-primary" />,
      title: "Explore agent reasoning",
      description: "Click the info icon next to any response to see how the assistant analyzed your issue and decided on a solution.",
      example: "See the step-by-step thought process, including issue classification and knowledge base search."
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Common issue types",
      description: "The assistant can help with many IT issues, including:",
      items: [
        "Password resets and account lockouts",
        "Network and connectivity problems",
        "Hardware troubleshooting",
        "Software installation and updates",
        "Email and printer issues",
        "Access and permission problems"
      ]
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-primary" />,
      title: "Pro tips",
      description: "Get the most out of your IT support experience:",
      items: [
        "Press Enter to send messages (Shift+Enter for new lines)",
        "Be specific about error messages you're seeing",
        "Try simple troubleshooting steps before asking",
        "Mention if you've already tried certain solutions",
        "Tell us the impact of the issue (e.g., affects whole team)"
      ]
    }
  ];
  
  // Move to the next tip
  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };
  
  // Move to the previous tip
  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bot className="h-6 w-6" />
            Welcome to IT Support Assistant
          </DialogTitle>
          <DialogDescription>
            Your AI-powered IT Service Management solution
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-muted/40 pb-4">
              <div className="flex justify-center">{tips[currentTip].icon}</div>
              <CardTitle className="text-center mt-4">{tips[currentTip].title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-56">
              <p className="mb-4">{tips[currentTip].description}</p>
              
              {tips[currentTip].example && (
                <div className="bg-muted/40 p-3 rounded-md border italic text-sm">
                  "{tips[currentTip].example}"
                </div>
              )}
              
              {tips[currentTip].items && (
                <ul className="space-y-1 mt-2">
                  {tips[currentTip].items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-primary">•</span> {item}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/30 py-3">
              <div className="flex gap-1">
                {tips.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-2 w-8 rounded-full ${i === currentTip ? 'bg-primary' : 'bg-muted'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevTip}>Previous</Button>
                <Button variant="outline" size="sm" onClick={nextTip}>Next</Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={onClose}>
            Don't show again
          </Button>
          <Button onClick={onClose}>
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}