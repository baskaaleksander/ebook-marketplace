'use client'

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import Link from "next/link";
import FavoriteButton from "./favorite-button";
import placeholder from "@/public/placeholder.jpg";

/**
 * Interface for ProductCard component props
 * Defines all possible properties that can be passed to the component
 */
interface ProductCardProps {
    id: string;                   // Unique identifier for the product
    title: string;                // Product title to display
    price: number;                // Product price in PLN
    sellerId: string;             // ID of the seller who created the product
    imageUrl?: string;            // Optional URL for the product image
    createdAt: string;            // Product creation date
    isFavorite?: boolean;         // Whether the product is marked as favorite by the current user
    className?: string;           // Optional additional CSS classes
    sellerData?: {                // Optional pre-loaded seller information
        id: string;
        name: string;
        surname: string;
    };
}

/**
 * ProductCard component displays a single product in a card format
 * Shows product image, title, price, and seller information
 * Includes a favorite button and links to product and seller pages
 * Lazily loads seller data if not provided as a prop
 * 
 * @param {ProductCardProps} props - Component properties
 */
function ProductCard({
    id,
    title,
    price,
    sellerId,
    imageUrl,
    isFavorite = false,
    sellerData,
}: ProductCardProps) {
    // State for seller information
    const [seller, setSeller] = useState(sellerData);  // Stores seller data, initialized with prop if available
    const [loading, setLoading] = useState(!sellerData); // Loading state, true if seller data needs to be fetched

    /**
     * Effect to fetch seller information if not provided via props
     * Makes API call to get seller data by ID
     * Updates loading state when operation completes
     */
    useEffect(() => {
        if (!sellerData) {
            const fetchSeller = async () => {
                try {
                    // Request seller data from API
                    const response = await api.get(`/user/${sellerId}`);
                    setSeller(response.data);
                } catch (error) {
                    console.error("Error fetching seller data:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchSeller();
        }
    }, [sellerId, sellerData]); // Re-run if sellerId or sellerData props change
    
    return (
        <div className="flex-1 flex flex-col p-4">
            {/* Product image container with favorite button overlay */}
            <div className="overflow-hidden rounded-md mb-4 relative">
                {/* Favorite button positioned at top-right corner */}
                <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton productId={id} initialIsFavorite={isFavorite} />
                </div>
                
                {/* Product image with link to product detail page */}
                <Link href={`/product/${id}`}>
                    <img
                        src={imageUrl || placeholder.src} // Use placeholder if no image URL provided
                        alt={title}
                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                        loading="lazy" // Lazy loading for performance
                        style={{ aspectRatio: '1/1' }} // Maintain square aspect ratio
                    />
                </Link>
            </div>
            
            {/* Product details container */}
            <div className="mt-auto">
                {/* Price display */}
                <div className="flex justify-between items-baseline mb-3">
                    <p className="text-gray-500 font-medium">{price.toFixed(2)}PLN</p>
                </div>
                
                {/* Product title with link to detail page */}
                <Link href={`/product/${id}`}>
                    <div className="mb-2">
                        <h2 className="line-clamp-1 text-base sm:text-lg font-medium hover:underline">
                            {title}
                        </h2>
                    </div>
                </Link>
                
                {/* Seller information - conditionally rendered when available */}
                {!loading && seller && (
                    <Link 
                        href={`/user/${seller.id}`}
                        className="text-xs sm:text-sm text-gray-400 hover:text-gray-700 hover:underline block mb-4"
                    >
                        {seller.name} {seller.surname}
                    </Link>
                )}
            </div>
        </div>
    );
}

export default ProductCard;