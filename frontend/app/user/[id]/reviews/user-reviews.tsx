'use client';
import ReviewComponent from "@/components/reviews-component";
import api from "@/utils/axios";
import { use, useEffect, useState } from "react";

/**
 * UserReviews component displays all reviews associated with a specific user
 * It fetches reviews data from the API based on the user ID from URL parameters
 * 
 * @param {Object} props - Component props
 * @param {Promise<{id: string}>} props.params - Promise containing the user ID from URL params
 */
function UserReviews({ params }: { params: Promise<{ id: string }> }) {
    // State for storing the fetched review data
    const [reviews, setReviews] = useState([]);
    
    // Loading state to show loading indicators while fetching data
    const [loading, setLoading] = useState(true);
    
    // Error state to handle and display API request failures
    const [error, setError] = useState<string | null>(null);
    
    // Extract and resolve user ID from the URL params
    const resolvedParams = use(params);
    const userId = resolvedParams.id;

    /**
     * Effect hook to fetch user reviews when component mounts or userId changes
     * Makes API call to get all reviews for the specified user
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Request reviews data for the specific user
                const response = await api.get(`/user/${userId}/reviews`);
                // Update state with fetched reviews
                setReviews(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data");
            } finally {
                // Always turn off loading state when request completes
                setLoading(false);
            }
        }
        fetchData();
    }, [userId]); // Re-fetch when userId changes

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
        {/* Display error message if API request failed */}
        {error && <div className="text-red-500">{error}</div>}
        
        {/* Reviews component with product links enabled */}
        <ReviewComponent 
            reviews={reviews} 
            withProductLink={true} // Enable links to product pages for each review
            loading={loading} // Pass loading state for skeleton display
        />
    </div>
  );
}

export default UserReviews;