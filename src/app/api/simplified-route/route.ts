/**
 * Simplified API route handler for IT support system
 * Provides a clean, direct implementation without complex proxy behavior
 */

import { NextRequest, NextResponse } from 'next/server';
import { callDirectApi, getTrace } from '../simplified-proxy';

/**
 * Handles POST requests with user messages and optional images
 */
export async function POST(request: NextRequest) {
  try {
    // Extract request data
    const body = await request.json();
    const userMessage = body.message || "";
    const images = body.images || [];
    
    // Call the direct API implementation
    const response = await callDirectApi(userMessage, images);
    
    // Return the response
    return NextResponse.json(response);
  } catch (error) {
    console.error('API route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests for retrieving traces or checking health
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const traceId = searchParams.get('trace_id');
    
    // If trace_id provided, get that specific trace
    if (traceId) {
      const trace = getTrace(traceId);
      
      if (trace) {
        return NextResponse.json(trace);
      } else {
        return NextResponse.json(
          { error: `Trace not found: ${traceId}` },
          { status: 404 }
        );
      }
    }
    
    // Default health check response
    return NextResponse.json({ 
      status: 'ok',
      directImplementation: true
    });
  } catch (error) {
    console.error('API route error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}