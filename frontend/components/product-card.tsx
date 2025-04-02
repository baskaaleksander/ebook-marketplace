import api from "@/utils/axios";
import { Card, CardContent, CardTitle } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import FavoriteButton from "./favorite-button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    sellerId: string;
    imageUrl?: string;
    createdAt: string;
    isFavorite?: boolean;
    className?: string;
}

async function ProductCard({
    id,
    title,
    price,
    sellerId,
    imageUrl,
    createdAt,
    isFavorite = false,
    className,
}: ProductCardProps) {
    const seller = await api.get(`/user/id/${sellerId}`);

    return (
        <Card 
            className={cn(
                "hover:shadow-lg transition-shadow duration-200 ease-in-out h-full relative flex flex-col",
                className
            )}
        >            
            <CardContent className="flex-1 flex flex-col p-4">
                <div className="flex-1 flex flex-col">
                    <div className="aspect-[3/4] overflow-hidden rounded-md mb-4 relative">
                        {/* Favorite Button as image overlay */}
                        <div className="absolute top-2 right-2 z-10">
                            <FavoriteButton productId={id} initialIsFavorite={isFavorite} />
                        </div>
                        
                        <img
                            src={imageUrl || "https://placehold.co/300x400"}
                            alt={title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                    
                    <div className="mt-auto">
                        <div className="flex justify-between items-baseline mb-3">
                            <p className="text-gray-500 font-medium">${price.toFixed(2)}</p>
                        </div>
                        
                        <div className="mb-2">
                            <CardTitle className="line-clamp-1 text-base sm:text-lg">{title}</CardTitle>
                        </div>
                        
                        <Link 
                            href={`/user/${seller.data.id}`}
                            className="text-xs sm:text-sm text-gray-400 hover:text-gray-700 hover:underline block mb-4"
                        >
                            {seller.data.name}
                        </Link>

                        <Button className="w-full text-sm sm:text-base">
                            <Link href={`/product/${id}`} className="w-full flex justify-center">
                                Learn more
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default ProductCard;