'use client'

import AnalyticsCards from "@/components/analytics-cards";
import AnalyticsCardsSkeleton from "@/components/analytics-cards-skeleton";
import BoughtProductsTable from "@/components/bought-products-table";
import SoldOrdersTable from "@/components/sold-orders-table";
import TableSkeleton from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalyticsData } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Dashboard component provides an overview of user activity and key metrics
 * Displays analytics data, sold orders, and purchased products
 * Serves as the main landing page after user login
 */
function Dashboard() {
  // Get authenticated user data from context
  const { user, loading: authLoading } = useAuth();
  
  // State for dashboard data and UI states
  const [loading, setLoading] = useState(true); // Controls loading UI state
  const [error, setError] = useState<string | null>(null); // Tracks API errors
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(); // Performance metrics
  const [soldOrders, setSoldOrders] = useState([]); // Products the user has sold
  const [boughtOrders, setBoughtOrders] = useState([]); // Products the user has purchased
  
  // Router for navigation to other pages
  const router = useRouter();

  /**
   * Effect to fetch dashboard data when component mounts
   * Makes multiple parallel API calls for different data types
   * Only runs when user authentication is confirmed
   */
  useEffect(() => {
    // Skip fetching if user isn't authenticated yet
    if (!user || authLoading) return;

    const fetchData = async () => {
      try {
        // Make parallel API calls for better performance
        const [analyticsResponse, soldOrdersResponse, boughtOrdersResponse] = await Promise.all([
          api.get('/listing/analytics'),
          api.get('/stripe/orders/sold/'),
          api.get('/stripe/orders/')
        ]);
        
        // Update state with fetched data
        setAnalyticsData(analyticsResponse.data);
        setSoldOrders(soldOrdersResponse.data.data);
        setBoughtOrders(boughtOrdersResponse.data.data);
      }
      catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load data');
      }
      finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]); // Re-fetch when auth state changes

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      {/* Page header */}
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Display error message if API request failed */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {/* Conditional rendering based on loading state */}
      {loading ? (
        <>
          {/* Loading skeleton for analytics cards */}
          <AnalyticsCardsSkeleton />
          
          {/* Loading skeletons for order tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <div className="p-4">
                <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
                <TableSkeleton rowCount={3} columnCount={4} />
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
                <TableSkeleton rowCount={3} columnCount={4} />
              </div>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Analytics summary cards */}
          {analyticsData && <AnalyticsCards data={analyticsData} />}
          
          {/* Orders grid with sold and bought products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Sold orders section - shows table or empty state */}
            {soldOrders.length > 0 ? (
              <SoldOrdersTable orders={soldOrders} />
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center mt-6">
                <h1 className="text-xl text-gray-500">No sold orders yet.</h1>
                <Button variant='outline' onClick={() => router.push('/product/create')}>
                  Create your product now!
                </Button>
              </Card>
            )}
            
            {/* Bought orders section - shows table or empty state */}
            {boughtOrders.length > 0 ? (
              <BoughtProductsTable orders={boughtOrders} />
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center mt-6">
                <h1 className="text-xl text-gray-500">You haven&apos;t bought anything yet. Browse for products!</h1>
                <Button variant='outline' onClick={() => router.push('/products')}>
                  All products
                </Button>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;