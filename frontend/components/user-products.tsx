import { Product, UserData } from "@/lib/definitions";
import ProductCard from "./product-card";
import ProductCardSkeleton from "./product-card-skeleton";

/**
 * UserProducts component displays a responsive grid of product cards
 * Handles loading, empty states, and product data rendering
 * 
 * @param {Object} props - Component props
 * @param {UserData} [props.userData] - Optional user data for the product seller
 * @param {Product[]} props.products - Array of products to display
 * @param {string} [props.emptyMessage] - Custom message to display when no products are available
 * @param {boolean} [props.loading] - Whether products are still being loaded
 */
function UserProducts({ userData, products, emptyMessage, loading }: { userData?: UserData; products: Product[], emptyMessage?: string, loading?: boolean }) {
    /**
     * Render loading skeleton placeholder cards while data is loading
     * Creates a grid of placeholder cards to maintain UI consistency
     */
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Generate an array of placeholder skeletons */}
                {Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    /**
     * Conditional rendering based on products availability
     * Shows empty message if no products, otherwise renders product grid
     */
    return products.length === 0 ? (
        // Empty state message when no products are available
        <p className="text-gray-500 italic">{emptyMessage}</p>
    ) : (
        // Responsive grid layout for product cards
        // Adjusts columns based on viewport width
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
            {/* Map each product to a ProductCard component */}
            {products.map((product) => (
                <ProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    sellerId={product.sellerId}
                    imageUrl={product.imageUrl}
                    isFavorite={product.isFavourite || false}
                    createdAt={product.createdAt || new Date().toISOString()}
                    // Use provided userData if available, otherwise use seller data from product
                    sellerData={{
                        id: userData?.id || product.seller.id,
                        name: userData?.name || product.seller.name,
                        surname: userData?.surname || product.seller.surname
                    }}
                />
            ))}
        </div>
    )
}

export default UserProducts;