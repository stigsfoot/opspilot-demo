"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendMessage, getTrace } from "../lib/api";
import { Message, ImageAttachment } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorDisplay } from "./ErrorDisplay";
import { AlertCircle, SendIcon, Loader2, Info, HelpCircle, Keyboard, Image as ImageIcon, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { LoadingMessage } from "./LoadingMessage";
import { TraceViewer } from "./TraceViewer";
import { WelcomeScreen } from "./WelcomeScreen";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { ImageUploadButton } from "./ImageUploadButton";

export default function ChatBox() {
  // State for all UI elements
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your IT support assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);
  const [isTraceViewerOpen, setIsTraceViewerOpen] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([]);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Show welcome screen on first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);
  
  // Handle welcome screen close
  const handleCloseWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
    // Focus the input after closing welcome screen
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // Function to handle image selection
  const handleImagesSelected = (images: ImageAttachment[]) => {
    setPendingImages(prev => [...prev, ...images]);
  };
  
  // Function to remove a pending image
  const handleRemoveImage = (imageId: string) => {
    setPendingImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Message mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (message: string) => {
      // Convert images to base64 strings for API
      const imageBase64s = pendingImages.map(img => img.base64Data);
      return sendMessage(message, imageBase64s.length > 0 ? imageBase64s : undefined);
    },
    onMutate: (newMessage) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: newMessage,
        timestamp: new Date(),
        images: pendingImages.length > 0 ? [...pendingImages] : undefined,
      };
      
      // Add temporary loading message for the assistant
      const loadingMessage: Message = {
        id: `loading-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
        // Special handling for image uploads
        processingImages: pendingImages.length > 0,
      };
      
      setMessages(prev => [...prev, userMessage, loadingMessage]);
      setError(null);
      setActiveTraceId(null);
      setIsTraceViewerOpen(false);
      
      // Clear input and reset images
      setInput("");
      
      // Focus the input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // Start the processing stage animation
      setProcessingStage(1);
      const stageInterval = setInterval(() => {
        setProcessingStage(prev => {
          if (prev >= 5) {
            clearInterval(stageInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      
      // Clean up the interval if the response comes back quickly
      return () => clearInterval(stageInterval);
    },
    onSuccess: (data, variables, context) => {
      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        
        // Create the assistant message with trace ID and classification data
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          classification: data.classification?.top_categories || [],
          traceId: data.trace_id,
        };
        
        // Add visual guides if available
        if (data.visual_guides && data.visual_guides.length > 0) {
          assistantMessage.visualGuides = data.visual_guides.map(guide => ({
            title: guide.title,
            content: guide.content,
            format: guide.format || "markdown"
          }));
        }
        
        // Save the active trace ID for potential viewing
        setActiveTraceId(data.trace_id);
        
        return [...filtered, assistantMessage];
      });
      
      // Reset processing stage
      setProcessingStage(0);
    },
    onError: (error) => {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Set error message
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      
      // Add error message from assistant
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting to the system right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Reset processing stage
      setProcessingStage(0);
    },
  });

  // Open trace viewer for a specific message
  const handleViewTrace = (traceId: string) => {
    setActiveTraceId(traceId);
    setIsTraceViewerOpen(true);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use a more reliable approach for scrolling
        const scrollToBottom = () => {
          try {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'smooth'
            });
          } catch (e) {
            // Fallback for browsers that don't support scrollTo with options
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        };
        
        // Try multiple times to ensure rendering is complete
        scrollToBottom();
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 300);
      }
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    if ((!trimmedInput && pendingImages.length === 0) || isPending) return;
    
    // If there's no text but there are images, add a default message
    const messageText = trimmedInput || "I'm having an issue (see attached images)";
    
    mutate(messageText);
    
    // Clear pending images after submission
    setPendingImages([]);
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Skip if targeting input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      // Focus input with /
      if (e.key === '/' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Shortcuts that use Shift modifier
      if (e.shiftKey && !e.ctrlKey && !e.altKey) {
        // View trace with Shift+T
        if (e.key === 'T' && activeTraceId) {
          e.preventDefault();
          setIsTraceViewerOpen(true);
        }
        
        // Clear messages with Shift+C
        else if (e.key === 'C') {
          e.preventDefault();
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: "Hello! I'm your IT support assistant. How can I help you today?",
              timestamp: new Date(),
            },
          ]);
        }
        
        // Show help with Shift+H
        else if (e.key === 'H') {
          e.preventDefault();
          setShowKeyboardShortcuts(true);
        }
        
        // Show welcome screen with Shift+W
        else if (e.key === 'W') {
          e.preventDefault();
          setShowWelcome(true);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeTraceId]);

  return (
    <div className="flex flex-col h-[80vh] border rounded-lg overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">IT Support Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask about IT issues, password resets, software installations, and more
          </p>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowKeyboardShortcuts(true)}
            className="h-8 w-8"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowWelcome(true)}
            className="h-8 w-8"
            title="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 stagger-fade-in min-h-full">
          {messages.map((message) => (
            message.isLoading ? (
              <LoadingMessage 
                key={message.id} 
                className="animate-fade-in" 
                processingImages={message.processingImages}
              />
            ) : (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onViewTrace={message.traceId ? () => handleViewTrace(message.traceId!) : undefined}
                className="animate-fade-in"
              />
            )
          ))}
          {/* Invisible element to help with scrolling */}
          <div id="scroll-anchor"></div>
        </div>
      </ScrollArea>
      
      {/* Error message */}
      {error && (
        <div className="mx-4 mb-4 animate-fade-in">
          <ErrorDisplay 
            error={error} 
            onRetry={() => {
              // Reset error state
              setError(null);
              // Re-send the last message if available
              const lastMessage = messages.find(msg => msg.role === "user");
              if (lastMessage && lastMessage.content) {
                mutate(lastMessage.content);
              }
            }}
          />
        </div>
      )}
      
      {/* Trace viewer dialog */}
      {activeTraceId && isTraceViewerOpen && (
        <TraceViewer 
          traceId={activeTraceId} 
          isOpen={isTraceViewerOpen}
          onClose={() => setIsTraceViewerOpen(false)}
        />
      )}
      
      {/* Welcome screen */}
      <WelcomeScreen isOpen={showWelcome} onClose={handleCloseWelcome} />
      
      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        {/* Display pending images */}
        {pendingImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
            {pendingImages.map((image) => (
              <div 
                key={image.id}
                className="relative group h-16 w-16 rounded-md overflow-hidden border"
              >
                <img 
                  src={image.url} 
                  alt={image.name} 
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-0 right-0 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your IT issue..."
            className="flex-1 min-h-24 resize-none"
            disabled={isPending}
          />
          
          {/* Image upload and submit button row */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex-shrink-0">
              <ImageUploadButton 
                onImagesSelected={handleImagesSelected} 
                disabled={isPending}
              />
            </div>
            
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10"
              disabled={isPending || (input.trim() === "" && pendingImages.length === 0)}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground flex justify-between">
          <span>
            Press <kbd className="px-1 py-0.5 text-xs rounded border bg-muted">Enter</kbd> to send, 
            <kbd className="px-1 py-0.5 text-xs rounded border bg-muted">Shift</kbd>+<kbd className="px-1 py-0.5 text-xs rounded border bg-muted">Enter</kbd> for new line
          </span>
          <span className="text-muted-foreground">Powered by Gemini 2.5 Pro</span>
        </div>
      </form>
    </div>
  );
}