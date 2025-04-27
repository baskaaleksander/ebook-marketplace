import { Product, UserData } from "@/lib/definitions";
import ProductCard from "./product-card";
import ProductCardSkeleton from "./product-card-skeleton";

function UserProducts({ userData, products, emptyMessage, loading }: { userData?: UserData; products: Product[], emptyMessage?: string, loading?: boolean }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    return products.length === 0 ? (
        <p className="text-gray-500 italic">{emptyMessage}</p>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
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