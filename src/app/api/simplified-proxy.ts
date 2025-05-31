/**
 * Enhanced API implementation that calls our backend triage agent with handoff functionality
 */

import { z } from "zod";

// Define schema for validation
const ResponseSchema = z.object({
  response: z.string(),
  reasoning: z.array(z.any()).optional(),
  classification: z.object({
    results: z.record(z.number()),
    top_categories: z.array(z.object({
      category: z.string(),
      confidence: z.number()
    }))
  }).optional(),
  completed: z.boolean(),
  trace_id: z.string()
});

export type DirectResponse = z.infer<typeof ResponseSchema>;

// Memory storage for traces
export const SIMPLIFIED_TRACES = new Map();

/**
 * Enhanced API function that calls our backend triage agent with handoff functionality
 */
export async function callDirectApi(message: string, images?: string[]): Promise<DirectResponse> {
  try {
    // Create a trace ID
    const traceId = `direct-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Call our backend triage API instead of Gemini directly
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${backendUrl}/api/triage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        images: images || [],
        system_info: null
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const backendResult = await response.json();
    
    // Transform backend response to match frontend schema
    const transformedResponse: DirectResponse = {
      response: backendResult.response || "I processed your request.",
      reasoning: backendResult.reasoning || [],
      classification: backendResult.classification,
      completed: backendResult.completed || true,
      trace_id: backendResult.trace_id || traceId
    };

    // Store trace for retrieval
    if (backendResult.trace_id) {
      SIMPLIFIED_TRACES.set(backendResult.trace_id, {
        id: backendResult.trace_id,
        timestamp: new Date().toISOString(),
        input: message,
        final_output: backendResult.response,
        completed: backendResult.completed || true,
        steps: backendResult.reasoning || [],
        classification: backendResult.classification,
        handoff_events: backendResult.handoff_events || [],
        business_impact: backendResult.business_impact,
        handoff_decision: backendResult.handoff_decision
      });
    }

    return transformedResponse;
  } catch (error) {
    // Handle timeout specifically
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error('Backend API call timed out:', error);
      
      const traceId = `timeout-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      return {
        response: "The request timed out. Please try again later.",
        completed: false,
        trace_id: traceId,
        reasoning: [
          {
            step: 1,
            thought: "Request timed out",
            tool: "timeout_handler",
            tool_output: { error: "Request exceeded the timeout limit of 30 seconds." }
          }
        ]
      };
    }

    console.error('Backend API call failed:', error);
    
    // Fallback to a simple error response
    const traceId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      response: "I'm experiencing technical difficulties. Please try again or contact support directly.",
      completed: false,
      trace_id: traceId,
      reasoning: [
        {
          step: 1,
          thought: "Error occurred while processing request",
          tool: "error_handler",
          tool_output: { error: error instanceof Error ? error.message : "Unknown error" }
        }
      ]
    };
  }
}

/**
 * Get a trace by ID from memory storage
 */
export function getTrace(traceId: string) {
  return SIMPLIFIED_TRACES.get(traceId) || null;
}