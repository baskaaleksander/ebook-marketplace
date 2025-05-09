'use client'
import BoughtProductsTable from "@/components/bought-products-table";
import TableSkeleton from "@/components/table-skeleton";
import { Order } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Purchased component displays all products that the current user has bought
 * It fetches the user's purchase history and displays them in a table format
 */
function Purchased() {
    // Get authenticated user data and auth loading state from context
    const { user, loading: authLoading } = useAuth();
    
    // State for purchased orders data and UI states
    const [boughtOrders, setBoughtOrders] = useState<Order[]>([]); // Stores user's purchase history
    const [loading, setLoading] = useState(true); // Controls data loading UI state
    const [error, setError] = useState<string | null>(null); // Tracks API errors
    
    // Router for navigation if user is not authenticated
    const router = useRouter();
    
    /**
     * Effect to check authentication and fetch user's purchase history
     * Redirects to login if user is not authenticated
     * Fetches purchase data when authentication is confirmed
     */
    useEffect(() => {
        // Redirect to login page if user is not authenticated
        if (!authLoading && !user) {
            router.push('/login');
        }

        const fetchData = async () => {
            // Skip fetching if authentication is in progress or user is not logged in
            if (authLoading || !user) return;

            try {
                setLoading(true);
                // Fetch all orders purchased by the current user
                const soldOrdersResponse = await api.get(`/stripe/orders/`);
                setBoughtOrders(soldOrdersResponse.data.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load sold orders');
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [user, router, authLoading]); // Re-fetch when auth state or user changes

    // Show skeleton loader while authentication is in progress
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
        {/* Show skeleton loader while data is being fetched */}
        {loading && <TableSkeleton rowCount={5} columnCount={5} />}
        
        {/* Display error message if API request failed */}
        {error && <div className="text-red-500">{error}</div>}
        
        {/* Show empty state message or purchase history table based on data */}
        {boughtOrders.length === 0 ? 
            <div>You have no bought orders yet.</div> : 
            <BoughtProductsTable orders={boughtOrders}/>
        }
    </div>
  )
}

export default Purchased