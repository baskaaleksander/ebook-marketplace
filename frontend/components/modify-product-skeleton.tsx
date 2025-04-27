import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

function ModifyProductSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Title Skeleton */}
      <div className="h-9 w-48 bg-gray-300 rounded"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Image Section */}
          <div>
            <div className="h-6 w-36 bg-gray-300 rounded mb-4"></div>
            <div className="aspect-square w-full bg-gray-200 rounded-md"></div>
          </div>
          
          {/* PDF Section */}
          <div>
            <div className="h-6 w-24 bg-gray-300 rounded mb-4"></div>
            <Card>
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right Column */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Title Field */}
                <div>
                  <div className="h-5 w-16 bg-gray-300 rounded mb-2"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                </div>
                
                {/* Description Field */}
                <div>
                  <div className="h-5 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-32 w-full bg-gray-200 rounded"></div>
                </div>
                
                {/* Price and Category Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <div className="h-5 w-14 bg-gray-300 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <div className="h-5 w-20 bg-gray-300 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                {/* Button */}
                <div className="h-10 w-full bg-gray-300 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ModifyProductSkeleton;