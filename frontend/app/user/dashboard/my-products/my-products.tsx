'use client';
import TableSkeleton from "@/components/table-skeleton";
import UserProductsTable from "@/components/user-products-table"
import { Product } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useEffect, useState } from "react";

/**
 * MyProducts component displays a table of all products owned by the current user
 * Used in the seller dashboard to manage and view product listings
 */
function MyProducts() {
  // Get authenticated user data from context
  const { user, loading: authLoading } = useAuth();
  
  // State for product data and loading/error states
  const [products, setProducts] = useState<Product[]>([]); // Stores user's product listings
  const [loading, setLoading] = useState(true); // Controls loading UI state
  const [error, setError] = useState<string | null>(null); // Tracks API errors

  /**
   * Effect to fetch user's products when component mounts
   * Only runs when user authentication is confirmed
   */
  useEffect(() => {
    async function fetchData() {
      // Skip fetching if user authentication is still loading
      if (authLoading) return;
      
      try {
        setLoading(true);
        
        // Fetch products belonging to the current user
        const productsResponse = await api.get(`/listing/user/${user.id}`);
        
        // Handle empty product list explicitly
        if (productsResponse.data.data.length === 0) {
          setProducts([]);
        } else {
          setProducts(productsResponse.data.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products');
      }
      finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user.id, authLoading]); // Re-fetch when user ID or auth state changes

  // Show skeleton loader while authentication or data is loading
  if (authLoading || loading) {
    return (
        <div className="p-4">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
            <TableSkeleton rowCount={3} columnCount={5} />
        </div>
    );
  }

  // Show error message if API request failed
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }
  
  // Show empty state message if user has no products
  if (products.length === 0) {
    return <div className="container mx-auto px-4 py-8">You have no products listed yet.</div>;
  }
  
  // Render products table when data is available
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Products</h1>
      <UserProductsTable products={products} />
    </div>
  )
}

export default MyProducts