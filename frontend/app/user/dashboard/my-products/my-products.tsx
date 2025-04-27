'use client';
import TableSkeleton from "@/components/table-skeleton";
import UserProductsTable from "@/components/user-products-table"
import { Product } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useEffect, useState } from "react";

function MyProducts() {

  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (authLoading) return;
      try {
        setLoading(true);
        const productsResponse = await api.get(`/listing/user/${user.id}`);
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
  }, [user.id, authLoading]);

  if (authLoading || loading) {
    return (
        <div className="p-4">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
            <TableSkeleton rowCount={3} columnCount={5} />
        </div>
    );
}

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }
  if (products.length === 0) {
    return <div className="container mx-auto px-4 py-8">You have no products listed yet.</div>;
  }
  return (
    <div>
      <UserProductsTable products={products} />
    </div>
  )
}

export default MyProducts