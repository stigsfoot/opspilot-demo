/**
 * Enhanced debug logger utility for the frontend
 * Provides better console output and error reporting
 */

// Enable debug mode in development
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Different log types with color coding
type LogType = 'info' | 'success' | 'warning' | 'error' | 'api' | 'image';

// CSS styles for different log types
const LOG_STYLES = {
  info: 'color: #3b82f6; font-weight: bold;', // Blue
  success: 'color: #10b981; font-weight: bold;', // Green
  warning: 'color: #f59e0b; font-weight: bold;', // Amber
  error: 'color: #ef4444; font-weight: bold;', // Red
  api: 'color: #8b5cf6; font-weight: bold;', // Purple
  image: 'color: #ec4899; font-weight: bold;', // Pink
};

/**
 * Log a debug message with appropriate styling
 */
export function logDebug(type: LogType, message: string, data?: any) {
  if (!DEBUG_MODE) return;
  
  const prefix = `[${type.toUpperCase()}]`;
  
  // Log the message with styling
  console.log(`%c${prefix} ${message}`, LOG_STYLES[type]);
  
  // Log additional data if provided
  if (data !== undefined) {
    console.log(
      '%cDetails:',
      'color: #6b7280; font-style: italic;',
      data
    );
  }
}

/**
 * Log information about an image being processed
 */
export function logImageProcessing(file: File, compressedSize?: number) {
  if (!DEBUG_MODE) return;
  
  const originalSizeMB = file.size / (1024 * 1024);
  const compressionRatio = compressedSize 
    ? `(${((1 - compressedSize / file.size) * 100).toFixed(1)}% reduction)`
    : '';
  
  logDebug(
    'image',
    `Processing image: ${file.name}`,
    {
      name: file.name,
      type: file.type,
      originalSize: `${originalSizeMB.toFixed(2)} MB`,
      ...(compressedSize && {
        compressedSize: `${(compressedSize / (1024 * 1024)).toFixed(2)} MB`,
        compressionRatio
      })
    }
  );
}

/**
 * Log API request information
 */
export function logApiRequest(endpoint: string, method: string, payload?: any) {
  if (!DEBUG_MODE) return;
  
  logDebug(
    'api',
    `${method.toUpperCase()} ${endpoint}`,
    {
      time: new Date().toISOString(),
      payload: payload ? sanitizePayload(payload) : undefined
    }
  );
}

/**
 * Log API response information
 */
export function logApiResponse(endpoint: string, status: number, data?: any) {
  if (!DEBUG_MODE) return;
  
  const type = status >= 200 && status < 300 ? 'success' : 'error';
  
  logDebug(
    type,
    `Response ${status} from ${endpoint}`,
    data
  );
}

/**
 * Log multimodal processing information
 */
export function logMultimodalProcessing(messageLength: number, imageCount: number, imageDetails?: any[]) {
  if (!DEBUG_MODE) return;
  
  logDebug(
    'api',
    `Multimodal request: ${imageCount} images with ${messageLength} chars message`,
    {
      messageLength,
      imageCount,
      images: imageDetails
    }
  );
}

/**
 * Sanitize sensitive data from payloads for logging
 */
function sanitizePayload(payload: any): any {
  if (!payload) return payload;
  
  // Clone the payload to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(payload));
  
  // Truncate large base64 strings in the images array
  if (sanitized.images && Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images.map((img: any, index: number) => {
      if (typeof img === 'string') {
        const sizeKB = Math.round((img.length * 0.75) / 1024);
        return `[Image ${index + 1}: ${sizeKB}KB]`;
      }
      return img;
    });
  }
  
  return sanitized;
}

/**
 * Global error logger for unexpected errors
 */
export function logError(error: Error | any, context?: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logDebug(
    'error',
    `Error${context ? ` in ${context}` : ''}: ${errorMessage}`,
    {
      error,
      stack: errorStack,
      time: new Date().toISOString()
    }
  );
}

// Expose logger as a global utility in development
if (DEBUG_MODE && typeof window !== 'undefined') {
  (window as any).debugLogger = {
    log: logDebug,
    debug,
    error: logError,
    api: {
      request: logApiRequest,
      response: logApiResponse
    },
    image: logImageProcessing,
    multimodal: logMultimodalProcessing
  };
  
  console.log(
    '%c[DEBUG] Debug logger initialized. Access via window.debugLogger',
    'color: #6b7280; font-style: italic;'
  );
}

/**
 * Simple debug log shorthand function
 */
export function debug(message: string, data?: any) {
  logDebug('info', message, data);
}

export default {
  log: logDebug,
  debug,
  error: logError,
  apiRequest: logApiRequest,
  apiResponse: logApiResponse,
  imageProcessing: logImageProcessing,
  multimodalProcessing: logMultimodalProcessing
};