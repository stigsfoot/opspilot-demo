/**
 * Test utility for Gemini API connectivity
 * This file provides a simple test function for validating Gemini API access
 */

/**
 * Simple test function to validate Gemini API connectivity
 * Tests both Gemini 2.5 Pro and Gemini 1.5 Pro models
 */
export async function testGeminiAPIConnection() {
  // Get API key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured. Make sure it is set in the root .env file.');
    return { success: false, error: 'API key missing' };
  }
  
  console.log('Gemini API key status:', apiKey ? 'Found (not showing actual key)' : 'Missing');
  
  // Test data
  const simpleRequest = {
    contents: [
      {
        parts: [
          { text: "You are a helpful assistant.\n\nUser: Hello, can you hear me?\n\nAssistant:" }
        ],
        role: "user"
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100
    }
  };
  
  const results = {
    gemini_2_5_pro: { success: false, error: null, response: null },
    gemini_1_5_pro: { success: false, error: null, response: null }
  };
  
  // Test Gemini 2.5 Pro
  console.log('Testing Gemini 2.5 Pro Preview connectivity...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simpleRequest)
      }
    );
    
    const responseStatus = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
    
    console.log('Gemini 2.5 Pro response status:', responseStatus);
    
    if (response.ok) {
      const data = await response.json();
      results.gemini_2_5_pro.success = true;
      results.gemini_2_5_pro.response = data;
      console.log('Gemini 2.5 Pro test successful');
    } else {
      const errorText = await response.text();
      results.gemini_2_5_pro.error = `${response.status} ${response.statusText}: ${errorText}`;
      console.error('Gemini 2.5 Pro error:', errorText);
    }
  } catch (error) {
    results.gemini_2_5_pro.error = error.message;
    console.error('Gemini 2.5 Pro fetch error:', error);
  }
  
  // Test Gemini 1.5 Pro
  console.log('Testing Gemini 1.5 Pro connectivity...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simpleRequest)
      }
    );
    
    const responseStatus = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
    
    console.log('Gemini 1.5 Pro response status:', responseStatus);
    
    if (response.ok) {
      const data = await response.json();
      results.gemini_1_5_pro.success = true;
      results.gemini_1_5_pro.response = data;
      console.log('Gemini 1.5 Pro test successful');
    } else {
      const errorText = await response.text();
      results.gemini_1_5_pro.error = `${response.status} ${response.statusText}: ${errorText}`;
      console.error('Gemini 1.5 Pro error:', errorText);
    }
  } catch (error) {
    results.gemini_1_5_pro.error = error.message;
    console.error('Gemini 1.5 Pro fetch error:', error);
  }
  
  const overallSuccess = results.gemini_2_5_pro.success || results.gemini_1_5_pro.success;
  
  console.log('API test results:', {
    success: overallSuccess,
    gemini_2_5_pro: {
      success: results.gemini_2_5_pro.success,
      error: results.gemini_2_5_pro.error ? 'Error occurred' : null
    },
    gemini_1_5_pro: {
      success: results.gemini_1_5_pro.success,
      error: results.gemini_1_5_pro.error ? 'Error occurred' : null
    }
  });
  
  return {
    success: overallSuccess,
    results
  };
}