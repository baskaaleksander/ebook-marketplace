'use client';

import ProductNotFound from "@/components/product-not-found";
import ProductPageCard from "@/components/product-page-card";
import ReviewComponent from "@/components/reviews-component";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import UserProducts from "@/components/user-products";
import { mockUserData, Product, UserData } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";

/**
 * ProductPage component displays a complete product listing with details,
 * reviews, and additional products from the seller.
 * 
 * @param {Object} props - Component props
 * @param {Promise<{id: string}>} props.params - Promise containing the product ID from URL params
 */
function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Authentication context to check if current user is the seller
  const { user, loading: authLoading } = useAuth();
  
  // State for product information and related data
  const [product, setProduct] = useState<Product>(); // Current product details
  const [reviews, setReviews] = useState([]); // Product reviews
  const [seller, setSeller] = useState<UserData>(mockUserData); // Product seller info
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]); // Other products from same seller
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [error, setError] = useState<string | null>(null); // Error state for API failures
  
  // Extract and resolve product ID from the URL params
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  // Ref to track whether view has been counted to prevent duplicate counts
  const viewCounted = useRef(false);
  
  /**
   * Effect hook to fetch product data, seller info, and reviews
   * Also increments the product view count (only once per session)
   */
  useEffect(() => {
    async function fetchData() {
      // Skip fetching if auth is still loading or view already counted
      if (authLoading) return;
      if (viewCounted.current) return;
      
      try {
        setLoading(true);
        
        // Fetch product data first to get seller ID
        const productResponse = await api.get(`/listing/${productId}`);
        const productData = productResponse.data.data;

        // Fetch seller info, seller's other products, and reviews in parallel
        const [ sellerResponse, sellerProductsResponse, reviewsResponse ] = await Promise.all([
          api.get(`/user/${productData.sellerId}`),
          api.get(`/listing/user/${productData.sellerId}`),
          api.get(`/listing/${productId}/reviews`)
        ]);

        // Update state with fetched data
        setSeller(sellerResponse.data);
        setSellerProducts(sellerProductsResponse.data.data);
        setProduct(productResponse.data.data);
        setReviews(reviewsResponse.data);
        
        // Record view only once per component mount
        viewCounted.current = true;
        await api.post(`/listing/${productId}/view`);
      }
      catch (err) {
        console.error("Error fetching product:", err);
        setError('Failed to fetch product data');
      }
      finally {
        setLoading(false);
      }
    }

    fetchData();
    
  }, [productId, authLoading]); // Re-fetch if product ID or auth state changes

  // Show loading state while fetching data
  if (loading) {
    return <div>Loading product information...</div>;
  }

  // Show not found component if product doesn't exist
  if (!product) {
    return <ProductNotFound />
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Display error message if API calls failed */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {/* Show edit option alert if current user is the product seller */}
      {user?.id === product.sellerId && (
        <Alert className="mb-6">
          <AlertTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            You are the owner of this product
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-2">
            <span>Click here to edit your listing.</span>
            <Button variant="outline" asChild>
              <Link href={`/product/${product.id}/modify`}>Edit</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main product display component */}
      <ProductPageCard product={product} seller={seller} />
      
      {/* Product reviews section */}
      <ReviewComponent reviews={reviews} withProductLink={false}/>

      {/* Additional products from same seller section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">More from this seller</h2>
        {sellerProducts.length === 0 ? (
          <p className="text-gray-500 italic">No other products available from this seller.</p>
        ) : (
          seller && <UserProducts userData={seller} products={sellerProducts} />
        )}
      </div>
    </div>
  );
}

export default ProductPage;