import Link from "next/link";
import ProductCard from "./product-card";
import api from "@/utils/axios";
import { Product } from "@/lib/definitions";

async function FeaturedProducts() {

    const featured = await api.get('/listing/featured?limit=4');

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/products?featured=true"><h2 className="text-2xl md:text-3xl font-bold">⭐ Featured Books</h2></Link>
                    <Link href="/products?featured=true" className="text-blue-600 hover:underline text-sm">
                        View all &rarr;
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featured.data.data.length === 0 && (
                    <p className="text-gray-500">No featured products found...</p>
                )}
                {featured.data.data.map((product: Product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        sellerId={product.sellerId}
                        createdAt={product.createdAt}
                        imageUrl={product.imageUrl}
                    />
                ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturedProducts;