'use client';

import { useAuth } from "@/providers/auth-provider";
import { Product } from "@/lib/definitions";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import ProductCard from "./product-card";

/**
 * LastViewed component displays a carousel of products the user has recently viewed
 * Only shown for authenticated users with viewing history
 * Conditionally renders based on data availability and authentication state
 */
function LastViewed() {
    // Get authenticated user data and auth loading state from context
    const { user, loading: authLoading } = useAuth();
    
    // State for component data and UI states
    const [loading, setLoading] = useState(true);          // Controls component loading state
    const [lastViewed, setLastViewed] = useState<Product[]>([]); // Stores recently viewed products
    const [error, setError] = useState<string | null>(null); // Tracks API errors

    /**
     * Effect to fetch last viewed products when authentication is resolved
     * Only makes API call if user is authenticated
     * Clears data if user is not authenticated
     */
    useEffect(() => {
        // Fetch data when user is authenticated and auth loading is complete
        if (user && !authLoading) {
            setLoading(true);
            setError(null);
            
            const fetchLastViewed = async () => {
                try {
                    // Get user's recently viewed products from API
                    const response = await api.get('/listing/viewed');
                    console.log("Last viewed products:", response.data);
                    setLastViewed(response.data.data);
                } catch (err) {
                    setError("failed to load last viewed products");
                    console.error("Error fetching last viewed products:", err);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchLastViewed();
        }
        
        // Clear data when user is not authenticated and auth loading is complete
        if (!user && !authLoading) {
            setLastViewed([]);
        }
        
        // Always set loading to false when auth state is determined
        setLoading(false);
    }, [user, authLoading]); // Re-run when auth state changes

    /**
     * Conditional rendering for loading state
     * Shows during both component data loading and auth loading
     */
    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
        );
    }

    /**
     * Conditional rendering for error state
     * Shows error message if API request fails
     */
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold text-red-500">{error}</h1>
            </div>
        );
    }
    
    /**
     * Hide component if user is not authenticated
     * No need to show "last viewed" section for anonymous users
     */
    if (!user && !authLoading) {
        return null;
    }

    /**
     * Hide component if user has no viewing history
     * Prevents showing an empty carousel
     */
    if (lastViewed.length === 0) {
        return null;
    }

    /**
     * Main component render with carousel of last viewed products
     * Only shown when data is available and user is authenticated
     */
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Section header */}
            <h2 className="text-2xl md:text-3xl font-bold hover:cursor-auto mb-8">👀 Last viewed</h2>

            {/* Carousel with navigation controls */}
            <Carousel>
                <CarouselContent>
                    {/* Map each product to a carousel item */}
                    {lastViewed.map((product) => (
                        <CarouselItem
                            key={product.id}
                            className="pl-1 md:basis-1/4"
                        >
                            {/* Product card with all relevant product data */}
                            <ProductCard
                                id={product.id}
                                title={product.title}
                                price={product.price}
                                imageUrl={product.imageUrl}
                                sellerId={product.sellerId}
                                createdAt={product.createdAt}
                                isFavorite={product.isFavourite || false}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                {/* Carousel navigation buttons */}
                <CarouselNext />
                <CarouselPrevious />
            </Carousel>
        </div>
    );
}

export default LastViewed;