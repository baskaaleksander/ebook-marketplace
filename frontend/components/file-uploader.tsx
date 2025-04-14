'use client';
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileUploaderProps } from "@/lib/definitions";


export default function FileUploader({
  onFileSelect,
  accept = "*/*",
  maxSize = 10,
  className = "",
  label = "Drag & drop a file here"
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    if (accept !== "*/*") {
      const fileType = file.type;
      const acceptedTypes = accept.split(",").map(type => type.trim());
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith("/*")) {

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

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          )}
        >
          <p className="mb-2">{label}</p>
          <Input 
            type="file" 
            accept={accept}
            onChange={onFileChange}
            className="cursor-pointer"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}