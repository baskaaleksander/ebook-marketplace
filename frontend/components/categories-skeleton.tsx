import ProductCardSkeleton from "./product-card-skeleton";

function CategoriesSkeleton() {
  // Create an array for categories
  const skeletonCategories = Array(3).fill(null);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-64 bg-gray-300 rounded animate-pulse mb-8"></div>
      
      {skeletonCategories.map((_, categoryIndex) => (
        <div key={categoryIndex} className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <div className="h-7 w-48 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, productIndex) => (
              <ProductCardSkeleton key={`${categoryIndex}-${productIndex}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoriesSkeleton;