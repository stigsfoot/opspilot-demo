import imageCompression from 'browser-image-compression';
import debugLogger from './debugLogger';

/**
 * Advanced image processing utility for optimizing images before sending to backend
 */

/**
 * Configuration options for image optimization
 */
export type ImageOptimizationOptions = {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType?: string;
  initialQuality?: number;
};

// Default optimization options
export const defaultOptions: ImageOptimizationOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

// Options for different quality levels
export const qualityOptions = {
  high: {
    maxSizeMB: 2,
    maxWidthOrHeight: 2560,
    initialQuality: 0.9,
    useWebWorker: true,
  },
  medium: defaultOptions,
  low: {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1280,
    initialQuality: 0.7,
    useWebWorker: true,
  },
};

/**
 * Process a File object to compress and optimize it
 */
export async function compressImage(
  file: File,
  options: Partial<ImageOptimizationOptions> = {}
): Promise<File> {
  // Merge with default options
  const processingOptions: ImageOptimizationOptions = {
    ...defaultOptions,
    ...options,
  };

  debugLogger.imageProcessing(file);
  debugLogger.log('info', `Target size: ${processingOptions.maxSizeMB} MB, max dimensions: ${processingOptions.maxWidthOrHeight}px`);

  try {
    const compressedFile = await imageCompression(file, processingOptions);
    
    // Log compression results with more detail
    debugLogger.imageProcessing(file, compressedFile.size);
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Convert a File or Blob to base64 data URL
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert file to base64'));
    };
  });
}

/**
 * Extract base64 data from a data URL (removes the prefix)
 */
export function extractBase64Data(dataUrl: string): string {
  if (dataUrl.includes('base64,')) {
    return dataUrl.split('base64,')[1];
  }
  return dataUrl;
}

/**
 * Comprehensive process to prepare an image for API transmission
 * Compresses, converts to base64, and optionally extracts the raw base64 data
 */
export async function prepareImageForApi(
  file: File,
  options: Partial<ImageOptimizationOptions> = {},
  extractRawBase64: boolean = true
): Promise<{ base64Data: string; contentType: string; size: number }> {
  // Compress the image
  const compressedFile = await compressImage(file, options);
  
  // Convert to base64
  const base64DataUrl = await fileToBase64(compressedFile);
  
  // Get content type from the data URL
  const contentType = base64DataUrl.split(';')[0].split(':')[1];
  
  return {
    base64Data: extractRawBase64 ? extractBase64Data(base64DataUrl) : base64DataUrl,
    contentType,
    size: compressedFile.size,
  };
}

/**
 * Get the best optimization options based on the file's characteristics
 */
export function getOptimizationOptions(file: File): ImageOptimizationOptions {
  // For large images, use more aggressive compression
  if (file.size > 5 * 1024 * 1024) {
    return {
      ...qualityOptions.low,
      maxSizeMB: 0.8,
    };
  }
  // For medium images
  else if (file.size > 2 * 1024 * 1024) {
    return qualityOptions.low;
  }
  // For smaller images
  else if (file.size > 1 * 1024 * 1024) {
    return qualityOptions.medium;
  }
  // For already small images, use higher quality settings
  else {
    return qualityOptions.high;
  }
}