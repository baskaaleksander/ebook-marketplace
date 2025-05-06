'use client';

import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useEffect, useState } from "react";
import { chartConfig } from "./chart-config";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { AnalyticsData, MonthlySalesData, ProductViewData } from "@/lib/definitions";
import Link from "next/link";
import AnalyticsCards from "@/components/analytics-cards";
import AnalyticsSkeleton from "@/components/analytics-skeleton";

/**
 * Analytics component displays seller performance data and visualizations
 * Includes summary cards and charts for sales and product views
 */
function Analytics() {
  // Get authenticated user data from context
  const {user, loading: authLoading} = useAuth();
  
  // State management for data fetching process
  const [loading, setLoading] = useState(true); // Controls loading UI state
  const [error, setError] = useState<string | null>(null); // Tracks API errors
  const [data, setData] = useState<AnalyticsData | null>(null); // Stores analytics data

  /**
   * Effect to fetch analytics data when component mounts
   * Only runs when user authentication is confirmed
   */
  useEffect(() => {
    // Skip data fetching if user isn't authenticated yet
    if(!user || authLoading) return;

    const fetchData = async () => {
      try {
        // Get analytics data from API
        const response = await api.get('/listing/analytics');
        setData(response.data);
      }
      catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load analytics data');
      }
      finally {
        // Add small delay to prevent layout shifts during skeleton-to-data transition
        setTimeout(() => setLoading(false), 1500);
      }
    }

    fetchData();
  }, [user, authLoading]); // Re-fetch when auth state changes

  // Show skeleton UI while loading data
  if (loading) {
    return <AnalyticsSkeleton />;
  }

  // Display error message if API request failed
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

  // Display message when no data is available
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

  // Render analytics dashboard with data
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      {/* Summary cards for key performance metrics */}
      <AnalyticsCards data={data} />
      
      {/* Charts grid with monthly sales and product views */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SoldOrdersChart data={data.soldOrdersPerMonthResult} />
        <ViewsPerProductChart data={data.viewsPerProductResult} />
      </div>
    </div>
  )
}

/**
 * SoldOrdersChart component visualizes monthly sales data
 * Displays a bar chart showing number of orders completed per month
 * 
 * @param {Object} props - Component props
 * @param {MonthlySalesData[]} props.data - Array of monthly sales data points
 */
function SoldOrdersChart({data}: {data: MonthlySalesData[]}) {
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>
      <ChartContainer config={chartConfig}>
        <BarChart data={data}>
          {/* Grid lines for better readability */}
          <CartesianGrid vertical={false} />
          
          {/* X-axis with month labels, truncated if too long */}
          <XAxis
            dataKey="month"
            tickFormatter={(value) => {
              return value.length > 10 ? value.slice(0, 10) + "..." : value;
            }}
            tickLine={false}
            axisLine={false}
          />
          
          {/* Tooltip shows exact values on hover */}
          <ChartTooltip content={<ChartTooltipContent />} />
          
          {/* Bar visualization of monthly sales data */}
          <Bar dataKey="monthlySold" fill={chartConfig.views.color} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}

/**
 * ViewsPerProductChart component visualizes product view statistics
 * Shows a bar chart of the top 10 most viewed products
 * 
 * @param {Object} props - Component props
 * @param {ProductViewData[]} props.data - Array of product view data points
 */
function ViewsPerProductChart({data}: {data: ProductViewData[]}) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4">Views per product (Top 10)</h2>
        {/* Link to full products list for detailed view */}
        <Link href='/user/dashboard/my-products' className="text-gray-500">View all products &rarr;</Link>
      </div>
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        {/* Grid lines for better readability */}
        <CartesianGrid vertical={false} />
        
        {/* X-axis with product names, truncated if too long */}
        <XAxis
          dataKey="name"
          tickFormatter={(value) => {
            return value.length > 10 ? value.slice(0, 10) + "..." : value;
          }}
          tickLine={false}
          axisLine={false}
        />
        
        {/* Tooltip shows exact values on hover */}
        <ChartTooltip content={<ChartTooltipContent />} />
        
        {/* Bar visualization of views per product */}
        <Bar dataKey="views" fill={chartConfig.views.color}/>
      </BarChart>
    </ChartContainer>
  </Card>
  )
}

export default Analytics