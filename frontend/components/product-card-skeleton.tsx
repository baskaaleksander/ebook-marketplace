import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <Card 
      className={cn(
        "h-full relative flex flex-col",
        className
      )}
    >            
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex flex-col">
          <div className="aspect-[3/4] overflow-hidden rounded-md mb-4 relative bg-gray-200 animate-pulse">
            <div className="absolute top-2 right-2 z-10">
              <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex justify-between items-baseline mb-3">
              <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
            </div>
            
            <div className="mb-2">
              <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>
            
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>

            <div className="w-full h-9 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCardSkeleton;