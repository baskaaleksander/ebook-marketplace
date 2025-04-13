import { Review } from "@/lib/definitions";
import ReviewCard from "./review-card";

function ReviewComponent( {reviews} : { reviews: any[] }) {
    console.log("Reviews: ", reviews);
    return (
        <div className="flex flex-col p-4">
            <h2 className="text-xl font-medium mb-2">Reviews</h2>
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    )
}

export default ReviewComponent;