'use client';

import ProductNotFound from "@/components/product-not-found";
import ProductPageCard from "@/components/product-page-card";
import ReviewComponent from "@/components/reviews-component";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import UserProducts from "@/components/user-products";
import { mockUserData, Product, UserData } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";

function ProductPage({ params }: { params: Promise<{ id: string }> }) {

  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product>();
  const [reviews, setReviews] = useState([]);
  const [seller, setSeller] = useState<UserData>(mockUserData);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const viewCounted = useRef(false);
  useEffect(() => {
    
    async function fetchData() {
      if (authLoading) return;
      if (viewCounted.current) return;
      
      try {
        setLoading(true);
        const productResponse = await api.get(`/listing/${productId}`);
        const [ sellerResponse, sellerProductsResponse, reviewsResponse ] = await Promise.all([
          api.get(`/user/id/${productResponse.data.sellerId}`),
          api.get(`/listing/user/${productResponse.data.sellerId}`),
          api.get(`/listing/${productId}/reviews`)
        ]);
        setSeller(sellerResponse.data);
        setSellerProducts(sellerProductsResponse.data);
        setProduct(productResponse.data);
        setReviews(reviewsResponse.data);
        
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
    
  }, [productId, authLoading]);

  if (loading) {
    return <div>Loading product information...</div>;
  }

  if (!product) {
    return <ProductNotFound />
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>

      )}
      
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

      <ProductPageCard product={product} seller={seller} />
      <ReviewComponent reviews={reviews} withProductLink={false}/>

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