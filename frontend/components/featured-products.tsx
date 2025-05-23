'use client';
import Link from "next/link";
import ProductCard from "./product-card";
import ProductCardSkeleton from "./product-card-skeleton";
import api from "@/utils/axios";
import { Product } from "@/lib/definitions";
import { useState, useEffect } from "react";

/**
 * FeaturedProducts component displays a curated list of highlighted products
 * Shows a small selection of featured items on the homepage with a link to view all
 * Includes loading states and empty state handling
 */
function FeaturedProducts() {
    // State for featured products data and loading state
    const [featured, setFeatured] = useState<Product[]>(); // Stores featured products from API
    const [loading, setLoading] = useState(true); // Controls loading UI state

    /**
     * Effect to fetch featured products when component mounts
     * Makes API call to get a limited number of highlighted products
     */
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Request featured products with a limit of 4 items
                const response = await api.get('/listing/featured?limit=4');
                setFeatured(response.data.data);
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchFeatured();
    }, []);

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                {/* Header with section title and "View all" link */}
                <div className="flex justify-between items-center mb-8">
                    <Link href="/products?featured=true"><h2 className="text-2xl md:text-3xl font-bold">⭐ Featured Books</h2></Link>
                    <Link href="/products?featured=true" className="text-blue-600 hover:underline text-sm">
                        View all &rarr;
                    </Link>
                </div>
                
                {/* Responsive grid layout for products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Conditional rendering based on loading state and data availability */}
                {loading ? (
                    // Show skeleton placeholders while loading
                    Array.from({ length: 4 }).map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))
                ) : featured && featured.length > 0 ? (
                    // Show actual products when data is loaded and available
                    featured.map((product: Product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            price={product.price}
                            sellerId={product.sellerId}
                            createdAt={product.createdAt}
                            imageUrl={product.imageUrl}
                        />
                    ))
                ) : (
                    // Show empty state message when no featured products exist
                    <p className="text-gray-500 col-span-full text-center py-4">No featured products found...</p>
                )}
                </div>
            </div>
        </section>
    )
}

export default FeaturedProducts;