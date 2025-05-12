'use client';
import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useImage } from "@/providers/image-provider";
import FileUploader from "./file-uploader";
import { LiaTimesSolid } from "react-icons/lia";

/**
 * Point interface defines the coordinates of the crop area center
 * Used to track and update the crop position on the image
 */
type Point = {
  x: number;
  y: number;
};

/**
 * Area interface defines the dimensions of a crop selection
 * Contains position and size information for image cropping
 */
type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Creates a cropped version of an image using canvas API
 * Takes the original image and crop dimensions, returns a blob URL
 * 
 * @param {string} imageSrc - Source of the image to crop (data URL or blob URL)
 * @param {Area} crop - Area to extract from the image
 * @returns {Promise<string>} - Blob URL of the cropped image
 */
function getCroppedImg(imageSrc: string, crop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create an image element from the source
    const image = new Image();
    image.src = imageSrc;
    
    // When image loads, perform the cropping
    image.onload = () => {
      // Create a canvas with the crop dimensions
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw only the cropped portion to the canvas
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      // Convert canvas to blob and create an object URL
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    };
    image.onerror = reject;
  });
}

/**
 * ImageResizer component provides image upload, cropping, and preview functionality
 * Uses react-easy-crop for interactive image cropping with zoom support
 * Integrates with ImageProvider context to share the selected/cropped image with parent components
 */
export default function ImageResizer() {
  // Access image context for global state management
  const { setImage, image } = useImage();
  
  // State management for the image and crop process
  const [imageSrc, setImageSrc] = useState<string | null>(null);       // Original uploaded image source
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });             // Current crop position
  const [zoom, setZoom] = useState<number>(1);                         // Current zoom level
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);  // Selected crop area
  const [croppedImgUrl, setCroppedImgUrl] = useState<string | null>(null);        // URL of cropped image
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);        // Controls crop dialog visibility

  /**
   * Effect to sync local state with image from context
   * If an image exists in context but not locally, use it as the cropped image
   */
  useEffect(() => {
    if (image && !croppedImgUrl) {
      setCroppedImgUrl(image);
    }
  }, [image, croppedImgUrl]);

  /**
   * Callback for handling crop area changes
   * Updates the stored crop area pixels when user adjusts the crop
   * 
   * @param {Area} _ - Unused percentage-based crop area
   * @param {Area} croppedPixels - Pixel-based crop area used for actual cropping
   */
  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  /**
   * Performs the actual image cropping when user confirms selection
   * Updates both local state and image context with the cropped result
   */
  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      
      // Generate cropped image from the selected area
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Update both context and local state
      setImage(croppedImage);
      setCroppedImgUrl(croppedImage);
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, setImage]);

  /**
   * Resets all image state variables to their initial values
   * Clears both the local state and image context
   */
  const handleImageClear = () => {
    setImageSrc(null);
    setCroppedImgUrl(null);
    setImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setDialogOpen(false);
  }

  /**
   * Processes the uploaded file into a data URL
   * Opens the crop dialog when image is ready
   * 
   * @param {File} file - The uploaded image file
   */
  const handleFileSelect = (file: File) => {
    // Convert file to data URL for the cropper
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setZoom(1);  // Reset zoom when loading a new image
        setDialogOpen(true);  // Open crop dialog automatically
      }
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Conditional rendering: show uploader or preview based on state */}
      {!croppedImgUrl ? (
        // File upload component when no image is selected
        <FileUploader
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSize={5}
          label="Drag & drop an image here"
          className="max-w-md"
        />
      ) : (
        // Image preview with remove button when image is selected
        <Card className="w-full max-w-md p-4">
          <CardContent className="flex flex-col items-center">
            <div className="mt-4 relative">
              <img
                src={croppedImgUrl}
                alt="Product image"
                className="w-64 h-64 object-cover rounded-xl shadow"
              />
              {/* Remove button positioned at top-right of image */}
              <div className="absolute -top-3 -right-3 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleImageClear}
                  className="h-8 w-8 rounded-full p-0"
                  aria-label="Clear image"
                >
                  <LiaTimesSolid />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cropping dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

          {/* Container for the cropper component */}
          <div className="relative w-full aspect-square bg-gray-100">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                minZoom={1}
              />
            )}
          </div>

          {/* Zoom slider control */}
          <div className="mt-4">
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={([val]) => setZoom(val)}
            />
          </div>

          {/* Confirm crop button */}
          <Button onClick={showCroppedImage} className="mt-4 w-full">
            Confirm Crop
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}