'use client';

import ProductNotFound from "@/components/product-not-found";
import { Button } from "@/components/ui/button";
import UserProducts from "@/components/user-products";
import { Product, UserData } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";

function ProductPage({ params }: { params: Promise<{ id: string }> }) {

  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product>();
  const [seller, setSeller] = useState<UserData>();
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
        const [ sellerResponse, sellerProductsResponse ] = await Promise.all([
          api.get(`/user/id/${productResponse.data.sellerId}`),
          api.get(`/listing/user/${productResponse.data.sellerId}`),
        ]);
        setSeller(sellerResponse.data);
        setSellerProducts(sellerProductsResponse.data);
        setProduct(productResponse.data);
        
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

  // to be splitted into a separate component
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <div className="bg-slate-100 p-8 ">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="max-w-full object-contain aspect-square" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 aspect-square h-full">
                <img src="/file.svg" alt="Document" className="w-20 h-20 mb-4" />
                <p>E-book preview not available</p>
              </div>
            )}
          </div>

          
        </div>

        <div className="flex flex-col h-full">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <div className="text-sm text-gray-600 mb-4">
              {seller && <Link href={`${seller.id}`} className="mb-1 hover:underline">{seller.name} {seller.surname}</Link> }
            </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{product.description}</p>
            
            {product.isFeatured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded mb-3">
                Featured Product
              </span>
            )}
          </div>
                    
          <div className="flex flex-col space-y-3 mt-auto">
            <Button className="font-bold py-3 px-4">
              Purchase for ${product.price?.toFixed(2)}
            </Button>
            <Button variant="outline">
              Add to Favorites
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">More from this seller</h2>
        {sellerProducts.length === 0 ? (
          <p className="text-gray-500 italic">No other products available from this seller.</p>
        ) : (
          seller && <UserProducts userData={seller} products={sellerProducts} />
        )}
      
      {user?.id === product.sellerId && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-800">You are the seller of this product</h3>
            <a 
              href={`/product/${product.id}/modify`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Edit Product
            </a>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default ProductPage;