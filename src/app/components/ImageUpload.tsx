"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, X, Camera, Upload } from "lucide-react";
import { ImageAttachment } from "../lib/types";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImagesSelected: (images: ImageAttachment[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ onImagesSelected, disabled = false, className }: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Skip unsupported file types
      if (!file.type.startsWith("image/")) continue;

      try {
        // Read the file as base64
        const base64Data = await readFileAsBase64(file);
        
        // Create a URL for preview
        const url = URL.createObjectURL(file);
        
        // Add to selected images
        newImages.push({
          id: generateId(),
          url,
          base64Data,
          contentType: file.type,
          name: file.name
        });
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...selectedImages, ...newImages];
      setSelectedImages(updatedImages);
      onImagesSelected(updatedImages);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove an image
  const handleRemoveImage = (id: string) => {
    const updatedImages = selectedImages.filter(img => img.id !== id);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Generate a unique ID for the image
  const generateId = () => Math.random().toString(36).substring(2, 15);

  // Read a file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        multiple
        disabled={disabled}
      />

      {/* Button to trigger file selection */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleButtonClick}
        disabled={disabled}
      >
        <Image className="h-4 w-4" />
        <span>Attach Screenshot</span>
      </Button>

      {/* Preview of selected images */}
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.name}
                className="h-16 w-16 object-cover rounded border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="h-5 w-5 absolute -top-2 -right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(image.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}