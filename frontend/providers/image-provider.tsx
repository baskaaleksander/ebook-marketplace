'use client';
import { createContext, useContext, useState } from "react";

/**
 * Interface defining the image context shape
 * Contains the image state and function to update it
 */
interface ImageContextType {
  image: string | null;       // Current selected image data (URL or null if no image)
  setImage: React.Dispatch<React.SetStateAction<string | null>>;  // Function to update image state
}

/**
 * Create context for image management with null default value
 * Will be populated by the ImageProvider component
 */
const ImageContext = createContext<ImageContextType | null>(null);

/**
 * ImageProvider component manages global image state
 * Provides a way to share image data between components without prop drilling
 * Commonly used for product image previews, uploads, and temporary image storage
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to image context
 */
export function ImageProvider({ children } : { children: React.ReactNode }) {
    // Initialize image state as null (no image selected)
    const [image, setImage] = useState<string | null>(null);
    
    return (
        <ImageContext.Provider value={{ image, setImage }}>
            {children}
        </ImageContext.Provider>
    )
}

/**
 * Custom hook to access the image context
 * Provides strongly-typed access to image state and setter function
 * 
 * @returns {ImageContextType} Image context with state and setter function
 * @throws {Error} If used outside of an ImageProvider component
 */
export function useImage() {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error("useImage must be used within an ImageProvider");
    }
    return context;
}