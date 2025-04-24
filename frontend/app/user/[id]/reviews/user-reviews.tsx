'use client';
import ReviewComponent from "@/components/reviews-component";
import api from "@/utils/axios";
import { use, useEffect, useState } from "react";

function UserReviews({ params }: { params: Promise<{ id: string }> }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const resolvedParams = use(params);
    const userId = resolvedParams.id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/user/${userId}/reviews`);
                setReviews(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [userId]);
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ReviewComponent reviews={reviews} withProductLink={true}/>
    </div>
  );
}

export default UserReviews;