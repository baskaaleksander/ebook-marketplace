'use client';

import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useEffect, useState } from "react";
import { chartConfig } from "./chart-config";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Loader2 } from "lucide-react";
import { AnalyticsData, MonthlySalesData, ProductViewData } from "@/lib/definitions";
import Link from "next/link";
import AnalyticsCards from "@/components/analytics-cards";

function Analytics() {
  const {user, loading: authLoading} = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if(!user || authLoading) return;

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-800">
          <h2 className="text-lg font-semibold">No Data</h2>
          <p>No analytics data is available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <AnalyticsCards data={data} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SoldOrdersChart data={data.soldOrdersPerMonthResult} />
        <ViewsPerProductChart data={data.viewsPerProductResult} />
      </div>
    </div>
  )
}

function SoldOrdersChart({data}: {data: MonthlySalesData[]}) {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>
      <ChartContainer config={chartConfig}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => {
              return value.length > 10 ? value.slice(0, 10) + "..." : value;
            }}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="monthlySold" fill={chartConfig.views.color} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}

function ViewsPerProductChart({data}: {data: ProductViewData[]}) {

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4">Views per product (Top 10)</h2>
        <Link href='/user/dashboard/my-products' className="text-gray-500">View all products &rarr;</Link>
      </div>
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickFormatter={(value) => {
            return value.length > 10 ? value.slice(0, 10) + "..." : value;
          }}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="views" fill={chartConfig.views.color}/>
      </BarChart>
    </ChartContainer>
  </Card>
  )
}

export default Analytics