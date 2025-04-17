'use client';

import Link from "next/link";
import ProductCard from "./product-card";
import CategoriesSkeleton from "./categories-skeleton";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Category } from "@/lib/definitions";

function AllHomeProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/listing/categories");
        setCategories(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  if (loading) {
    return <CategoriesSkeleton />;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link href="/featured">
          <h2 className="text-2xl md:text-3xl font-bold">📚 Categories</h2>
        </Link>
        <Link href="/products/" className="text-blue-600 hover:underline text-sm">
          View all &rarr;
        </Link>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/products/${encodeURIComponent(category.name)}`}>
              <h2 className="text-2xl font-semibold">{category.name}</h2>
            </Link>
          </div>
          
          {category.products.length === 0 ? (
            <p className="text-gray-500 italic">No products available in this category yet.</p>
          ) : (
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