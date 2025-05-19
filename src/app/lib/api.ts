import { z } from "zod";
import axios from "axios";
import { ImageAttachment } from "./types";
import debugLogger from "./debugLogger";

// Use the local proxy API to avoid CORS issues
const API_URL = "/api/proxy";

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

// Visual troubleshooting guide schema
const VisualGuideSchema = z.object({
  title: z.string(),
  content: z.string(),
  format: z.string().default("markdown"),
  difficulty: z.string().optional(),
  time_estimate: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  success_rate: z.number().optional(),
  category: z.string().optional()
});

// Response schema validation for type safety
const TriageResponseSchema = z.object({
  response: z.string(),
  reasoning: z.array(z.any()).optional(),
  tool_calls: z.array(z.any()).optional(),
  completed: z.boolean(),
  trace_id: z.string(),
  classification: ClassificationSchema.optional(),
  visual_guides: z.array(VisualGuideSchema).optional(),
});

// Trace step schema for reasoning steps
const TraceStepSchema = z.object({
  thought: z.string().optional(),
  action: z.string().optional(),
  result: z.any().optional(),
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
  tool_calls: z.array(z.any()).optional(),
  has_images: z.boolean().optional(),
  has_system_info: z.boolean().optional(),
  visual_guides: z.array(VisualGuideSchema).optional(),
});

// Trace list item schema
const TraceListItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  input_preview: z.string(),
  completed: z.boolean(),
});

export type TriageResponse = z.infer<typeof TriageResponseSchema>;
export type Trace = z.infer<typeof TraceSchema>;
export type TraceStep = z.infer<typeof TraceStepSchema>;
export type TraceListItem = z.infer<typeof TraceListItemSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type VisualGuide = z.infer<typeof VisualGuideSchema>;

/**
 * Send a message to the backend triage agent via the proxy API
 * @param message The user's message to process
 * @param images Optional array of image attachments
 * @returns The processed response with typing
 */
export async function sendMessage(
  message: string, 
  images?: ImageAttachment[]
): Promise<TriageResponse> {
  try {
    // Log multimodal request details
    debugLogger.multimodalProcessing(
      message.length,
      images?.length || 0,
      images?.map(img => ({
        id: img.id,
        name: img.name,
        type: img.contentType,
        size: img.base64Data.length
      }))
    );
    // Preprocess images to reduce size if needed
    const processedImages = images?.map(img => {
      // Only send the base64 data, not the full image object
      // Also compress/optimize large images to avoid 500 errors
      if (img.base64Data && img.base64Data.length > 500000) {
        console.log(`Optimizing image ${img.id} from ${img.base64Data.length} bytes`);
        // Simple truncation for now - in a real app, we'd resize the image properly
        return img.base64Data.substring(0, 500000);
      }
      return img.base64Data;
    }) || [];
    
    // Log API request
    debugLogger.apiRequest(API_URL, 'POST', {
      message,
      imagesCount: processedImages.length,
      multimodal: images && images.length > 0
    });
    
    // First try using the proxy API
    const response = await api.post(API_URL, {
      message,
      images: processedImages,
      multimodal: images && images.length > 0
    });

    // Log API response
    debugLogger.apiResponse(API_URL, response.status, {
      trace_id: response.data?.trace_id,
      completed: response.data?.completed,
      has_classification: !!response.data?.classification
    });

    // Validate response shape
    return TriageResponseSchema.parse(response.data);
  } catch (error) {
    // Log detailed error information
    debugLogger.error(error, 'API.sendMessage');
    
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Get detailed error message if available
      let errorDetail = error.response?.data?.detail || error.response?.data?.error || error.message;
      
      // Better handling for structured error responses
      if (typeof errorDetail === 'object') {
        // Log the full structured error for debugging
        console.error('Detailed API error:', errorDetail);
        
        // Create a user-friendly error message
        let userMessage = 'API error';
        
        if (errorDetail.error_type) {
          userMessage += `: ${errorDetail.error_type}`;
        }
        
        if (errorDetail.message) {
          userMessage += ` - ${errorDetail.message}`;
        }
        
        // Add specific help for image errors
        if (errorDetail.error_type === 'Image Processing Error') {
          userMessage += '. Try using smaller images or a different format.';
        }
        
        throw new Error(userMessage);
      } else {
        throw new Error(`API error: ${errorDetail}`);
      }
    }
    
    // Handle validation errors
    throw new Error("Received invalid response format from server");
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
    
    // Use a more reliable trace endpoint path
    const response = await api.get(`${API_URL}`, {
      params: { trace_id: traceId }
    });
    
    // Log successful fetch
    debugLogger.debug(`Trace fetched successfully: ${traceId}`);
    
    return TraceSchema.parse(response.data);
  } catch (error) {
    console.error("Trace fetch error:", error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error || error.message;
      console.error(`Trace fetch failed with status ${status}: ${errorMessage}`);
      throw new Error(`Failed to fetch trace: ${errorMessage}`);
    }
    
    throw new Error("Failed to fetch trace data");
  }
}

/**
 * List recent traces
 * @param limit Maximum number of traces to fetch
 * @returns Array of trace summary items
 */
export async function listTraces(limit: number = 10): Promise<TraceListItem[]> {
  try {
    const response = await api.get(`${API_URL}/traces?limit=${limit}`);
    return z.array(TraceListItemSchema).parse(response.data);
  } catch (error) {
    console.error("Trace list error:", error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(`Failed to list traces: ${errorMessage}`);
    }
    
    throw new Error("Failed to fetch trace list");
  }
}

/**
 * Check if the backend is available
 * @returns Promise resolving to status object with availability info
 */
export async function checkBackendStatus(): Promise<{ 
  status: string; 
  backendConnected: boolean;
  usingMock?: boolean;
}> {
  try {
    const response = await api.get(API_URL);
    return {
      status: response.data?.status || 'error',
      backendConnected: response.data?.backendConnected || false,
      usingMock: response.data?.usingMock
    };
  } catch (error) {
    console.error("Backend health check failed:", error);
    return {
      status: 'error',
      backendConnected: false,
      usingMock: true
    };
  }
}