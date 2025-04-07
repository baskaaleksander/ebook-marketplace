'use client';

import { Button } from "@/components/ui/button";
import { Product } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { use, useEffect, useState, useRef } from "react";

function ProductPage({ params }: { params: Promise<{ id: string }> }) {

  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const viewCounted = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (authLoading) return;
      if (viewCounted.current) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/listing/${productId}`);
        if (isMounted) {
          console.log("Product data:", response.data);
          
          if (response.data && response.data.sellerId) {
            try {
              const sellerResponse = await api.get(`/user/id/${response.data.sellerId}`);
              if (isMounted && sellerResponse.data) {
                response.data.seller = sellerResponse.data;
              }
            } catch (sellerErr) {
              console.error("Error fetching seller data:", sellerErr);
              response.data.seller = {
                name: 'Unknown',
                surname: 'Seller',
                rating: 'N/A',
                avatarUrl: null
              };
            }
          } else if (response.data && !response.data.seller) {
            response.data.seller = {
              name: 'Unknown',
              surname: 'Seller',
              rating: 'N/A',
              avatarUrl: null
            };
          }
          
          setProduct(response.data);
        }
        
        viewCounted.current = true;
        await api.post(`/listing/${productId}/view`);
      }
      catch (err) {
        console.error("Error fetching product:", err);
        if (isMounted) {
          setError('Failed to fetch product data');
        }
      }
      finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [productId, authLoading]);

  if (loading) {
    return <div>Loading product information...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <div className="bg-slate-100 p-8 flex items-center justify-center">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="max-w-full object-contain aspect-square" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 aspect-square">
                <img src="/file.svg" alt="Document" className="w-20 h-20 mb-4" />
                <p>E-book preview not available</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                    
          {/* Action Buttons */}
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
  );
}

export default ProductPage;