import Link from "next/link";
import ProductCard from "./product-card";
import api from "@/utils/axios";

async function FeaturedProducts() {

    const featured = await api.get('/listing/featured?limit=4');

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/featured"><h2 className="text-2xl md:text-3xl font-bold">⭐ Featured Books</h2></Link>
                    <a href="/products?featured=true" className="text-blue-600 hover:underline text-sm">
                        View all &rarr;
                    </a>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featured.data.data.length === 0 && (
                    <p className="text-gray-500">No featured products found...</p>
                )}
                {featured.data.data.map((product: any) => (
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

                {/* <ProductCard
                    id="cm906osis0001il7kdwdsf5cd"
                    title="The Great Adventure"
                    price={49.99}
                    sellerId="cm92nodda00006mwfk9tyt43j"
                    createdAt="2025-04-02T17:11:25.540Z"
                    imageUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
                />
                <ProductCard
                    id="cm906osis0002il7kdwdsf5cd"
                    title="Mystery in the Mountains"
                    price={29.99}
                    sellerId="cm92nodda00006mwfk9tyt43j"
                    createdAt="2025-04-02T17:11:25.540Z"
                    imageUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
                />
                <ProductCard
                    id="cm906osis0003il7kdwdsf5cd"
                    title="The History of Everything"
                    price={19.99}
                    sellerId="cm92nodda00006mwfk9tyt43j"
                    createdAt="2025-04-02T17:11:25.540Z"
                    imageUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
                />
                <ProductCard
                    id="cm906osis0004il7kdwdsf5cd"
                    title="Learning JavaScript"
                    price={34.99}
                    sellerId="cm92nodda00006mwfk9tyt43j"
                    createdAt="2025-04-02T17:11:25.540Z"
                    imageUrl="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
                />                 */}
                </div>
            </div>
        </section>
    )
}

export default FeaturedProducts;