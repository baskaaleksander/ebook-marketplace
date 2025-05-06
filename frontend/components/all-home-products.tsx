'use client';

import Link from "next/link";
import ProductCard from "./product-card";
import CategoriesSkeleton from "./categories-skeleton";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Category } from "@/lib/definitions";

/**
 * AllHomeProducts component displays products organized by categories on the homepage
 * Fetches category data from the API and renders products in a grid layout
 * Includes loading states, error handling, and empty state displays
 */
function AllHomeProducts() {
  // State for category data and UI states
  const [categories, setCategories] = useState<Category[]>([]); // Stores all categories with their products
  const [loading, setLoading] = useState(true); // Controls loading UI state
  const [error, setError] = useState<string | null>(null); // Tracks API errors
  
  /**
   * Effect to fetch categories and their products when component mounts
   * Makes API call to get all product categories with associated products
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories with their associated products
        const response = await api.get("/listing/categories");
        setCategories(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []); // Empty dependency array ensures this runs once on component mount
  
  // Show skeleton loader while data is being fetched
  if (loading) {
    return <CategoriesSkeleton />;
  }
  
  // Display error message if API request failed
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header with title and "View all" link */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/featured">
          <h2 className="text-2xl md:text-3xl font-bold">📚 Categories</h2>
        </Link>
        <Link href="/products/" className="text-blue-600 hover:underline text-sm">
          View all &rarr;
        </Link>
      </div>

      {/* Render each category with its products */}
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          {/* Category header with name and link to category page */}
          <div className="flex justify-between items-center mb-4">
            <Link href={`/products/${encodeURIComponent(category.name)}`}>
              <h2 className="text-2xl font-semibold">{category.name}</h2>
            </Link>
          </div>
          
          {/* Conditional rendering based on product availability */}
          {category.products.length === 0 ? (
            // Empty state message when category has no products
            <p className="text-gray-500 italic">No products available in this category yet.</p>
          ) : (
            // Responsive grid of product cards
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
              {category.products.map((product) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  sellerId={product.sellerId}
                  imageUrl={product.imageUrl}
                  isFavorite={product.isFavourite || false}
                  createdAt={product.createdAt || new Date().toISOString()}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AllHomeProducts;