import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function WalletSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Page Title */}
      <div className="h-9 w-32 bg-gray-300 rounded mb-6"></div>
      
      {/* Balance Card */}
      <Card className="mb-8">
        <div className="p-6">
          {/* Balance title */}
          <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
          
          {/* Balance amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Available balance */}
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
            
            {/* Pending balance */}
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Payout button */}
          <div className="h-10 w-40 bg-gray-300 rounded mt-4"></div>
        </div>
      </Card>
      
      {/* Tabs */}
      <div className="w-full">
        <div className="border-b mb-4">
          <div className="flex space-x-4">
            <div className="h-10 w-20 bg-gray-300 rounded"></div>
            <div className="h-10 w-20 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Table header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-4 gap-4 px-4 py-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`header-${i}`} className="h-6 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Table rows */}
            <div className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4 px-4 py-4">
                  {Array.from({ length: 4 }).map((_, colIndex) => (
                    <div 
                      key={`cell-${rowIndex}-${colIndex}`} 
                      className="h-5 bg-gray-200 rounded"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletSkeleton;