import { Product, UserData } from "@/lib/definitions";
import ProductCard from "./product-card";

function UserProducts({ userData, products }: { userData: UserData; products: Product[] }) {

    return products.length === 0 ? (
        <p className="text-gray-500 italic">No products available from this user yet.</p>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
            {products.map((product) => (
                <ProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    sellerId={product.sellerId}
                    createdAt={product.createdAt || new Date().toISOString()}
                    sellerData={{
                        id: userData.id,
                        name: userData.name,
                        surname: userData.surname
                    }}
                />
            ))}
        </div>
    )
}

export default UserProducts;