'use client'

import AnalyticsCards from "@/components/analytics-cards";
import { AnalyticsData } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function Dashboard() {

  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>();

  useEffect(() => {
    if (!user || authLoading) return;

    const fetchData = async () => {
      try {
        const response = await api.get('/listing/analytics');
        setData(response.data);
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
      {data && <AnalyticsCards data={data} />}
      <div></div>
    </div>
  );
}
export default Dashboard;