/**
 * Gemini 2.5 Pro API integration
 * This module provides direct access to Gemini 2.5 Pro for generating responses
 */

import { TraceStep, TraceClassification, ImageAttachment } from '../../lib/types';

// Define Gemini API types
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

// Define response types
export interface GeminiLLMResponse {
  response: string;
  reasoning: TraceStep[];
  classification: TraceClassification;
}

/**
 * Creates a Gemini API request with system instructions and user query
 */
function createGeminiRequest(message: string, images?: ImageAttachment[]): GeminiRequest {
  // Create the system prompt for ITSM agent behavior
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
      maxOutputTokens: 2048
    }
  };

  // Add the user message
  const userMessage: GeminiContent = {
    parts: [{ text: message }],
    role: "user"
  };

  // Add images if provided
  if (images && images.length > 0) {
    images.forEach(image => {
      if (image.base64Data) {
        // Strip prefix if present (data:image/jpeg;base64,)
        const base64Data = image.base64Data.includes(',') 
          ? image.base64Data.split(',')[1] 
          : image.base64Data;
          
        userMessage.parts.push({
          inlineData: {
            mimeType: image.contentType || 'image/jpeg',
            data: base64Data
          }
        });
      }
    });
  }

  // Add the user message to the request
  request.contents.push(userMessage);

  return request;
}

/**
 * Calls the Gemini 2.5 Pro Preview API with fallback to Gemini 1.5 Pro
 */
export async function callGeminiAPI(
  message: string, 
  images?: ImageAttachment[]
): Promise<GeminiLLMResponse> {
  // Get API key from environment - prioritize frontend env, but fall back to root env
  // The root env file is accessible because Next.js automatically loads .env files from the project root
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured. Make sure it is set in the root .env file.');
    throw new Error('GEMINI_API_KEY is not configured. Make sure it is set in the root .env file.');
  }
  
  // Log API key existence (never log the actual key)
  console.log('Gemini API key status:', apiKey ? 'Found (not showing actual key)' : 'Missing')

  try {
    // Create the request object
    const requestBody = createGeminiRequest(message, images);
    
    // Log request details for debugging (without the API key)
    console.log('Gemini API request details:', {
      model: 'gemini-2.5-pro-preview-05-06',
      contentCount: requestBody.contents.length,
      hasImages: images && images.length > 0,
      imageCount: images?.length || 0,
      messageLength: message.length,
      temperature: requestBody.generationConfig?.temperature,
      // Sanitize the log to avoid showing full images
      contents: requestBody.contents.map(c => ({
        role: c.role,
        partCount: c.parts.length,
        partTypes: c.parts.map(p => p.text ? 'text' : 'image')
      }))
    });
    
    // Try Gemini 2.5 Pro first, fallback to 1.5 Pro if needed
    let modelName = 'gemini-2.5-pro-preview-05-06';
    let response;
    
    try {
      console.log(`Attempting to use ${modelName} model...`);
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      // If we get a 404, the model might not be available
      if (response.status === 404) {
        console.warn('Gemini 2.5 Pro Preview model not found (404), falling back to Gemini 1.5 Pro');
        modelName = 'gemini-1.5-pro';
        
        // Try with Gemini 1.5 Pro
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }
        );
      }
    } catch (fetchError) {
      console.error('Fetch error during Gemini API call:', fetchError);
      console.error('Fetch error details:', {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack
      });
      throw new Error(`Failed to connect to Gemini API: ${fetchError.message}`);
    }
    
    console.log(`Used model: ${modelName}, Status: ${response.status}`);
    
    // Log request URL for debugging (without API key)
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    console.log(`Request URL: ${requestUrl} (API key omitted)`);
    
    // Log request headers
    console.log('Request headers:', {
      'Content-Type': 'application/json'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      console.error('Gemini API status:', response.status, response.statusText);
      
      try {
        // Try to parse the error response as JSON for better debugging
        const errorJson = JSON.parse(errorText);
        console.error('Gemini API error details:', JSON.stringify(errorJson, null, 2));
        
        // Check for specific error types
        if (errorJson.error) {
          if (errorJson.error.status === 'INVALID_ARGUMENT') {
            console.error('Invalid argument error:', errorJson.error.message);
          } else if (errorJson.error.status === 'PERMISSION_DENIED') {
            console.error('Permission denied error - API key may be invalid or restricted');
          } else if (errorJson.error.status === 'RESOURCE_EXHAUSTED') {
            console.error('Resource exhausted - quota may be exceeded');
          }
        }
      } catch (e) {
        // If not JSON, just log the raw text
        console.error('Non-JSON error response:', errorText);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json() as GeminiResponse;
    
    // If no candidates were returned, throw an error
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response received from Gemini API');
    }

    // Get the text from the response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Parse the response as JSON
    let parsedResponse;
    try {
      // The response should be JSON format
      parsedResponse = JSON.parse(responseText);
      
      // Log successful parsing
      console.log('Successfully parsed Gemini response as JSON');
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      
      // Create a fallback response
      return createFallbackResponse(message, 
        "I'm sorry, but I'm having trouble processing your request properly. " +
        "Please try again or contact support if the issue persists.");
    }

    // Check if the response is properly formatted
    if (!parsedResponse.response || typeof parsedResponse.response !== 'string') {
      console.error('Invalid Gemini response format - missing response field:', parsedResponse);
      
      // If the entire response is just the raw JSON, return a proper response
      if (responseText && typeof responseText === 'string' && responseText.includes('"thinking"') && responseText.includes('"classification"')) {
        return createFallbackResponse(message, 
          "I'm sorry, but I received an improperly formatted response. " +
          "Please try again or contact support if the issue persists.");
      }
      
      // Use the raw text as the response if no valid response field
      parsedResponse.response = "I apologize, but I'm experiencing an issue with my response formatting. Please try again.";
    }

    // Extract the reasoning steps, classification, and response
    const reasoning = parsedResponse.thinking || [];
    const classification = parsedResponse.classification || {
      results: {},
      top_categories: []
    };
    const finalResponse = parsedResponse.response;

    return {
      reasoning,
      classification,
      response: finalResponse
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return a simple fallback response
    return createFallbackResponse(message, 'I apologize, but I encountered an error while processing your request. Please try again later.');
  }
}

/**
 * Creates a fallback response when the API call fails or returns malformed data
 */
function createFallbackResponse(message: string, responseText: string): GeminiLLMResponse {
  console.log('Creating fallback response for:', message);
  
  // Create a basic classification based on keywords
  const classification = generateBasicClassification(message);
  
  // Create basic reasoning steps
  const reasoning: TraceStep[] = [
    {
      step: 1,
      thought: "Analyzing the user's issue to determine the appropriate category",
      tool: "classify_issue",
      tool_input: message,
      tool_output: classification.results
    }
  ];
  
  // If the classification has top categories, add a second reasoning step
  if (classification.top_categories.length > 0) {
    const topCategory = classification.top_categories[0].category;
    
    reasoning.push({
      step: 2,
      thought: `Looking for solutions related to ${topCategory}`,
      tool: "fetch_kb_solution",
      tool_input: {
        issue_type: topCategory,
        description: message
      },
      tool_output: [
        {
          id: "KB-FALLBACK-001",
          title: "General IT Help",
          content: "This is a fallback solution provided when the system is unable to process your request normally. Our team is working to ensure all queries are handled properly.",
          relevance: 0.7
        }
      ]
    });
  }

  // If responseText looks like JSON, try to extract useful content
  let finalResponse = responseText;
  if (typeof responseText === 'string' && 
      (responseText.trim().startsWith('{') || responseText.includes('"response":'))) {
    try {
      // Try to parse it as JSON and extract just the response field
      const jsonMatch = responseText.match(/"response"\s*:\s*"([^"]+)"/);
      if (jsonMatch && jsonMatch[1]) {
        finalResponse = jsonMatch[1];
      } else {
        finalResponse = "I apologize, but I'm experiencing technical difficulties processing your request. Please try again in a moment.";
      }
    } catch (e) {
      finalResponse = "I apologize, but I'm experiencing technical difficulties. Our team has been notified of this issue.";
    }
  }

  return {
    response: finalResponse,
    reasoning,
    classification
  };
}

/**
 * Generates a basic classification based on keywords in the message
 */
function generateBasicClassification(message: string): TraceClassification {
  const lowerMessage = message.toLowerCase();
  const categories: Record<string, number> = {
    "password_reset": 0.1,
    "software_installation": 0.1,
    "hardware_failure": 0.1,
    "network_connectivity": 0.1,
    "access_permission": 0.1,
    "email_issues": 0.1,
    "printer_issues": 0.1,
    "security_incident": 0.1,
    "application_login_issues": 0.1,
    "data_loss": 0.1
  };

  // Simple keyword matching
  if (lowerMessage.includes('password')) categories["password_reset"] = 0.8;
  if (lowerMessage.includes('install') || lowerMessage.includes('software')) categories["software_installation"] = 0.8;
  if (lowerMessage.includes('hardware') || lowerMessage.includes('computer') || lowerMessage.includes('broken')) categories["hardware_failure"] = 0.8;
  if (lowerMessage.includes('network') || lowerMessage.includes('internet') || lowerMessage.includes('wifi')) categories["network_connectivity"] = 0.8;
  if (lowerMessage.includes('access') || lowerMessage.includes('permission')) categories["access_permission"] = 0.8;
  if (lowerMessage.includes('email') || lowerMessage.includes('outlook')) categories["email_issues"] = 0.8;
  if (lowerMessage.includes('print') || lowerMessage.includes('printer')) categories["printer_issues"] = 0.8;
  if (lowerMessage.includes('security') || lowerMessage.includes('virus')) categories["security_incident"] = 0.8;
  if (lowerMessage.includes('login') || lowerMessage.includes('teams') || lowerMessage.includes('microsoft')) categories["application_login_issues"] = 0.8;
  if (lowerMessage.includes('lost') || lowerMessage.includes('delete')) categories["data_loss"] = 0.8;

  // Create top categories
  const topCategories = Object.entries(categories)
    .filter(([_, score]) => score > 0.3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, confidence]) => ({ category, confidence }));

  return {
    results: categories,
    top_categories: topCategories
  };
}