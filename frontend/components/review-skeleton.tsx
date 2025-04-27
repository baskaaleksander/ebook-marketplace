interface ReviewSkeletonProps {
  count?: number;
}

function ReviewSkeleton({ count = 3 }: ReviewSkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col p-4 border-b border-gray-300">
          <div className="flex items-start mb-2">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div className="flex flex-col">
              {/* Name skeleton */}
              <div className="h-5 w-32 bg-gray-300 rounded mb-1"></div>
              {/* Date skeleton */}
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Star rating skeleton */}
          <div className="flex gap-1 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
          
          {/* Comment skeleton */}
          <div className="space-y-2 mt-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex justify-end gap-2 mt-2">
            <div className="w-16 h-8 bg-gray-300 rounded"></div>
            <div className="w-16 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReviewSkeleton;