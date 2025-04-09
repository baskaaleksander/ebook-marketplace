'use client';
import { createContext, useContext, useState } from "react";

const ImageContext = createContext<any | null>(null);

export function ImageProvider({ children } : { children: React.ReactNode }) {

    const [image, setImage] = useState<string | null>(null);
    return (
        <ImageContext.Provider value={{ image, setImage }}>
            {children}
        </ImageContext.Provider>
    )
}

export function useImage() {
    const context = useContext(ImageContext);
    if (!context) {
        throw new Error("useImage must be used within an ImageProvider");
    }
    return context;
}