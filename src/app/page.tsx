"use client";

import SimplifiedChatBox from "./components/SimplifiedChatBox";
// QueryClient and QueryClientProvider are no longer needed here
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
// import { useState } from "react";

export default function Home() {
  // The QueryClient is now provided by RootLayout via Providers.tsx
  // const [queryClient] = useState(() => new QueryClient({
  //   defaultOptions: {
  //     queries: {
  //       staleTime: Infinity,
  //       retry: 1,
  //     },
  //   },
  // }));
  return (
    // <QueryClientProvider client={queryClient}> // This wrapper is no longer needed
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b py-6 px-4 md:px-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">ITSM OpsPilot</h1>
            <p className="text-muted-foreground">AI-powered IT Service Management Triage & Resolution</p>
          </div>
        </header>
        
        <main className="py-8 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <SimplifiedChatBox />
          </div>
        </main>
      
      <footer className="border-t py-6 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Powered by Gemini 2.5 Pro Preview
          </div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Help</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
    // </QueryClientProvider> // This wrapper is no longer needed
  );
}
