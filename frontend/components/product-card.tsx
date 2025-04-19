'use client'

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { Card, CardContent, CardTitle } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import FavoriteButton from "./favorite-button";
import { cn } from "@/lib/utils";
import placeholder from "@/public/placeholder.jpg";

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    sellerId: string;
    imageUrl?: string;
    createdAt: string;
    isFavorite?: boolean;
    className?: string;
    sellerData?: {
        id: string;
        name: string;
        surname: string;
    };
}

function ProductCard({
    id,
    title,
    price,
    sellerId,
    imageUrl,
    createdAt,
    isFavorite = false,
    className,
    sellerData,
}: ProductCardProps) {
    const [seller, setSeller] = useState(sellerData);
    const [loading, setLoading] = useState(!sellerData);

    useEffect(() => {
        if (!sellerData) {
            const fetchSeller = async () => {
                try {
                    const response = await api.get(`/user/id/${sellerId}`);
                    setSeller(response.data);
                } catch (error) {
                    console.error("Error fetching seller data:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchSeller();
        }
    }, [sellerId, sellerData]);
    
    return (
                <div className="flex-1 flex flex-col p-4">
                    <div className="overflow-hidden rounded-md mb-4 relative">
                        <div className="absolute top-2 right-2 z-10">
                            <FavoriteButton productId={id} initialIsFavorite={isFavorite} />
                        </div>
                        <Link href={`/product/${id}`}>
                        <img
                            src={imageUrl || placeholder.src}
                            alt={title}
                            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            style={{ aspectRatio: '1/1' }}
                        />
                        </Link>
                    </div>
                    
                    <div className="mt-auto">
                        <div className="flex justify-between items-baseline mb-3">
                            <p className="text-gray-500 font-medium">{price.toFixed(2)}zł</p>
                        </div>
                        
                        <Link href={`/product/${id}`}>
                        <div className="mb-2">
                            <h2 className="line-clamp-1 text-base sm:text-lg font-medium hover:underline">{title}</h2>
                        </div>
                        </Link>
                        
                        {!loading && seller && (
                            <Link 
                                href={`/user/${seller.id}`}
                                className="text-xs sm:text-sm text-gray-400 hover:text-gray-700 hover:underline block mb-4"
                            >
                                {seller.name} {seller.surname}
                            </Link>
                        )}
                    </div>
                </div>
    );
}

export default ProductCard;