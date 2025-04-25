import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import api from "@/utils/axios";
import { Metadata } from "next";
import Link from "next/link";
import { use } from "react";

export async function generateMetadata({ params }: {params: Promise<{ name: string}>}): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryNameParam = resolvedParams.name;

  const categoryName = decodeURIComponent(categoryNameParam);
    return {
      title: `${categoryName} category | bookify`,
      description: `${categoryName} category products | bookify`,
      openGraph: {
        title: `${categoryName} category | bookify`,
        description: `${categoryName} category products | bookify`,
      },
    };
  }



function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const categoryName = resolvedParams.name;


  
  let products: Product[] = [];
  let error: string | null = null;
  
  try {
    const fetchData = async () => {
    const category = categoryName.split('%20').shift();
    console.log(category);
    const response = await api.get(`/listing?category=${category}`);
    products = response.data.data.listings;
    }
    fetchData();
    
  } catch (err) {
    console.error(`Error fetching products for category ${categoryName}:`, err);
    error = 'Failed to load products';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">{decodeURIComponent(categoryName)} Products</h1>
        <Link href="/products/" className="text-blue-600 hover:underline text-sm">
          View all &rarr;
        </Link>
      </div>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <UserProducts
          products={products}
          emptyMessage={`No products found in the "${decodeURIComponent(categoryName)}" category`} 
        />
      )}
    </div>
  );
}

export default CategoryPage;