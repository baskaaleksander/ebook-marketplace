'use client';
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileUploaderProps } from "@/lib/definitions";

/**
 * FileUploader component provides drag-and-drop and click-to-upload functionality
 * Supports file type filtering, size limits, and visual feedback during interaction
 * 
 * @param {FileUploaderProps} props - Component configuration props
 */
export default function FileUploader({
  onFileSelect,     // Callback function when a valid file is selected
  accept = "*/*",   // MIME types to accept, e.g., "image/png,image/jpeg" or "application/pdf"
  maxSize = 10,     // Maximum file size in MB
  className = "",   // Additional CSS classes for styling
  label = "Drag & drop a file here" // Custom instruction text
}: FileUploaderProps) {
  // Track active drag state for visual feedback
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Store validation error messages
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates file against size and type constraints
   * Sets error state if validation fails
   * 
   * @param {File} file - The file to validate
   * @returns {boolean} Whether the file is valid
   */
  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size against maxSize limit (converted to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    // Skip type validation if accepting all files
    if (accept !== "*/*") {
      const fileType = file.type;
      const acceptedTypes = accept.split(",").map(type => type.trim());
      
      // Check if file type matches any accepted types
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith("/*")) {
            // Handle wildcard types like "image/*"
            const typeCategory = type.split("/")[0];
          return fileType.startsWith(`${typeCategory}/`);
        }
        return type === fileType;
      });
      
      if (!isAccepted) {
        setError("File type not accepted");
        return false;
      }
    }
    
    return true;
  };

  /**
   * Common handler for processing a file from any source
   * Validates and passes the file to the parent component if valid
   * 
   * @param {File} file - The file to process
   */
  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  /**
   * Handler for standard file input change event
   * Processes file selected via the file input dialog
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  /**
   * Handler for drop event when user releases file over drop zone
   * Processes dropped files and resets the drag state
   * 
   * @param {React.DragEvent<HTMLDivElement>} e - Drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handler for dragOver event to update visual feedback
   * Prevents default browser behavior and shows active drop zone
   * 
   * @param {React.DragEvent<HTMLDivElement>} e - DragOver event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  /**
   * Handler for dragLeave event to reset visual feedback
   * Removes active drop zone styling when drag leaves the zone
   */
  const handleDragLeave = () => setDragActive(false);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        {/* Drop zone container with dynamic styling based on drag state */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          )}
        >
          {/* Custom label text for instructions */}
          <p className="mb-2">{label}</p>
          
          {/* File input for traditional file selection */}
          <Input 
            type="file" 
            accept={accept}
            onChange={onFileChange}
            className="cursor-pointer"
          />
          
          {/* Error message display when validation fails */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}