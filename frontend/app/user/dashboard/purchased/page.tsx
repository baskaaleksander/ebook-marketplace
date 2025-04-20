'use client'
import BoughtProductsTable from "@/components/bought-products-table";
import SoldOrdersTable from "@/components/sold-orders-table"
import { Order } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
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
  return (
    <div>
        {loading && <div>Loading bought orders...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {soldOrders.length === 0 ? <div>You have no bought orders yet.</div> : <BoughtProductsTable orders={soldOrders}/>}
        
    </div>
  )
}

export default Purchased