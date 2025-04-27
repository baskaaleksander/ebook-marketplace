import { Skeleton } from "./ui/skeleton";

function UserHeadingSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          {/* Avatar skeleton */}
          <div className="w-16 h-16 rounded-full bg-gray-300 mr-4"></div>
          
          <div className="flex flex-col items-start w-full">
            {/* Name skeleton */}
            <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
            
            {/* Rating skeleton */}
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
              ))}
              <div className="w-10 h-4 bg-gray-200 rounded ml-1"></div>
            </div>
            
            {/* Description skeleton */}
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
            
            {/* Email skeleton */}
            <div className="h-4 w-40 bg-gray-200 rounded mt-4"></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start">
        <div className="flex w-full justify-between items-center">
          {/* Member since skeleton */}
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
          
          {/* Button skeleton */}
          <div className="w-24 h-9 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default UserHeadingSkeleton;