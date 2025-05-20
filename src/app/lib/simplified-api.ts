/**
 * Simplified API client for IT support system
 * Provides streamlined communication with the simplified API route
 */

import { z } from "zod";
import axios from "axios";
import { ImageAttachment } from "./types";
import debugLogger from "./debugLogger";

// Use a consistent API endpoint
const API_URL = "/api/simplified-route";

// Create axios instance with default config
const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Category schema
const CategorySchema = z.object({
  category: z.string(),
  confidence: z.number(),
});

// Classification schema
const ClassificationSchema = z.object({
  results: z.record(z.number()),
  top_categories: z.array(CategorySchema),
});

// Response schema validation for type safety
const TriageResponseSchema = z.object({
  response: z.string(),
  reasoning: z.array(z.any()).optional(),
  completed: z.boolean(),
  trace_id: z.string(),
  classification: ClassificationSchema.optional(),
});

// Trace step schema for reasoning steps
const TraceStepSchema = z.object({
  thought: z.string().optional(),
  step: z.number().optional(),
  tool: z.string().optional(),
  tool_input: z.any().optional(),
  tool_output: z.any().optional(),
});

// Complete trace schema
const TraceSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  input: z.string(),
  final_output: z.string(),
  completed: z.boolean(),
  steps: z.array(TraceStepSchema),
  classification: ClassificationSchema.optional(),
  has_images: z.boolean().optional(),
});

export type TriageResponse = z.infer<typeof TriageResponseSchema>;
export type Trace = z.infer<typeof TraceSchema>;
export type TraceStep = z.infer<typeof TraceStepSchema>;
export type Category = z.infer<typeof CategorySchema>;

/**
 * Send a message to the API
 * @param message The user's message to process
 * @param images Optional array of image attachments
 * @returns The processed response with typing
 */
export async function sendMessage(
  message: string, 
  images?: ImageAttachment[]
): Promise<TriageResponse> {
  try {
    // Optimize images to prevent large payloads
    const processedImages = images?.map(img => {
      // Simple truncation for large images
      if (img.base64Data && img.base64Data.length > 500000) {
        console.log(`Optimizing image ${img.id} from ${img.base64Data.length} bytes`);
        return img.base64Data.substring(0, 500000);
      }
      return img.base64Data;
    }) || [];
    
    // Log API request
    debugLogger.apiRequest(API_URL, 'POST', {
      message,
      imagesCount: processedImages.length,
    });
    
    // Send request to the API
    const response = await api.post(API_URL, {
      message,
      images: processedImages
    });

    // Log API response
    debugLogger.apiResponse(API_URL, response.status, {
      trace_id: response.data?.trace_id,
      completed: response.data?.completed,
    });

    // Validate response shape
    return TriageResponseSchema.parse(response.data);
  } catch (error) {
    // Log detailed error information
    debugLogger.error(error, 'SimplifiedAPI.sendMessage');
    
    // Handle errors
    if (axios.isAxiosError(error)) {
      throw new Error(`API error: ${error.response?.data?.message || error.message}`);
    }
    
    throw new Error("Failed to process your request");
  }
}

/**
 * Fetch a specific trace by ID
 * @param traceId The ID of the trace to fetch
 * @returns The complete trace with reasoning steps
 */
export async function getTrace(traceId: string): Promise<Trace> {
  try {
    // Log the trace fetch attempt
    debugLogger.debug(`Fetching trace: ${traceId}`);
    
    // Get the trace
    const response = await api.get(API_URL, {
      params: { trace_id: traceId }
    });
    
    // Validate and return
    return TraceSchema.parse(response.data);
  } catch (error) {
    console.error("Trace fetch error:", error);
    
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch trace: ${error.response?.data?.error || error.message}`);
    }
    
    throw new Error("Failed to fetch trace data");
  }
}

/**
 * Check if the API is available
 * @returns Promise resolving to status object with availability info
 */
export async function checkStatus(): Promise<{ 
  status: string; 
  directImplementation?: boolean;
}> {
  try {
    const response = await api.get(API_URL);
    return {
      status: response.data?.status || 'error',
      directImplementation: response.data?.directImplementation
    };
  } catch (error) {
    console.error("API health check failed:", error);
    return {
      status: 'error'
    };
  }
}