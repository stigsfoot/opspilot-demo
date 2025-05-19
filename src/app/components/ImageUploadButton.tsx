"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  FileUp, 
  X, 
  Clipboard, 
  Camera, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageAttachment } from "../lib/types";
import { prepareImageForApi, getOptimizationOptions } from "../lib/imageProcessor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageUploadButtonProps {
  onImagesSelected: (images: ImageAttachment[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUploadButton({
  onImagesSelected,
  disabled = false,
  className,
}: ImageUploadButtonProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check file size limitations (now supports up to 15MB per file due to compression)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    const MAX_FILES = 3;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // Validate files
    if (files.length > MAX_FILES) {
      setErrorMessage(`You can upload up to ${MAX_FILES} images at once`);
      setShowErrorDialog(true);
      e.target.value = '';
      return;
    }
    
    const imageAttachments: ImageAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!validImageTypes.includes(file.type)) {
        setErrorMessage(`${file.name} is not a supported image format. Please use JPEG, PNG, GIF or WEBP.`);
        setShowErrorDialog(true);
        e.target.value = '';
        return;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`${file.name} exceeds the 15MB size limit.`);
        setShowErrorDialog(true);
        e.target.value = '';
        return;
      }
      
      // Process and optimize the image
      try {
        // Show a loading indicator or message for large images
        if (file.size > 5 * 1024 * 1024) {
          console.log(`Processing large image: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
        }
        
        // Get optimal compression settings based on image size
        const options = getOptimizationOptions(file);
        
        // Process the image with our advanced processor
        const { base64Data, contentType, size } = await prepareImageForApi(file, options);
        
        // Log compression results
        const compressionRatio = ((1 - size / file.size) * 100).toFixed(1);
        console.log(`Compressed ${file.name}: ${(file.size / (1024 * 1024)).toFixed(2)}MB -> ${(size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}% reduction)`);
        
        // Create image attachment object
        imageAttachments.push({
          id: `img-${Date.now()}-${i}`,
          name: file.name,
          contentType,
          url: URL.createObjectURL(file),
          base64Data,
        });
      } catch (error) {
        console.error("Error processing image:", error);
        setErrorMessage(`Error processing ${file.name}. Please try another image.`);
        setShowErrorDialog(true);
        e.target.value = '';
        return;
      }
    }
    
    // Pass images to parent component
    if (imageAttachments.length > 0) {
      onImagesSelected(imageAttachments);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  // Function to read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Function to handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      let hasProcessedImage = false;
      const imageAttachments: ImageAttachment[] = [];
      
      for (const clipboardItem of clipboardItems) {
        // Check if there's an image in the clipboard
        if (clipboardItem.types.some(type => type.startsWith('image/'))) {
          // Get the image type
          const imageType = clipboardItem.types.find(type => type.startsWith('image/'));
          if (!imageType) continue;
          
          // Get the image blob
          const blob = await clipboardItem.getType(imageType);
          if (!blob) continue;
          
          // Convert to a file from blob for processing
          const file = new File([blob], `clipboard-image-${Date.now()}.png`, { type: blob.type });
          
          // Process the image with our advanced processor
          console.log(`Processing clipboard image (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
          const options = getOptimizationOptions(file);
          const { base64Data, contentType, size } = await prepareImageForApi(file, options);
          
          // Log compression results
          const compressionRatio = ((1 - size / file.size) * 100).toFixed(1);
          console.log(`Compressed clipboard image: ${(file.size / (1024 * 1024)).toFixed(2)}MB -> ${(size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}% reduction)`);
          
          // Create image attachment
          imageAttachments.push({
            id: `img-${Date.now()}`,
            name: `Screenshot ${new Date().toLocaleTimeString()}`,
            contentType,
            url: URL.createObjectURL(blob),
            base64Data,
          });
          
          hasProcessedImage = true;
        }
      }
      
      if (hasProcessedImage && imageAttachments.length > 0) {
        onImagesSelected(imageAttachments);
      } else {
        setErrorMessage("No image found in clipboard. Try copying an image first.");
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error accessing clipboard:", error);
      setErrorMessage("Could not access clipboard. Make sure you've granted permission.");
      setShowErrorDialog(true);
    }
  };
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className={cn("h-10 w-10 rounded-full", className)}
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Attach screenshot (max 15MB)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <input
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      
      {/* Error dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Image upload error
            </AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}