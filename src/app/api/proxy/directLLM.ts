/**
 * Direct LLM integration for IT issues when the backend is unavailable
 * This module handles direct LLM API calls using Gemini 2.5 Pro Preview
 */

import { ImageAttachment } from '../../lib/types';
import { callGeminiAPI, GeminiLLMResponse } from './geminiAPI';

// Interface for direct LLM responses
export interface DirectLLMResponse {
  response: string;
  reasoning?: any[];
  classification?: {
    results: Record<string, number>;
    top_categories: Array<{category: string; confidence: number}>;
  };
}

/**
 * Generates a direct response using the Gemini 2.5 Pro Preview API
 * Falls back to intelligent mock responses if API access fails
 * 
 * @param message User's message
 * @param images Array of image attachments for multimodal queries
 * @returns A structured response with reasoning and classification
 */
export async function generateDirectLLMResponse(
  message: string,
  hasImages: boolean = false,
  images?: ImageAttachment[]
): Promise<DirectLLMResponse> {
  try {
    // Attempt to call the Gemini 2.5 Pro Preview API
    console.log('Calling Gemini 2.5 Pro Preview API for direct LLM response');
    
    // Make API call and parse the response
    const geminiResponse = await callGeminiAPI(message, images);
    
    // Return the structured response
    return {
      response: geminiResponse.response,
      reasoning: geminiResponse.reasoning,
      classification: geminiResponse.classification
    };
  } catch (error) {
    console.error('Error using Gemini API:', error);
    console.log('Falling back to mocked intelligent response');
    
    // Fall back to the mocked intelligent response
    return generateIntelligentFallbackResponse(message, hasImages);
  }
}

/**
 * Generates an intelligent fallback response based on the user's query
 * This is used when the Gemini API is unavailable or returns an error
 * 
 * @param message User's message
 * @param hasImages Whether the message included images
 */
function generateIntelligentFallbackResponse(message: string, hasImages: boolean): DirectLLMResponse {
  const lowerMessage = message.toLowerCase();
  let response = "";
  let reasoning: any[] = [];
  
  // Simple classification results based on common IT categories
  const defaultCategories = {
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
  
  // Analyze the message to extract key topics
  const containsPassword = lowerMessage.includes('password');
  const containsMicrosoft = lowerMessage.includes('microsoft') || lowerMessage.includes('teams') || 
                           lowerMessage.includes('outlook') || lowerMessage.includes('office');
  const containsPrinter = lowerMessage.includes('print') || lowerMessage.includes('scanner') || 
                         lowerMessage.includes('toner') || lowerMessage.includes('ink');
  const containsNetwork = lowerMessage.includes('wifi') || lowerMessage.includes('internet') || 
                         lowerMessage.includes('connection') || lowerMessage.includes('network');
  const containsHardware = lowerMessage.includes('computer') || lowerMessage.includes('laptop') || 
                          lowerMessage.includes('monitor') || lowerMessage.includes('keyboard');
  
  // Generate classification based on message content
  const categories: Record<string, number> = { ...defaultCategories };
  
  if (containsPassword) categories["password_reset"] = 0.8;
  if (containsMicrosoft) categories["application_login_issues"] = 0.75;
  if (containsPrinter) categories["printer_issues"] = 0.85;
  if (containsNetwork) categories["network_connectivity"] = 0.8;
  if (containsHardware) categories["hardware_failure"] = 0.75;
  
  // Create top categories
  const topCategories = Object.entries(categories)
    .filter(([_, score]) => score > 0.3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category, confidence]) => ({ category, confidence }));
  
  // Update classification
  const classification = {
    results: categories,
    top_categories: topCategories
  };
  
  // Generate reasoning steps
  reasoning = [
    {
      step: 1,
      thought: `Analyzing user query: "${message}"`,
      tool: "classify_issue",
      tool_input: message,
      tool_output: categories
    }
  ];
  
  // If there are top categories, generate a solution for the highest one
  if (topCategories.length > 0) {
    const topCategory = topCategories[0].category;
    
    reasoning.push({
      step: 2,
      thought: `Fetching solution for ${topCategory}`,
      tool: "fetch_kb_solution",
      tool_input: {
        issue_type: topCategory,
        description: message
      },
      tool_output: getSolutionForCategory(topCategory, message)
    });
    
    // Generate a response based on classification
    response = generateResponseForCategory(topCategory, message, hasImages);
  } else {
    // Generic response if no clear category
    response = "I understand you're experiencing an IT issue. To help you effectively, could you provide more specific details about the problem? Information like error messages, what you were trying to do, and which systems are involved would help me diagnose the issue more accurately.";
  }
  
  return {
    response,
    reasoning,
    classification
  };
}

/**
 * Get KB solution based on category
 */
function getSolutionForCategory(category: string, message: string): any[] {
  // In a real implementation, this would search a knowledge base
  // For now, we return some reasonable solutions for common categories
  
  switch (category) {
    case "password_reset":
      return [
        {
          id: "KB-PW-001",
          title: "Password Reset Instructions",
          content: "To reset your password, please follow these steps:\n1. Navigate to the company password portal at https://reset.company.com\n2. Enter your username\n3. Follow the verification steps\n4. Create a new password following the security guidelines",
          relevance: 0.95
        },
        {
          id: "KB-PW-002",
          title: "Account Lockout Resolution",
          content: "If your account is locked due to multiple failed login attempts:\n1. Wait 15 minutes for automatic lockout to expire\n2. Contact the IT Help Desk for immediate assistance\n3. Ensure you're using the correct username",
          relevance: 0.85
        }
      ];
      
    case "application_login_issues":
      return [
        {
          id: "KB-APP-001",
          title: "Microsoft Application Login Issues",
          content: "For Microsoft application login issues:\n1. Clear browser cache and cookies\n2. Restart the application\n3. Check if you need to re-authenticate with your Microsoft account\n4. Verify your internet connection is stable",
          relevance: 0.92
        }
      ];
      
    case "printer_issues":
      return [
        {
          id: "KB-PR-001",
          title: "Printer Troubleshooting",
          content: "To resolve common printer issues:\n1. Check if the printer has paper and toner/ink\n2. Ensure the printer is online and connected to the network\n3. Restart the printer\n4. Check for paper jams\n5. Reinstall printer drivers if necessary",
          relevance: 0.93
        }
      ];
      
    case "network_connectivity":
      return [
        {
          id: "KB-NET-001",
          title: "Network Connectivity Issues",
          content: "If you're experiencing network connectivity problems:\n1. Check if other devices can connect to the network\n2. Restart your device and router/modem\n3. Check network cables if applicable\n4. Reset network settings\n5. Contact IT support if issues persist",
          relevance: 0.91
        }
      ];
      
    default:
      return [
        {
          id: "KB-GEN-001",
          title: "General IT Support",
          content: "For general IT issues:\n1. Restart the affected device or application\n2. Check for recent updates or changes\n3. Document any error messages\n4. Contact the IT Help Desk with detailed information",
          relevance: 0.80
        }
      ];
  }
}

/**
 * Generate a response based on the identified category
 */
function generateResponseForCategory(category: string, message: string, hasImages: boolean): string {
  const lowerMessage = message.toLowerCase();
  
  switch (category) {
    case "password_reset":
      return "Based on your message, it sounds like you're having trouble with your password. To reset your password, please follow these steps:\n\n1. Go to the company password reset portal at https://reset.company.com\n2. Enter your username (typically your email address)\n3. You'll receive an email with a verification link\n4. Click the link and follow the instructions to create a new password\n\nIf you're still experiencing issues after resetting your password, or if your account is locked, please contact our IT Help Desk for further assistance.";
      
    case "application_login_issues":
      if (lowerMessage.includes('teams') || lowerMessage.includes('microsoft teams')) {
        return "I see you're having issues with Microsoft Teams login. This is often caused by session management problems. Here's how to fix it:\n\n1. Completely sign out of Teams\n2. Clear your browser cache and cookies if you're using the web version\n3. For the desktop app, check for any pending updates\n4. Restart your computer\n5. Sign back in with your credentials\n\nIf you're still experiencing issues, it might be related to your organization's session timeout policies or authentication settings. Please contact your IT support team for assistance.";
      } else {
        return "I understand you're having login issues with a Microsoft application. To resolve this:\n\n1. Clear your browser cache and cookies\n2. Ensure you're using the correct credentials\n3. Check if your account requires multi-factor authentication\n4. Try accessing the application from a different browser or device\n\nIf these steps don't resolve the issue, please contact the IT Help Desk for further assistance.";
      }
      
    case "printer_issues":
      return "I see you're experiencing printer-related issues. Here are some troubleshooting steps:\n\n1. Check if the printer is powered on and connected to the network\n2. Verify that there's paper in the tray and sufficient ink/toner\n3. Look for any paper jams or hardware errors on the printer display\n4. Restart both your computer and the printer\n5. Try removing and reinstalling the printer drivers\n\nIf you're still having trouble after these steps, please provide the specific error message or printer model for more targeted assistance.";
      
    case "network_connectivity":
      return "Based on your message, you seem to be experiencing network connectivity issues. Here's how to troubleshoot:\n\n1. Check if other devices can connect to the same network\n2. Restart your device and router/modem\n3. Try connecting to a different network if available\n4. Reset your network settings\n5. Check if your network adapter drivers need updating\n\nIf you're in the office, this might be a wider network issue. Please contact the IT department if the problem persists after trying these steps.";
      
    case "hardware_failure":
      return "I understand you're experiencing a hardware issue. Here are some troubleshooting steps:\n\n1. Check all cable connections to ensure they're secure\n2. Restart your device completely (power off, wait 30 seconds, power on)\n3. Listen for unusual sounds like clicking or beeping\n4. Check if the device is overheating\n5. Try connecting external components to another device if possible\n\nHardware issues often require physical inspection. If these steps don't resolve your issue, please contact IT support for further assistance.";
      
    default:
      if (hasImages) {
        return "Thank you for providing details and images about your IT issue. I've reviewed the information you've shared, but I need to analyze this further to provide an accurate solution. In a fully implemented system, I would be able to analyze your screenshots in detail.\n\nIn the meantime, could you provide any error messages you're seeing or specific symptoms of the problem? This would help me give you more targeted assistance.";
      } else {
        return "I understand you're experiencing an IT issue. To help you effectively, could you provide more specific details about the problem? Information like error messages, what you were trying to do, and which systems are involved would help me diagnose the issue more accurately.";
      }
  }
}