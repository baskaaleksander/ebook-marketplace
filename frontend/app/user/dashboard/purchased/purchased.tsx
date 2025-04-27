'use client'
import BoughtProductsTable from "@/components/bought-products-table";
import TableSkeleton from "@/components/table-skeleton";
import { Order } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { Table } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Purchased() {

    const { user, loading: authLoading } = useAuth();
    const [soldOrders, setSoldOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        const fetchData = async () => {
            if (authLoading || !user || user.stripeStatus !== 'verified') return;

            try {
                setLoading(true);
                const soldOrdersResponse = await api.get(`/stripe/orders/`);
                console.log('Sold Orders Response:', soldOrdersResponse.data);
                setSoldOrders(soldOrdersResponse.data.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load sold orders');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, router, authLoading]);

    if (authLoading) {
        return (
            <div className="p-4">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
                <TableSkeleton rowCount={3} columnCount={5} />
            </div>
        );
    }

  return (
    <div>
        {loading && <TableSkeleton rowCount={5} columnCount={5} />}
        {error && <div className="text-red-500">{error}</div>}
        {soldOrders.length === 0 ? <div>You have no bought orders yet.</div> : <BoughtProductsTable orders={soldOrders}/>}
        
    </div>
  )
}

export default Purchased