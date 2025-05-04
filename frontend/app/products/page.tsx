'use client'
import FilteringBar from "@/components/filtering-bar";
import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import { FilteringProvider, useFiltering } from "@/providers/filtering-provider"
import api from "@/utils/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AllProducts() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { filtering, setFiltering } = useFiltering();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const query = searchParams.get('query') || '';
        const category = searchParams.get('category') || '';
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const sortBy = searchParams.get('sortBy') || '';
        const sortOrder = searchParams.get('sortOrder') || '';
        const featured = searchParams.get('featured') === 'true';
        
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
    
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (filtering.query) params.append('query', filtering.query);
        if (filtering.category) params.append('category', filtering.category);
        if (filtering.minPrice) params.append('minPrice', filtering.minPrice.toString());
        if (filtering.maxPrice) params.append('maxPrice', filtering.maxPrice.toString());
        if (filtering.sortBy) params.append('sortBy', filtering.sortBy);
        if (filtering.sortOrder) params.append('sortOrder', filtering.sortOrder);
        if (filtering.featured) params.append('featured', filtering.featured.toString());
        
        const queryString = params.toString();
        const url = queryString ? `/products?${queryString}` : '/products';
        
        router.replace(url, { scroll: false });
    }, [filtering, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                let url = '/listing/';
                const params = new URLSearchParams();
                
                if (filtering.query) params.append('query', filtering.query);
                if (filtering.category) params.append('category', filtering.category);
                if (filtering.minPrice) params.append('minPrice', filtering.minPrice.toString());
                if (filtering.maxPrice) params.append('maxPrice', filtering.maxPrice.toString());
                if (filtering.sortBy) params.append('sortBy', filtering.sortBy);
                if (filtering.sortOrder) params.append('sortOrder', filtering.sortOrder);
                if (filtering.featured) params.append('isFeatured', filtering.featured.toString());
                
                const queryString = params.toString();
                if (queryString) {
                    url += '?' + queryString;
                }
                
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
    }, [filtering]);
    
    if (error) {
        return <div className="text-red-500 text-center">{error}</div>
    }
    
    return <UserProducts products={products} emptyMessage="No products found" loading={loading} />
}

export default function AllProductsPage() {
    return (
        <Suspense>
            <FilteringProvider>
                <div className="container mx-auto px-4 py-8 min-h-screen">
                    
                    <FilteringBar />
                    <AllProducts />
                </div>
            </FilteringProvider>
        </Suspense>
    )
}