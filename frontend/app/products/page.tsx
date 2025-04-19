'use client'
import FilteringBar from "@/components/filtering-bar";
import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import { FilteringProvider, useFiltering } from "@/providers/filtering-provider"
import api from "@/utils/axios";
import { useEffect, useState } from "react";

function AllProducts() {

    const { filtering } = useFiltering();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                
                console.log('Fetching URL:', url);
                const response = await api.get(url);

                console.log('Response data:', response.data.data);
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
    return <UserProducts products={products} emptyMessage="No products found" />

}

export default function AllProductsPage() {
    return (
        <FilteringProvider>
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <FilteringBar />
                <AllProducts />
            </div>
        </FilteringProvider>
    )
}