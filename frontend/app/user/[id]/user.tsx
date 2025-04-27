'use client'

import { Product, UserData } from "@/lib/definitions";
import UserHeading from "@/components/user-heading";
import UserProducts from "@/components/user-products";
import api from "@/utils/axios";
import { use, useEffect, useState } from "react";



function User({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const userId = resolvedParams.id;
    
    const [userData, setUserData] = useState<UserData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userResponse = await api.get(`/user/${userId}`);
                const userRatingResponse = await api.get(`/user/avgratings/${userId}`);
                setUserData({
                    ...userResponse.data, 
                    avatarUrl: userResponse.data.avatarUrl || 
                        `https://ui-avatars.com/api/?name=${userResponse.data.name}+${userResponse.data.surname}&bold=true`,
                    rating: userRatingResponse.data.averageRating,
                });
                
                const productsResponse = await api.get(`/listing/user/${userId}`);

                if (productsResponse.data.data.length === 0) {
                    setProducts([]);
                }

                setProducts(productsResponse.data.data);
            }
            catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data");
            }
            finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId]);

    if (error) {
        return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
    }



    
    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {userData ? (
                <>
                    <UserHeading userData={userData} loading={loading}/>
                    
                    <UserProducts products={products} userData={userData} emptyMessage="No products available from this user yet." loading={loading}/>
                </>
            ) : (
                <div className="text-center py-10">
                    User not found
                </div>
            )}
        </div>
    );
}

export default User;