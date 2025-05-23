import { NextRequest, NextResponse } from 'next/server';
import { generateDirectLLMResponse } from './directLLM';
// import traceStorage from '../traceStorage'; // Removed as localStorage is not available server-side

// Generate a random UUID for mock trace IDs
function generateMockTraceId() {
  return 'mock-' + Math.random().toString(36).substring(2, 15);
}

// Generate a mock tool response for a given issue type
function generateMockToolResponse(issueType: string) {
  const responses = {
    printer_issue: {
      thought: "This appears to be a printer issue",
      steps: [
        {
          step: 1,
          thought: "This seems like a printer issue. Let me classify it to confirm.",
          tool: "classify_issue",
          tool_input: "I see a PC load letter error on my printer",
          tool_output: {
            "printer_issues": 0.88,
            "hardware_failure": 0.15,
            "software_installation": 0.10,
            "network_connectivity": 0.05,
            "password_reset": 0.05,
            "access_permission": 0.05,
            "email_issues": 0.05,
            "security_incident": 0.05
          }
        },
        {
          step: 2,
          thought: "The classification confirms this is a printer issue with high confidence. Let me fetch the appropriate solutions from the knowledge base.",
          tool: "fetch_kb_solution",
          tool_input: {
            "issue_type": "printer_issues",
            "description": "PC load letter error on printer"
          },
          tool_output: [
            {
              "id": "KB-PR-001",
              "title": "Common printer error messages",
              "content": "PC Load Letter error on most printers means the paper tray is empty or not detected correctly. To resolve:\n1. Check that the paper tray has paper loaded\n2. Ensure the paper is Letter size (or the correct size for your region)\n3. Remove and reinsert the paper tray to ensure it's properly seated\n4. Check for paper jams in the feed mechanism",
              "relevance": 1.9
            },
            {
              "id": "KB-PR-003",
              "title": "General printer troubleshooting",
              "content": "For general printer issues:\n1. Restart the printer (power off, wait 30 seconds, power on)\n2. Check printer connection (USB or network)\n3. Reinstall or update printer drivers\n4. Run the printer's self-test or maintenance routine\n5. Check for firmware updates for your printer model",
              "relevance": 1.2
            }
          ]
        }
      ],
      response: "I understand you're seeing a 'PC Load Letter' error on your Epson printer and getting blank pages when you print. This is a common printer issue that typically means the printer can't detect paper correctly or there's an issue with the paper tray. Here's how to fix it:\n\n1. First, check that the paper tray has paper loaded - this is the most common cause\n2. Make sure you're using the correct paper size (Letter size in the US, A4 in many other countries)\n3. Remove and reinsert the paper tray to ensure it's properly seated\n4. Look for any paper jams in the feed mechanism\n5. Try restarting the printer completely (power off, wait 30 seconds, power on)\n\nIf you're getting blank pages when printing, also check:\n- Ink or toner levels in your printer\n- Print head nozzles may be clogged (run the printer's cleaning utility)\n- Try printing a test page from the printer's control panel\n\nIf these steps don't resolve the issue, please let me know and I can help escalate this to our printer support specialists."
    },
    password_reset: {
      thought: "This appears to be a password reset issue",
      steps: [
        {
          step: 1,
          thought: "This seems like a password reset issue. Let me classify it first to confirm.",
          tool: "classify_issue",
          tool_input: "I forgot my password and can't log in to my account",
          tool_output: {
            "password_reset": 0.92,
            "software_installation": 0.10,
            "hardware_failure": 0.05,
            "network_connectivity": 0.05,
            "access_permission": 0.20,
            "email_issues": 0.05,
            "printer_issues": 0.05,
            "security_incident": 0.05
          }
        },
        {
          step: 2,
          thought: "The classification confirms this is a password reset issue with high confidence. Let me fetch the appropriate solution from the knowledge base.",
          tool: "fetch_kb_solution",
          tool_input: {
            "issue_type": "password_reset",
            "description": "I forgot my password and can't log in to my account"
          },
          tool_output: [
            {
              "id": "KB-PR-001",
              "title": "How to reset your password",
              "content": "1. Go to the password reset portal at https://reset.company.com\n2. Enter your username\n3. Follow the email instructions sent to your registered email\n4. Create a new password following the security guidelines",
              "relevance": 1.8
            },
            {
              "id": "KB-PR-003",
              "title": "Account lockout resolution",
              "content": "If your account is locked due to too many failed login attempts:\n1. Wait 15 minutes for the automatic lockout to expire\n2. Use the 'Forgot Password' option if you need to reset immediately\n3. Contact the Service Desk at x1234 if you continue to experience issues",
              "relevance": 1.2
            }
          ]
        }
      ],
      response: "I understand you're having trouble logging in because you forgot your password. Here's how you can reset it:\n\n1. Go to the password reset portal at https://reset.company.com\n2. Enter your username\n3. Follow the email instructions sent to your registered email\n4. Create a new password following the security guidelines\n\nIf your account is locked due to too many failed login attempts, you may need to wait 15 minutes for the automatic lockout to expire before trying the reset process.\n\nIs there anything else you need help with regarding your password reset?"
    },
    hardware_issue: {
      thought: "This appears to be a hardware failure issue",
      steps: [
        {
          step: 1,
          thought: "This seems like a hardware issue. Let me classify it to confirm.",
          tool: "classify_issue",
          tool_input: "My computer screen is black and won't turn on",
          tool_output: {
            "hardware_failure": 0.85,
            "software_installation": 0.10,
            "network_connectivity": 0.05,
            "password_reset": 0.05,
            "access_permission": 0.05,
            "email_issues": 0.05,
            "printer_issues": 0.05,
            "security_incident": 0.05
          }
        },
        {
          step: 2,
          thought: "The classification confirms this is a hardware failure issue with high confidence. Let me fetch relevant solutions from the knowledge base.",
          tool: "fetch_kb_solution",
          tool_input: {
            "issue_type": "hardware_failure",
            "description": "My computer screen is black and won't turn on"
          },
          tool_output: [
            {
              "id": "KB-HW-001",
              "title": "Hardware troubleshooting steps",
              "content": "1. Check all connections and cables\n2. Restart the device\n3. Verify power supply is functioning\n4. Run diagnostic tools if available\n5. If problem persists, contact IT support",
              "relevance": 1.5
            },
            {
              "id": "KB-HW-003",
              "title": "Monitor display issues",
              "content": "For monitor display problems:\n1. Check cable connections (power and video)\n2. Try a different cable if available\n3. Test with a different monitor or connect your monitor to a different computer\n4. Adjust resolution settings in Control Panel > Display\n5. Update graphics drivers",
              "relevance": 1.9
            }
          ]
        }
      ],
      response: "I understand you're having an issue with your computer screen being black and not turning on. This appears to be a hardware issue. Here are some troubleshooting steps you can try:\n\n1. Check all cable connections to your monitor (both power and video cables)\n2. Try a different video cable if you have one available\n3. If possible, test with a different monitor or connect your monitor to a different computer to determine if the issue is with the monitor or the computer\n4. Make sure the power supply is functioning correctly\n5. If you can access the computer despite the monitor issue, try updating your graphics drivers\n\nIf none of these steps resolve the issue, it may require direct support from our IT team. Would you like me to escalate this to our hardware support specialists?"
    },
    network_issue: {
      thought: "This appears to be a network connectivity issue",
      steps: [
        {
          step: 1,
          thought: "This sounds like a network connectivity issue. Let me classify it to confirm.",
          tool: "classify_issue",
          tool_input: "I can't connect to the internet and the wifi isn't working",
          tool_output: {
            "network_connectivity": 0.90,
            "hardware_failure": 0.15,
            "software_installation": 0.05,
            "password_reset": 0.05,
            "access_permission": 0.05,
            "email_issues": 0.05,
            "printer_issues": 0.05,
            "security_incident": 0.10
          }
        },
        {
          step: 2,
          thought: "The classification confirms this is a network connectivity issue with high confidence. Let me fetch the appropriate solutions from the knowledge base.",
          tool: "fetch_kb_solution",
          tool_input: {
            "issue_type": "network_connectivity",
            "description": "I can't connect to the internet and the wifi isn't working"
          },
          tool_output: [
            {
              "id": "KB-NET-001",
              "title": "Network troubleshooting guide",
              "content": "1. Check if other applications can connect to the internet\n2. Restart your device\n3. Reset your network adapter (see detailed instructions)\n4. Check if others in your area are experiencing issues\n5. Contact IT if problems persist",
              "relevance": 1.8
            },
            {
              "id": "KB-NET-003",
              "title": "Wi-Fi connectivity problems",
              "content": "To resolve Wi-Fi connectivity issues:\n1. Check if Wi-Fi is enabled on your device\n2. Forget the network and reconnect\n3. Move closer to the access point\n4. Restart your device and Wi-Fi router\n5. Try connecting to a different Wi-Fi network if available",
              "relevance": 1.9
            }
          ]
        }
      ],
      response: "I understand you're having trouble connecting to the internet and your WiFi isn't working. Let me help you troubleshoot this network issue:\n\n1. First, check if WiFi is enabled on your device (look for a physical switch or function key)\n2. Try forgetting the network and reconnecting:\n   - Go to WiFi settings\n   - Find your network name\n   - Select 'Forget' or 'Remove'\n   - Then reconnect with the correct password\n3. Move closer to the WiFi router or access point to improve signal strength\n4. Restart both your device and the WiFi router (unplug the router, wait 30 seconds, then plug it back in)\n5. If possible, try connecting to a different WiFi network to determine if the issue is with your device or the network\n\nIf you've tried these steps and are still having problems, please let me know, and I can help escalate this to our network support team."
    },
    default: {
      thought: "Let me analyze this issue",
      steps: [
        {
          step: 1,
          thought: "I need to determine what type of issue this is. Let me classify it first.",
          tool: "classify_issue",
          tool_input: "I'm having an IT problem",
          tool_output: {
            "hardware_failure": 0.20,
            "software_installation": 0.20,
            "network_connectivity": 0.20,
            "password_reset": 0.20,
            "access_permission": 0.20,
            "email_issues": 0.20,
            "printer_issues": 0.20,
            "security_incident": 0.10
          }
        },
        {
          step: 2,
          thought: "The classification doesn't provide a clear category. I need more specific information to help effectively.",
          tool: "fetch_kb_solution",
          tool_input: {
            "issue_type": "other",
            "description": "general IT problem"
          },
          tool_output: [
            {
              "id": "KB-GEN-001",
              "title": "General IT support",
              "content": "For issues not covered by our knowledge base, please provide more specific details about your problem such as error messages, what you were trying to do, and which systems or applications are involved.",
              "relevance": 1.3
            }
          ]
        }
      ],
      response: "I'd be happy to help with your IT problem. To provide the most effective assistance, I'll need some more specific details about the issue you're experiencing. Could you please share:\n\n1. A more detailed description of the problem\n2. Any error messages you're seeing\n3. Which system, application, or device you're having trouble with\n4. What you were trying to do when the problem occurred\n\nWith this additional information, I'll be able to diagnose your issue more accurately and provide appropriate solutions."
    }
  };

  // Determine which mock response to use based on keywords
  const lowerIssue = issueType.toLowerCase();
  
  // Printer related keywords
  if (lowerIssue.includes('printer') || lowerIssue.includes('print') || lowerIssue.includes('paper') || 
      lowerIssue.includes('toner') || lowerIssue.includes('ink') || lowerIssue.includes('cartridge') ||
      lowerIssue.includes('pc load letter') || lowerIssue.includes('epson')) {
    return responses.printer_issue;
  } 
  // Password related keywords
  else if (lowerIssue.includes('microsoft teams') || lowerIssue.includes('teams') || 
           (lowerIssue.includes('login') && lowerIssue.includes('sent back'))) {
    // Microsoft Teams login issue response
    return {
      thought: "This appears to be a Microsoft Teams login session issue",
      steps: [
        {
          step: 1,
          thought: "This sounds like a Microsoft Teams login issue. Let me classify it correctly.",
          tool: "classify_issue",
          tool_input: "When I login to Microsoft Teams and try to send a message i get sent back to a login screen",
          tool_output: {
            "application_login_issues": 0.85,
            "password_reset": 0.25,
            "software_installation": 0.10,
            "network_connectivity": 0.20,
            "access_permission": 0.15,
            "email_issues": 0.05,
            "printer_issues": 0.05,
            "security_incident": 0.05
          }
        },
        {
          step: 2,
          thought: "This is definitely a Microsoft Teams authentication session issue. Let me fetch the appropriate solution.",
          tool: "fetch_kb_solution",
          tool_input: {
            "issue_type": "application_login_issues",
            "description": "Microsoft Teams keeps logging me out and sending me back to login screen"
          },
          tool_output: [
            {
              "id": "KB-MS-001",
              "title": "Microsoft Teams Session Issues",
              "content": "If Microsoft Teams keeps logging you out or returning to the login screen:\n\n1. Clear browser cache and cookies if using the web version\n2. For the desktop app, sign out completely, then sign back in\n3. Check for pending Microsoft Teams updates\n4. Verify your organization's session timeout policies\n5. If issue persists, reset your Microsoft credentials",
              "relevance": 1.9
            },
            {
              "id": "KB-MS-002",
              "title": "Microsoft 365 Authentication Troubleshooting",
              "content": "For persistent Microsoft 365 authentication issues:\n\n1. Sign out of all Microsoft services\n2. Clear browser cache and cookies\n3. Try using a private/incognito browser window\n4. Update your Microsoft authenticator app if you use MFA\n5. Contact IT support if these steps don't resolve the issue",
              "relevance": 1.5
            }
          ]
        }
      ],
      response: "I understand you're experiencing an issue with Microsoft Teams where you're being sent back to the login screen when trying to send a message. This is a common authentication session issue. Here's how to fix it:\n\n1. First, completely sign out of Teams\n2. Clear your browser cache and cookies (if using the web version)\n3. For the desktop app, check for any pending Microsoft Teams updates\n4. Sign back in to Teams with your credentials\n5. If you use multi-factor authentication, ensure your Microsoft Authenticator app is up to date\n\nIf the issue persists, it might be related to your organization's session timeout policies. In that case, please contact your IT support team for assistance with Microsoft 365 authentication settings."
    };
  }
  // Password reset related keywords
  else if (lowerIssue.includes('password') || lowerIssue.includes('forgot') || 
           (lowerIssue.includes('account') && lowerIssue.includes('locked'))) {
    return responses.password_reset;
  } 
  // Hardware related keywords
  else if (lowerIssue.includes('screen') || lowerIssue.includes('monitor') || lowerIssue.includes('computer') || 
           lowerIssue.includes('hardware') || lowerIssue.includes('black screen') || lowerIssue.includes('won\'t turn on')) {
    return responses.hardware_issue;
  } 
  // Network related keywords
  else if (lowerIssue.includes('internet') || lowerIssue.includes('wifi') || lowerIssue.includes('network') || 
           lowerIssue.includes('connect') || lowerIssue.includes('offline') || lowerIssue.includes('no connection')) {
    return responses.network_issue;
  } 
  // Default response if no keywords match
  else {
    return responses.default;
  }
}

// Mock data (originally for local development/testing when backend is unavailable)
// We will remove MOCK_TRACES logic from GET as per user request for this route to ONLY hit the backend.
const MOCK_TRACES = new Map(); 

// Import test utility
import { testGeminiAPIConnection } from './testGeminiAPI';

/**
 * This is a proxy API route that forwards requests to the backend.
 * It helps avoid CORS issues when the frontend and backend are on different domains.
 * If the backend is unavailable, it returns mock data for testing.
 */
export async function POST(request: NextRequest) {
  try {
    // Extract the body from the request
    const body = await request.json();
    const userMessage = body.message || "";
    let images = body.images || [];
    const isMultimodal = body.multimodal || false;
    
    // Handle image optimization if there are images (to avoid 500 errors from large images)
    if (images.length > 0) {
      console.log(`Processing ${images.length} images for request`);
      images = images.map((image: any) => {
        // If the image data is very large, truncate to avoid backend issues
        if (image && image.length > 500000) {
          console.log(`Optimizing large image (${image.length} bytes)`);
          return image.substring(0, 500000);
        }
        return image;
      });
    }
    
    // Get the backend URL from environment variables with default fallback
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Additional check for image sizes - ensure we're not sending excessively large payloads
    let optimizedBody = { ...body };
    if (body.images && body.images.length > 0) {
      console.log(`Processing ${body.images.length} images in proxy route`);
      
      // Verify no image exceeds our size limits
      optimizedBody.images = body.images.map((image: string, index: number) => {
        if (image && typeof image === 'string') {
          // Get image size and log
          const sizeInMB = (image.length * 0.75) / (1024 * 1024); // Approximate base64 to binary size
          console.log(`Image ${index}: ${sizeInMB.toFixed(2)}MB`);
          
          // If still too large (shouldn't happen with client-side optimization), truncate as last resort
          const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB of base64 data
          if (image.length > MAX_SIZE_BYTES) {
            console.warn(`Image ${index} still exceeds maximum size, truncating as last resort`);
            return image.substring(0, MAX_SIZE_BYTES);
          }
        }
        return image;
      });
    }
    
    // Try to forward the request to the backend
    let backendResponse = null;
    
    try {
      console.log(`Sending request to backend at ${BACKEND_URL}/api/triage`);
      
      // Record request start time for timing
      const requestStartTime = Date.now();
      
      const response = await fetch(`${BACKEND_URL}/api/triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizedBody),
      });
      
      // Log timing information
      const requestDuration = Date.now() - requestStartTime;
      console.log(`Backend request completed in ${requestDuration}ms with status: ${response.status}`);
      
      
      // Check if the request was successful
      if (response.ok) {
        // Parse and return the response from the backend
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        // If we're here, the response wasn't successful but didn't throw
        console.log(`Backend returned error status: ${response.status}. Will use direct LLM integration instead.`);
        
        // Try to extract more detailed error information if available
        try {
          const errorData = await response.json();
          console.error('Backend error details:', JSON.stringify(errorData, null, 2));
          
          // If there's a structured error message, log it in a more visible format
          if (errorData.detail && typeof errorData.detail === 'object') {
            console.error(`[SERVER ERROR] ${errorData.detail.error_type || 'API Error'}`);
            console.error(`Error message: ${errorData.detail.message}`);
            
            if (errorData.detail.details) {
              console.error('Error details:', errorData.detail.details);
              
              // Special handling for image processing errors
              if (errorData.detail.error_type === 'Image Processing Error') {
                console.error('Image processing failed. Try reducing image size or using a different format.');
              }
            }
          }
        } catch (jsonError) {
          console.error('Could not parse error response as JSON');
        }
        
        // Important: Don't throw or exit here - we'll fall through to the direct LLM integration below
        console.log(`Bypassing failed backend (${response.status} error) and using direct LLM integration`);
      }
    } catch (fetchError) {
      // Only log connection errors (not status errors)
      console.log('Unable to connect to backend. Using direct LLM integration instead.');
      console.error('Fetch error details:', fetchError);
    }
    
    // If we reach here, we need to use the LLM directly for the response
    // This bypasses the backend completely and creates a direct LLM-based response
    
    // Generate a trace ID for tracking
    const traceId = `direct-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Create the response directly using the Gemini API
    console.log('Using direct Gemini 2.5 Pro Preview API for request processing');
    
    // Test Gemini API connectivity (will log detailed diagnostics)
    console.log('Testing Gemini API connectivity before processing request...');
    const apiTest = await testGeminiAPIConnection();
    console.log('Gemini API test result:', apiTest.success ? 'SUCCESS' : 'FAILURE');
    
    try {

      // Process any images for multimodal support
      let processedImages: { id: string; base64Data: string; contentType: string; name: string; url: string; }[] = [];
      if (images && images.length > 0) {
        processedImages = images.map((imageData: string, index: number) => {
          return {
            id: `img-${index}-${Date.now()}`,
            base64Data: imageData,
            contentType: imageData.startsWith('data:') 
              ? imageData.split(';')[0].split(':')[1] 
              : 'image/jpeg',
            name: `image-${index}.jpg`,
            url: `data:${imageData.startsWith('data:') 
              ? imageData.split(';')[0].split(':')[1] 
              : 'image/jpeg'};base64,${imageData}`
          };
        });
        
        console.log(`Processed ${processedImages.length} images for Gemini API`);
      }
      
      // Call the Gemini API directly through our wrapper
      const directResponse = await generateDirectLLMResponse(
        userMessage, 
        processedImages.length > 0,
        processedImages
      );
      
      // Verify the direct response has a valid text response (not JSON)
      let finalResponse = directResponse.response;
      
      // Check if the response looks like raw JSON (a common error with LLM responses)
      if (finalResponse && typeof finalResponse === 'string' && 
          (finalResponse.trim().startsWith('{') || finalResponse.trim().startsWith('```'))) {
        console.warn('Detected potential raw JSON in LLM response, attempting to fix...');
        
        // Try to extract just the response field if it's embedded JSON
        try {
          // Remove any markdown code blocks
          const cleanJson = finalResponse.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          
          if (parsed && parsed.response && typeof parsed.response === 'string') {
            console.log('Successfully extracted embedded response from JSON');
            finalResponse = parsed.response;
          }
        } catch (e) {
          console.error('Failed to parse embedded JSON in response:', e);
          finalResponse = "I apologize, but I'm having trouble formatting my response correctly. Please try again.";
        }
      }
      
      // Create a structured response with trace information
      const llmResponse = {
        trace_id: traceId,
        response: finalResponse,
        reasoning: directResponse.reasoning || [],
        completed: true,
        classification: directResponse.classification || {
          results: {},
          top_categories: []
        }
      };
      
      // Create a more detailed trace for storage
      const traceData = {
        id: traceId,
        timestamp: new Date().toISOString(),
        input: userMessage,
        final_output: directResponse.response,
        completed: true,
        steps: directResponse.reasoning || [],
        classification: directResponse.classification,
        has_images: processedImages.length > 0,
        images: processedImages
      };
      
      // Store in memory for retrieval
      MOCK_TRACES.set(traceId, traceData);
      // traceStorage.saveTrace(traceData); // Removed: localStorage not available in API routes
      
      console.log(`Generated response with trace ID: ${traceId}`);
      
      // Return the LLM-generated response
      return NextResponse.json(llmResponse);
    } catch (llmError: any) {
      console.error('Direct LLM call failed:', llmError);
      
      // Log more detailed error information
      if (llmError instanceof Error) {
        console.error(`Error type: ${llmError.name}, Message: ${llmError.message}`);
        console.error(`Stack trace: ${llmError.stack}`);
      }
      
      // If direct LLM call fails, return a simple error message JSON response
      const fallbackResponse = {
        trace_id: traceId,
        response: "I apologize, but I'm currently having trouble processing your request. Our AI system is experiencing temporary issues. Please try again in a few moments or contact support if the problem persists.",
        reasoning: [],
        completed: false,
        error: {
          type: 'LLM_ERROR',
          message: llmError instanceof Error ? llmError.message : 'Unknown error occurred while contacting the AI model.'
        }
      };
      
      return NextResponse.json(fallbackResponse);
    }
  } catch (error: any) {
    console.error('Proxy API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

// Trace retrieval endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const traceId = searchParams.get('trace_id');

    // Get the backend URL from environment variables with default fallback
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    if (!traceId) {
      return NextResponse.json({ error: 'trace_id is required' }, { status: 400 });
    }

    console.log(`Proxy attempting to fetch trace ${traceId} ONLY from backend: ${BACKEND_URL}/api/trace/${traceId}`);

    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/trace/${traceId}`);
      
      if (!backendResponse.ok) {
        const errorBody = await backendResponse.text();
        console.error(`Backend returned ${backendResponse.status} for trace ${traceId}: ${errorBody.substring(0, 200)}`);
        // Do not throw here, let the generic error handler below catch it as 'Trace not found'
        // This maintains the behavior of 404 if backend doesn't find it.
        return NextResponse.json(
          { error: `Trace not found (from backend): ${traceId}`, details: `Backend status: ${backendResponse.status}` }, 
          { status: 404 }
        );
      }
      
      const trace = await backendResponse.json();
      console.log(`Trace ${traceId} successfully retrieved from backend.`);
      return NextResponse.json(trace);

    } catch (fetchError: any) {
      console.error(`Error fetching trace ${traceId} from backend:`, fetchError);
      // This catch is for network errors or if the backend is down, not for 404s from the backend (handled above)
      return NextResponse.json(
        { error: `Failed to fetch trace from backend: ${traceId}`, details: fetchError.message }, 
        { status: 502 } // Bad Gateway, as proxy couldn't reach backend properly
      );
    }

  } catch (error: any) {
    console.error('Overall API error in GET /api/proxy:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the trace.', details: error.message }, 
      { status: 500 }
    );
  }
}