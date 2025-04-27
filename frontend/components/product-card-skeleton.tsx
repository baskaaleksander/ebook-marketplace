import { Card } from "./ui/card";
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
      <div className="flex-1 flex flex-col p-4">
        <div className="overflow-hidden rounded-md mb-4 relative">
          {/* Favorite button placeholder */}
          <div className="absolute top-2 right-2 z-10">
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
          </div>
          
          {/* Image placeholder */}
          <div 
            className="w-full h-full bg-gray-200 animate-pulse"
            style={{ aspectRatio: '1/1' }}
          ></div>
        </div>
        
        <div className="mt-auto">
          {/* Price placeholder */}
          <div className="flex justify-between items-baseline mb-3">
            <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
          </div>
          
          {/* Title placeholder */}
          <div className="mb-2">
            <div className="h-6 w-full bg-gray-300 rounded animate-pulse"></div>
          </div>
          
          {/* Author/seller placeholder */}
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
      </div>
    </Card>
  );
}

export default ProductCardSkeleton;