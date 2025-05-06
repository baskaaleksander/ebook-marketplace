'use client'
import SoldOrdersTable from "@/components/sold-orders-table"
import TableSkeleton from "@/components/table-skeleton"
import { Order } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * SoldOrders component displays all orders that have been sold by the current user
 * Requires Stripe verification and authentication to access
 * Shows order history in a table format with relevant details
 */
function SoldOrders() {
    // Get authenticated user data and auth loading state from context
    const { user, loading: authLoading } = useAuth();
    
    // State for sold orders data and UI states
    const [soldOrders, setSoldOrders] = useState<Order[]>([]); // Stores orders sold by the user
    const [loading, setLoading] = useState(true); // Controls data loading UI state
    const [error, setError] = useState<string | null>(null); // Tracks API errors
    
    // Router for navigation and redirects
    const router = useRouter();
    
    /**
     * Effect to check authentication, Stripe verification status, and fetch sold orders
     * Redirects to login if user is not authenticated
     * Redirects to wallet if user's Stripe account is not verified
     * Fetches sold orders data when conditions are met
     */
    useEffect(() => {
        // Redirect to login page if user is not authenticated
        if (!authLoading && user === null) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            // Skip fetching if authentication is in progress or user is not logged in
            if (authLoading || !user) return;
            
            // Redirect to wallet page if user's Stripe account is not verified
            // This prevents non-verified sellers from seeing sold orders
            if (user.stripeStatus !== 'verified') {
                router.push('/user/dashboard/wallet');
                return;
            }

            try {
                setLoading(true);
                // Fetch all orders sold by the current user
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
        <div className="p-4">
            {/* Show skeleton loader while data is being fetched */}
            {loading && <TableSkeleton rowCount={5} columnCount={5} />}
            
            {/* Display error message if API request failed */}
            {error && <div className="text-red-500 font-medium p-4 bg-red-50 rounded-md">{error}</div>}
            
            {/* Conditional rendering based on data availability */}
            {!loading && !error && soldOrders.length === 0 ? (
                // Show empty state message if no sold orders exist
                <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-gray-500 font-medium">You have no sold orders yet.</p>
                </div>
            ) : (
                // Show sold orders table when data is available and not in error state
                !loading && !error && <SoldOrdersTable orders={soldOrders}/>
            )}
        </div>
    );
}

export default SoldOrders