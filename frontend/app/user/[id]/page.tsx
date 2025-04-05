'use client'

import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { use, useEffect, useState } from "react";
import { LiaCheckCircle } from "react-icons/lia";

interface UserData {
    id: string;
    name: string;
    surname: string;
    email: string;
    stripeStatus: string;
    description?: string;
    avatarUrl?: string;
    createdAt: string;
}

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    fileUrl: string;
    sellerId: string;
    isFeatured: boolean;
    seller: UserData;
    createdAt: string;
}

function User({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
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
                const userResponse = await api.get(`/user/id/${userId}`);
                setUserData({
                    ...userResponse.data, 
                    avatarUrl: userResponse.data.avatarUrl || 
                        `https://ui-avatars.com/api/?name=${userResponse.data.name}+${userResponse.data.surname}&bold=true`
                });
                
                const productsResponse = await api.get(`/listing/user/${userId}`);
                setProducts(productsResponse.data);
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
    
    if (loading) {
        return <div className="container mx-auto px-4 py-8">Loading user data...</div>;
    }
    
    if (error) {
        return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            {userData ? (
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">User Profile</h1>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>{userData.name} {userData.surname}</TooltipTrigger>
                                    <TooltipContent>
                                        <p>{userData.id}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider> 
                            {userData.stripeStatus === 'verified' && <LiaCheckCircle />}
                        </h2>
                        <a className='hover:underline' href={`mailto:${userData.email}`}>{userData.email}</a>
                        {userData.description && <p className="text-gray-600 mb-4">{userData.description}</p>}
                        {userData.avatarUrl && (
                            <img
                                src={userData.avatarUrl}
                                alt="User Avatar"
                                className="w-24 h-24 rounded-full mb-4"
                            />
                        )}
                        <p className="text-gray-600">Member since: {new Date(userData.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {products.length === 0 ? (
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
                                    sellerData={userData}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    User not found
                </div>
            )}
        </div>
    );
}

export default User;