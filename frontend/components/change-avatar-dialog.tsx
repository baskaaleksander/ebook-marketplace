'use client';
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
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

/**
 * Props interface for the ChangeAvatarDialog component
 * Defines required properties for avatar editing functionality
 */
interface ChangeAvatarDialogProps {
  currentAvatarUrl?: string;      // Current avatar image URL if one exists
  userName?: string;              // User's first name for fallback avatar generation
  userSurname?: string;           // User's last name for fallback avatar generation
  onAvatarChange: (newAvatarUrl: string) => void;  // Callback when avatar is successfully changed
  open: boolean;                  // Dialog open state
  onOpenChange: (open: boolean) => void;  // Function to control dialog visibility
}

/**
 * ChangeAvatarDialogContent component handles the actual avatar editing UI
 * Contains image editor, upload logic, and API integration
 * 
 * @param {ChangeAvatarDialogProps} props - Component props
 */
function ChangeAvatarDialogContent({
  currentAvatarUrl,
  onAvatarChange,
  onOpenChange
}: ChangeAvatarDialogProps) {
  // State management for error handling and loading states
  const [error, setError] = useState<string | null>(null);  // Error message if upload fails
  const [uploading, setUploading] = useState(false);        // Track upload in progress
  
  // Get image data from the ImageProvider context
  const { image, setImage } = useImage();
  
  // Get authenticated user information
  const { user } = useAuth();

  /**
   * Effect to initialize the image editor with the current avatar
   * Sets the initial image when the component mounts or currentAvatarUrl changes
   */
  useEffect(() => {
    if (currentAvatarUrl) {
      setImage(currentAvatarUrl);
    }
  }, [currentAvatarUrl, setImage]);

  /**
   * Handles the avatar save process
   * Uploads image to server if it's a new image (blob or data URL)
   * Or updates the user with an existing URL
   */
  const handleSaveAvatar = async () => {
    // Skip if no image is selected or user ID is not available
    if (!image || !user?.id) return;
    
    // Reset state before starting upload
    setError(null);
    setUploading(true);

    try {
      // Check if the image is a newly uploaded/edited image or an existing URL
      if (image.startsWith('data:') || image.startsWith('blob:')) {
        // Convert data URL or blob to a file for upload
        const response = await fetch(image);
        const blob = await response.blob();
        const imageFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        
        // Create FormData for multipart upload
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        // Upload image to server
        const imageUploadResponse = await api.post('/upload', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        // Extract avatar URL from response or build local URL
        const avatarUrl = imageUploadResponse.data.url || 
                         `http://localhost:3000/uploads/${imageUploadResponse.data.filename}`;
        
        // Update user profile with new avatar URL
        await api.put(`/user/${user.id}`, { avatarUrl });
        
        // Notify parent component about successful change
        onAvatarChange(avatarUrl);
        
        // Close dialog
        onOpenChange(false);
      } else {
        // If image is already a URL, just update user profile
        await api.put(`/user/${user.id}`, { avatarUrl: image });
        onAvatarChange(image);
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError("Failed to upload avatar");
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
      
      {/* Error message displayed if upload fails */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Image editor component for cropping and adjusting avatar */}
      <div className="mb-4">
        <ImageResizer />
      </div>
      
      <DialogFooter>
        {/* Cancel button closes the dialog without saving */}
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        
        {/* Save button with loading state during upload */}
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

/**
 * ChangeAvatarDialog is the main exported component that wraps the dialog content
 * Provides ImageProvider context for image manipulation functionality
 * 
 * @param {ChangeAvatarDialogProps} props - Component props passed to dialog content
 */
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