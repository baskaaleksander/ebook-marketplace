import Link from "next/link";
import ProductCard from "./product-card";
import CategoriesSkeleton from "./categories-skeleton";
import { Suspense } from "react";
import api from "@/utils/axios";

interface Seller {
  id: string;
  name: string;
  surname: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  sellerId: string;
  isFeatured: boolean;
  seller: Seller;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

async function CategoriesContent() {
  let categories: Category[] = [];
  let error = null;
  
  try {
    const response = await api.get("/listing/categories");
    categories = response.data;
  } catch (err) {
    console.error("Error fetching products:", err);
    error = "Failed to load products. Please try again later.";
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📚 Categories</h1>
      
      {categories.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/products/${encodeURIComponent(category.name)}`}><h2 className="text-2xl font-semibold">{category.name}</h2></Link>
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

export default function HomeProducts() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}