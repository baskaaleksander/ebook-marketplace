'use client'

import { Product, UserData } from "@/lib/definitions";
import UserHeading from "@/components/user-heading";
import UserProducts from "@/components/user-products";
import api from "@/utils/axios";
import { use, useEffect, useState } from "react";

/**
 * User component displays a user profile page with their information and products
 * It fetches user details, ratings, and product listings from the API
 * 
 * @param {Object} props - Component props
 * @param {Promise<{id: string}>} props.params - Promise containing the user ID from URL params
 */
function User({ params }: { params: Promise<{ id: string }> }) {
    // Extract and resolve user ID from the URL params
    const resolvedParams = use(params);
    const userId = resolvedParams.id;
    
    // State for user data, products, loading status, and errors
    const [userData, setUserData] = useState<UserData | null>(null); // User profile information
    const [products, setProducts] = useState<Product[]>([]); // User's product listings
    const [loading, setLoading] = useState(true); // Loading state for data fetching
    const [error, setError] = useState<string | null>(null); // Error state for API failures

    /**
     * Effect to fetch user data, ratings, and products when component mounts
     * Makes multiple API calls to gather complete user profile information
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch basic user information
                const userResponse = await api.get(`/user/${userId}`);
                
                // Fetch user rating average
                const userRatingResponse = await api.get(`/user/avgratings/${userId}`);
                
                // Combine user data with rating and add fallback avatar if needed
                setUserData({
                    ...userResponse.data, 
                    avatarUrl: userResponse.data.avatarUrl || 
                        `https://ui-avatars.com/api/?name=${userResponse.data.name}+${userResponse.data.surname}&bold=true`,
                    rating: userRatingResponse.data.averageRating,
                });
                
                // Fetch user's product listings
                const productsResponse = await api.get(`/listing/user/${userId}`);

                // Handle empty products array explicitly
                if (productsResponse.data.data.length === 0) {
                    setProducts([]);
                } else {
                    setProducts(productsResponse.data.data);
                }
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
    }, [userId]); // Re-fetch when userId changes

    // Show error message if any API request failed
    if (error) {
        return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
    }
    
    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {userData ? (
                <>
                    {/* User profile information header */}
                    <UserHeading userData={userData} loading={loading}/>
                    
                    {/* Grid of user's product listings */}
                    <UserProducts 
                        products={products} 
                        userData={userData} 
                        emptyMessage="No products available from this user yet." 
                        loading={loading}
                    />
                </>
            ) : (
                // Show message when user not found or still loading
                <div className="text-center py-10">
                    {loading ? "Loading user information..." : "User not found"}
                </div>
            )}
        </div>
    );
}

export default User;