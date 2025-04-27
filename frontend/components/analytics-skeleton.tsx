import AnalyticsCardsSkeleton from "./analytics-cards-skeleton";
import { Card } from "./ui/card";

function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen animate-pulse">
      {/* Page Title */}
      <div className="h-9 w-36 bg-gray-300 rounded mb-6"></div>
      
      {/* Analytics Cards */}
      <AnalyticsCardsSkeleton />
      
      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Sales Chart */}
        <Card className="p-4">
          <div className="h-6 w-36 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 w-full bg-gray-100 rounded flex flex-col justify-end p-4">
            {/* Bar chart skeleton */}
            <div className="flex items-end justify-around h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={`bar-${i}`} 
                  className="w-6 bg-gray-300 rounded-t"
                  style={{ height: `${15 + Math.random() * 70}%` }}
                ></div>
              ))}
            </div>
            {/* X-axis line */}
            <div className="h-px w-full bg-gray-300 mt-2"></div>
          </div>
        </Card>
        
        {/* Views per Product Chart */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-64 bg-gray-300 rounded"></div>
            <div className="h-4 w-28 bg-gray-300 rounded"></div>
          </div>
          <div className="h-64 w-full bg-gray-100 rounded flex flex-col justify-end p-4">
            {/* Bar chart skeleton */}
            <div className="flex items-end justify-around h-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={`view-bar-${i}`} 
                  className="w-6 bg-gray-300 rounded-t"
                  style={{ height: `${20 + Math.random() * 65}%` }}
                ></div>
              ))}
            </div>
            {/* X-axis line */}
            <div className="h-px w-full bg-gray-300 mt-2"></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsSkeleton;