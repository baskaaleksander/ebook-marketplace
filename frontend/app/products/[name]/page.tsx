import UserProducts from "@/components/user-products";
import { Product } from "@/lib/definitions";
import api from "@/utils/axios";
import { Metadata } from "next";
import Link from "next/link";
import { use } from "react";

/**
 * Generate dynamic metadata for the category page based on the category name parameter.
 * This ensures proper SEO information is provided for each category page.
 * 
 * @param {Object} props - Component props
 * @param {Promise<{name: string}>} props.params - Promise containing the category name from URL params
 * @returns {Metadata} - Next.js Metadata object with title and description for the page
 */
export async function generateMetadata({ params }: {params: Promise<{ name: string}>}): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryNameParam = resolvedParams.name;

  // Decode the URL-encoded category name for display
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

/**
 * CategoryPage component displays all products belonging to a specific category.
 * It extracts the category name from URL parameters and fetches relevant products.
 *
 * @param {Object} props - Component props
 * @param {Promise<{name: string}>} props.params - Promise containing the category name from URL params
 */
function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  // Resolve the params Promise to get the category name
  const resolvedParams = use(params);
  const categoryName = resolvedParams.name;
  
  // Initialize products array and error state
  let products: Product[] = [];
  let error: string | null = null;
  
  try {
    /**
     * Fetch products filtered by the specified category
     * Note: This is using synchronous-like code in a Server Component, 
     * which works differently than useEffect in Client Components
     */
    const fetchData = async () => {
      // Extract the first part of the category name if it contains spaces
      const category = categoryName.split('%20').shift();
      console.log(category);
      
      // Make API request to get products in this category
      const response = await api.get(`/listing?category=${category}`);
      products = response.data.data.listings;
    }
    
    // Execute the fetch function immediately
    fetchData();
    
  } catch (err) {
    // Handle and log any errors during data fetching
    console.error(`Error fetching products for category ${categoryName}:`, err);
    error = 'Failed to load products';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header with category name and link to all products */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{decodeURIComponent(categoryName)} Products</h1>
        <Link href="/products/" className="text-blue-600 hover:underline text-sm">
          View all &rarr;
        </Link>
      </div>
      
      {/* Conditional rendering based on error state */}
      {error ? (
        // Display error message if data fetching failed
        <p className="text-red-500">Error: {error}</p>
      ) : (
        // Display products grid or empty state message
        <UserProducts
          products={products}
          emptyMessage={`No products found in the "${decodeURIComponent(categoryName)}" category`} 
        />
      )}
    </div>
  );
}

export default CategoryPage;