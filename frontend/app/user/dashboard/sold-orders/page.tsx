'use client'
import SoldOrdersTable from "@/components/sold-orders-table"
import { Order } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function SoldOrders() {

    const { user, loading: authLoading } = useAuth();
    const [soldOrders, setSoldOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    
    useEffect(() => {

        if (!authLoading && user === null) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            if (authLoading || !user) return;
            
            if (user.stripeStatus !== 'verified') {
                router.push('/user/dashboard/wallet');
                return;
            }

            try {
                setLoading(true);
                const soldOrdersResponse = await api.get(`/stripe/orders/sold/`);
                setSoldOrders(soldOrdersResponse.data.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load sold orders');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user, router, authLoading]);
    
    if (authLoading) {
        return <div>Checking authentication...</div>;
    }
    
    return (
        <div>
            {loading && <div>Loading sold orders...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {soldOrders.length === 0 ? <div>You have no sold orders yet.</div> : <SoldOrdersTable orders={soldOrders}/>}
        </div>
    );
}

export default SoldOrders