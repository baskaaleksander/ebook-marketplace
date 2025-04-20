'use client';

import { useAuth } from "@/providers/auth-provider";
import { Product } from "@/lib/definitions";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import ProductCard from "./product-card";

function LastViewed() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [lastViewed, setLastViewed] = useState<Product[]>([]);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (user && !authLoading) {
            setLoading(true);
            setError(null);
            const fetchLastViewed = async () => {
                try {
                    const response = await api.get('/listing/viewed');
                    
                    setLastViewed(response.data);
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchLastViewed();
        }
        if (!user && !authLoading) {
            setLastViewed([]);
        }
        setLoading(false);
    }, [user, authLoading]);
    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
        );
    }
    if (!user && !authLoading) {
        return (
            <></>
        );
    }

    if (lastViewed.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold">No products viewed yet</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl md:text-3xl font-bold hover:cursor-auto mb-8">👀 Last viewed</h2>

                    <Carousel>
                        <CarouselContent>
                            {lastViewed.map((product) => (
                                <CarouselItem
                                    key={product.id}
                                    className="pl-1 md:basis-1/4"
                                    >
                                        <ProductCard
                                            id={product.id}
                                            title={product.title}
                                            price={product.price}
                                            imageUrl={product.imageUrl}
                                            sellerId={product.sellerId}
                                            createdAt={product.createdAt}
                                            isFavorite={product.isFavourite || false}
                                            />
                                    </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselNext />
                        <CarouselPrevious />
                    </Carousel>
        </div>
    
    )
}

export default LastViewed