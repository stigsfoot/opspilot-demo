/**
 * Local storage manager for trace data to ensure persistence
 * across page reloads while in development mode
 */

import { Trace } from './lib/types';

// Type definition for trace storage
type TraceStorage = {
  [traceId: string]: Trace;
};

// Storage key for localStorage
const TRACE_STORAGE_KEY = 'itsm_opspilot_traces';

/**
 * Save a trace to local storage
 */
export function saveTraceToStorage(trace: Trace): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing traces
    const existingTraces = getTracesFromStorage();
    
    // Add the new trace
    existingTraces[trace.id] = trace;
    
    // Save back to localStorage
    localStorage.setItem(TRACE_STORAGE_KEY, JSON.stringify(existingTraces));
    
    console.log(`Trace ${trace.id} saved to local storage`);
  } catch (error) {
    console.error('Failed to save trace to storage:', error);
  }
}

/**
 * Get a specific trace from storage
 */
export function getTraceFromStorage(traceId: string): Trace | null {
  if (typeof window === 'undefined') return null;
  
  try {
    console.log(`Attempting to retrieve trace ${traceId} from local storage`);
    const traces = getTracesFromStorage();
    
    if (traces[traceId]) {
      console.log(`Found trace ${traceId} in local storage`);
      return traces[traceId];
    } else {
      console.log(`Trace ${traceId} not found in local storage`);
      
      // Additional check for trace IDs that might have the 'mock-' or 'direct-' prefix trimmed
      // This helps with compatibility when trace IDs are inconsistently formatted
      const alternateId = traceId.startsWith('mock-') || traceId.startsWith('direct-') 
        ? traceId.substring(traceId.indexOf('-') + 1) 
        : `direct-${traceId}`;
        
      if (traces[alternateId]) {
        console.log(`Found trace using alternate ID ${alternateId}`);
        return traces[alternateId];
      }
      
      return null;
    }
  } catch (error) {
    console.error(`Failed to get trace ${traceId} from storage:`, error);
    return null;
  }
}

/**
 * Get all traces from storage
 */
export function getTracesFromStorage(): TraceStorage {
  if (typeof window === 'undefined') return {};
  
  try {
    const tracesJson = localStorage.getItem(TRACE_STORAGE_KEY);
    return tracesJson ? JSON.parse(tracesJson) : {};
  } catch (error) {
    console.error('Failed to get traces from storage:', error);
    return {};
  }
}

/**
 * Remove a trace from storage
 */
export function removeTraceFromStorage(traceId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const traces = getTracesFromStorage();
    if (traces[traceId]) {
      delete traces[traceId];
      localStorage.setItem(TRACE_STORAGE_KEY, JSON.stringify(traces));
      console.log(`Trace ${traceId} removed from storage`);
    }
  } catch (error) {
    console.error(`Failed to remove trace ${traceId} from storage:`, error);
  }
}

/**
 * Clear all traces from storage
 */
export function clearTracesFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(TRACE_STORAGE_KEY);
    console.log('All traces cleared from storage');
  } catch (error) {
    console.error('Failed to clear traces from storage:', error);
  }
}

export default {
  saveTrace: saveTraceToStorage,
  getTrace: getTraceFromStorage,
  getAllTraces: getTracesFromStorage,
  removeTrace: removeTraceFromStorage,
  clearTraces: clearTracesFromStorage
};