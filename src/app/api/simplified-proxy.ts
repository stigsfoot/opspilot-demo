/**
 * Simplified Direct API implementation
 * Removes unnecessary complexity in the frontend proxy and directly calls Gemini API
 */

import { z } from "zod";
import { ImageAttachment } from "../lib/types";

// Gemini API types
interface GeminiContent {
  parts: {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }[];
  role: string;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    safetyRatings: any[];
  }[];
}

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
 * Simplified API function that directly calls Gemini API
 * No fallbacks, no complex proxy, just direct LLM integration
 */
export async function callDirectApi(message: string, images?: string[]): Promise<DirectResponse> {
  try {
    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please ensure it is set in your server-side environment variables.');
    }
    
    // Create a trace ID
    const traceId = `direct-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Process images if provided
    const processedImages: ImageAttachment[] = [];
    if (images && images.length > 0) {
      images.forEach((imageData, index) => {
        if (imageData) {
          const contentType = imageData.startsWith('data:') 
            ? imageData.split(';')[0].split(':')[1] 
            : 'image/jpeg';
            
          const base64Data = imageData.includes(',') 
            ? imageData.split(',')[1] 
            : imageData;
          
          processedImages.push({
            id: `img-${index}-${Date.now()}`,
            base64Data: base64Data,
            contentType: contentType,
            name: `image-${index}.jpg`,
            url: imageData
          });
        }
      });
    }
    
    // Create system prompt for ITSM agent behavior
    const systemPrompt = `You are an AI-powered IT Service Management (ITSM) Triage assistant. 
Your task is to analyze IT issues, reason through possible solutions, and provide helpful responses.

Follow this process:
1. Analyze the user's issue and classify it into appropriate categories
2. Search for relevant solutions based on the issue type
3. Provide a clear, helpful response with step-by-step instructions

Structure your thinking as follows:
- First, classify the issue (e.g., "This is a printer issue with high confidence")
- Then, consider what solutions would be appropriate
- Finally, provide a comprehensive response to the user

Use a professional but friendly tone and focus on practical solutions.

IMPORTANT: You MUST respond with valid JSON only, and NOTHING else. 
Do not include any text before or after the JSON. 
Do not include markdown formatting like \`\`\`json at the beginning or end.
Your response must be parsed directly as JSON by a computer program.

The JSON response MUST follow this exact structure:
{
  "thinking": [
    {
      "step": 1,
      "thought": "string - your analysis of the issue",
      "tool": "classify_issue", 
      "tool_input": "string - the query to classify",
      "tool_output": {
        "issue_category1": 0.95,
        "issue_category2": 0.3
      }
    },
    {
      "step": 2,
      "thought": "string - your reasoning for solution lookup",
      "tool": "fetch_kb_solution",
      "tool_input": {
        "issue_type": "string - the primary category",
        "description": "string - brief description"
      },
      "tool_output": [
        {
          "id": "string - article ID",
          "title": "string - article title",
          "content": "string - solution steps",
          "relevance": 0.95
        }
      ]
    }
  ],
  "classification": {
    "results": {
      "category1": 0.95,
      "category2": 0.3
    },
    "top_categories": [
      {
        "category": "string - top category name",
        "confidence": 0.95
      }
    ]
  },
  "response": "string - your complete response to the user"
}`;

    // Create the request object
    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: systemPrompt }],
          role: "model"
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    };

    // Add the user message
    const userMessage: GeminiContent = {
      parts: [{ text: message }],
      role: "user"
    };

    // Add images if provided
    if (processedImages.length > 0) {
      processedImages.forEach(image => {
        userMessage.parts.push({
          inlineData: {
            mimeType: image.contentType,
            data: image.base64Data
          }
        });
      });
    }

    // Add user message to request
    request.contents.push(userMessage);

    // Call Gemini API - try with 2.5 Pro first
    const modelName = 'gemini-2.5-pro-preview-05-06';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response received from Gemini API');
    }

    // Get the text from the response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Parse the response as JSON, attempting to strip markdown if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
    } else if (cleanedText.startsWith("```")) { // Handle cases where ``` is used without json specifier
      cleanedText = cleanedText.substring(3);
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
    }

    // Log a larger portion of the string for debugging, but be mindful of console limits for very large strings.
    const textToLog = cleanedText.trim();
    console.log("Attempting to parse cleaned text (approx position " + textToLog.length + "):", textToLog.substring(0, 6000) + (textToLog.length > 6000 ? "... (truncated in log)" : ""));

    const parsedResponse = JSON.parse(textToLog);
    
    // Extract the reasoning steps, classification, and response
    const reasoning = parsedResponse.thinking || [];
    const classification = parsedResponse.classification || {
      results: {},
      top_categories: []
    };
    const finalResponse = parsedResponse.response;

    // Create the trace data
    const traceData = {
      id: traceId,
      timestamp: new Date().toISOString(),
      input: message,
      final_output: finalResponse,
      completed: true,
      steps: reasoning,
      classification,
      has_images: processedImages.length > 0,
      images: processedImages
    };
    
    // Store trace in memory
    SIMPLIFIED_TRACES.set(traceId, traceData);
    
    // Return properly formatted response
    return {
      response: finalResponse,
      reasoning,
      classification,
      completed: true,
      trace_id: traceId
    };
  } catch (error) {
    console.error('Direct API error:', error);
    
    // Return a friendly error response
    return {
      response: "I apologize, but I'm currently having trouble processing your request. Please try again in a moment.",
      reasoning: [],
      completed: false,
      trace_id: `error-${Date.now()}`
    };
  }
}

/**
 * Get a trace by ID
 */
export function getTrace(traceId: string) {
  return SIMPLIFIED_TRACES.get(traceId) || null;
}