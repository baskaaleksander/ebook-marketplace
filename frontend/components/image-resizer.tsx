'use client';
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useImage } from "@/providers/image-provider";
import FileUploader from "./file-uploader";

type Point = {
  x: number;
  y: number;
};

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getCroppedImg(imageSrc: string, crop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

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

export default function ImageResizer() {
  const { setImage } = useImage();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImgUrl, setCroppedImgUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setImage(croppedImage);
      setCroppedImgUrl(croppedImage);
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels, setImage]);

  const handleImageClear = () => {
    setImageSrc(null);
    setCroppedImgUrl(null);
    setImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setDialogOpen(false);
  }

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setZoom(1);
        setDialogOpen(true);
      }
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <FileUploader
        onFileSelect={handleFileSelect}
        accept="image/*"
        maxSize={5}
        label="Drag & drop an image here"
        className="max-w-md"
      />

      {croppedImgUrl && (
        <Card className="w-full max-w-md p-4">
          <CardContent className="flex flex-col gap-4 items-center">
            <div className="mt-4">
              <img
                src={croppedImgUrl}
                alt="Cropped"
                className="w-64 h-64 object-cover rounded-xl shadow"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleImageClear}
            >
              Clear Image
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

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

          <div className="mt-4">
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={([val]) => setZoom(val)}
            />
          </div>

          <Button onClick={showCroppedImage} className="mt-4 w-full">
            Confirm Crop
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}