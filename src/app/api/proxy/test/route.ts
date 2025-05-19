/**
 * Test API endpoint for checking Gemini API connectivity
 */
import { NextRequest, NextResponse } from 'next/server';
import { testGeminiAPIConnection } from '../testGeminiAPI';

/**
 * GET handler for the test endpoint
 * Checks Gemini API connectivity and returns the results
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Running Gemini API connectivity test...');
    
    // Check environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const hasApiKey = !!apiKey;
    
    console.log('Environment check:', {
      hasGeminiApiKey: hasApiKey,
      apiKeyLength: hasApiKey ? apiKey.length : 0,
      nodeEnv: process.env.NODE_ENV,
      nextPublicBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
    });
    
    // Run the test
    const testResults = await testGeminiAPIConnection();
    
    // Return the results
    return NextResponse.json({
      success: testResults.success,
      timestamp: new Date().toISOString(),
      environment: {
        hasGeminiApiKey: hasApiKey,
        apiKeyFormat: hasApiKey ? (apiKey.startsWith('AIza') ? 'Appears valid' : 'Invalid format') : 'Missing',
        nextPublicBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'
      },
      testResults: {
        gemini_2_5_pro: {
          success: testResults.results.gemini_2_5_pro.success,
          error: testResults.results.gemini_2_5_pro.error ? 
            (typeof testResults.results.gemini_2_5_pro.error === 'string' ? 
              testResults.results.gemini_2_5_pro.error.substring(0, 200) : 'Error object (not shown)') : 
            null
        },
        gemini_1_5_pro: {
          success: testResults.results.gemini_1_5_pro.success,
          error: testResults.results.gemini_1_5_pro.error ? 
            (typeof testResults.results.gemini_1_5_pro.error === 'string' ? 
              testResults.results.gemini_1_5_pro.error.substring(0, 200) : 'Error object (not shown)') : 
            null
        }
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run API test',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}