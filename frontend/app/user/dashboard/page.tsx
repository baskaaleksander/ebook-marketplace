'use client'

import AnalyticsCards from "@/components/analytics-cards";
import BoughtProductsTable from "@/components/bought-products-table";
import SoldOrdersTable from "@/components/sold-orders-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalyticsData } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Dashboard() {

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ analyticsData, setAnalyticsData] = useState<AnalyticsData>();
  const [soldOrders, setSoldOrders] = useState([]);
  const [boughtOrders, setBoughtOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchData = async () => {
      try {
        const [ analyticsResponse, soldOrdersResponse, boughtOrdersResponse] = await Promise.all([
          api.get('/listing/analytics'),
          api.get('/stripe/orders/sold/'),
          api.get('/stripe/orders/')
        ]);
        setAnalyticsData(analyticsResponse.data);
        setSoldOrders(soldOrdersResponse.data);
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
  }, [user, authLoading]);


  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {loading && (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}
      {analyticsData && <AnalyticsCards data={analyticsData} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {soldOrders.length > 0 ? (
          <SoldOrdersTable orders={soldOrders} />
        ) : (
          <Card className="p-12 flex flex-col items-center justify-center mt-6">
            <h1 className="text-xl text-gray-500">No sold orders yet.</h1>
            <Button variant='outline' onClick={() => router.push('/product/create')}>Create your product now!</Button>
          </Card>
            )}
        {boughtOrders.length > 0 ? (
          <BoughtProductsTable orders={boughtOrders} />
        ) : (
          <Card className="p-12 flex flex-col items-center justify-center mt-6">
            <h1 className="text-xl text-gray-500">You haven't bought anything yet. Browse for products!</h1>
            <Button variant='outline' onClick={() => router.push('/products')}>All products</Button>
          </Card>
            )}

      </div>
    </div>
  );
}
export default Dashboard;