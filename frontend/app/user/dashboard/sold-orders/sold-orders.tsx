'use client'
import SoldOrdersTable from "@/components/sold-orders-table"
import TableSkeleton from "@/components/table-skeleton"
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
        return (
            <div className="p-4">
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
                <TableSkeleton rowCount={3} columnCount={5} />
            </div>
        );
    }
    
    return (
        <div className="p-4">
            {loading && <TableSkeleton rowCount={5} columnCount={5} />}
            {error && <div className="text-red-500 font-medium p-4 bg-red-50 rounded-md">{error}</div>}
            {!loading && !error && soldOrders.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-gray-500 font-medium">You have no sold orders yet.</p>
                </div>
            ) : (
                !loading && !error && <SoldOrdersTable orders={soldOrders}/>
            )}
        </div>
    );
}

export default SoldOrders