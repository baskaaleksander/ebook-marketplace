'use client';
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";
import { ImageProvider, useImage } from "@/providers/image-provider";
import ImageResizer from "./image-resizer";

interface ChangeAvatarDialogProps {
  currentAvatarUrl?: string;
  userName?: string;
  userSurname?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ChangeAvatarDialogContent({
  currentAvatarUrl,
  userName,
  userSurname,
  onAvatarChange,
  onOpenChange
}: ChangeAvatarDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { image, setImage } = useImage();
  const { user } = useAuth();

  useEffect(() => {
    if (currentAvatarUrl) {
      setImage(currentAvatarUrl);
    }
  }, [currentAvatarUrl, setImage]);

  const handleSaveAvatar = async () => {
    if (!image || !user?.id) return;
    setError(null);
    setUploading(true);

    try {

    if (image.startsWith('data:') || image.startsWith('blob:')) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        const imageUploadResponse = await api.post('/upload', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        const avatarUrl = imageUploadResponse.data.imageUrl || 
                         `http://localhost:3000/uploads/${imageUploadResponse.data.filename}`;
        
        await api.put(`/user/${user.id}`, { avatarUrl });
        
        onAvatarChange(avatarUrl);
        
        onOpenChange(false);
      } else {

        await api.put(`/user/${user.id}`, { avatarUrl: image });
        onAvatarChange(image);
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError(err?.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogDescription>
          Upload a new profile picture or adjust the current one
        </DialogDescription>
      </DialogHeader>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      
      <div className="mb-4">
        <ImageResizer />
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveAvatar}
          disabled={uploading || !image}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : "Save Avatar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ChangeAvatarDialog(props: ChangeAvatarDialogProps) {
  return (
    <ImageProvider>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <ChangeAvatarDialogContent {...props} />
      </Dialog>
    </ImageProvider>
  );
}

export default ChangeAvatarDialog;