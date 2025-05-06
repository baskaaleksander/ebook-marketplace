'use client'
import FilteringBar from "@/components/filtering-bar";
import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import { FilteringProvider, useFiltering } from "@/providers/filtering-provider"
import api from "@/utils/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/**
 * AllProducts component handles the product listing functionality with filtering
 * It manages product data fetching, filter state synchronization with URL parameters,
 * and renders the filtered product grid
 */
function AllProducts() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { filtering, setFiltering } = useFiltering();

    // State management for products data and loading/error states
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    /**
     * Effect to synchronize URL query parameters with filtering state
     * This runs when the URL parameters change, updating the filtering context
     */
    useEffect(() => {
        // Extract all filter parameters from URL query string
        const query = searchParams.get('query') || '';
        const category = searchParams.get('category') || '';
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const sortBy = searchParams.get('sortBy') || '';
        const sortOrder = searchParams.get('sortOrder') || '';
        const featured = searchParams.get('featured') === 'true';
        
        // Update filtering state with values from URL
        setFiltering({
            query,
            category,
            minPrice,
            maxPrice,
            sortBy: sortBy as 'title' | 'price' | 'createdAt' | 'rating' | 'views',
            sortOrder,
            featured
        });
    }, [searchParams, setFiltering]);
    
    /**
     * Effect to update URL based on filtering state changes
     * This maintains URL-state synchronization when filters are changed
     * Uses replace instead of push to avoid creating extra history entries
     */
    useEffect(() => {
        const params = new URLSearchParams();
        
        // Only add parameters that have values to keep URL clean
        if (filtering.query) params.append('query', filtering.query);
        if (filtering.category) params.append('category', filtering.category);
        if (filtering.minPrice) params.append('minPrice', filtering.minPrice.toString());
        if (filtering.maxPrice) params.append('maxPrice', filtering.maxPrice.toString());
        if (filtering.sortBy) params.append('sortBy', filtering.sortBy);
        if (filtering.sortOrder) params.append('sortOrder', filtering.sortOrder);
        if (filtering.featured) params.append('featured', filtering.featured.toString());
        
        // Build and update URL with current filter state
        const queryString = params.toString();
        const url = queryString ? `/products?${queryString}` : '/products';
        
        router.replace(url, { scroll: false }); // Update URL without scrolling
    }, [filtering, router]);

    /**
     * Effect to fetch filtered products when filtering state changes
     * Constructs API URL with query parameters based on current filters
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Construct API URL with filtering parameters
                let url = '/listing/';
                const params = new URLSearchParams();
                
                // Add all active filters to query parameters
                if (filtering.query) params.append('query', filtering.query);
                if (filtering.category) params.append('category', filtering.category);
                if (filtering.minPrice) params.append('minPrice', filtering.minPrice.toString());
                if (filtering.maxPrice) params.append('maxPrice', filtering.maxPrice.toString());
                if (filtering.sortBy) params.append('sortBy', filtering.sortBy);
                if (filtering.sortOrder) params.append('sortOrder', filtering.sortOrder);
                if (filtering.featured) params.append('isFeatured', filtering.featured.toString());
                
                // Append query string to base URL if parameters exist
                const queryString = params.toString();
                if (queryString) {
                    url += '?' + queryString;
                }
                
                // Make API request and update products state with response
                const response = await api.get(url);
                setProducts(response.data.data.listings);
            }
            catch(err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
            }
            finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [filtering]); // Re-fetch when filtering changes
    
    // Show error message if data fetching failed
    if (error) {
        return <div className="text-red-500 text-center">{error}</div>
    }
    
    // Render products grid with current products and loading state
    return <UserProducts 
        products={products} 
        emptyMessage="No products found" 
        loading={loading} 
    />
}

/**
 * Main page component that wraps AllProducts in necessary providers
 * Uses Suspense for better loading behavior with streaming SSR
 */
export default function AllProductsPage() {
    return (
        <Suspense>
            <FilteringProvider>
                <div className="container mx-auto px-4 py-8 min-h-screen">
                    {/* Filtering UI controls */}
                    <FilteringBar />
                    {/* Products grid with filtering applied */}
                    <AllProducts />
                </div>
            </FilteringProvider>
        </Suspense>
    )
}