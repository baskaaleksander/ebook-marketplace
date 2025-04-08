import { Product, UserData } from "@/lib/definitions";
import Link from "next/link";
import { Button } from "./ui/button";

function ProductPageCard({product, seller}: {product: Product, seller: UserData}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <div className="bg-slate-100 p-8 ">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="max-w-full object-contain aspect-square" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 aspect-square h-full">
                <img src="/file.svg" alt="Document" className="w-20 h-20 mb-4" />
                <p>E-book preview not available</p>
              </div>
            )}
          </div>

          
        </div>

        <div className="flex flex-col h-full">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <div className="text-sm text-gray-600 mb-4">
              {seller && <Link href={`${seller.id}`} className="mb-1 hover:underline">{seller.name} {seller.surname}</Link> }
            </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{product.description}</p>
            
            {product.isFeatured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded mb-3">
                Featured Product
              </span>
            )}
          </div>
                    
          <div className="flex flex-col space-y-3 mt-auto">
            <Button className="font-bold py-3 px-4">
              Purchase for ${product.price?.toFixed(2)}
            </Button>
            <Button variant="outline">
              Add to Favorites
            </Button>
          </div>
        </div>
      </div>

    )
}

export default ProductPageCard;