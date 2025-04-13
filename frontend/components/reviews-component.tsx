import { Review } from "@/lib/definitions";
import ReviewCard from "./review-card";

function ReviewComponent( {reviews, withProductLink} : { reviews: Review[], withProductLink: boolean }) {
    return (
        <div className="flex flex-col p-4">
            <h2 className="text-xl font-medium mb-2">Reviews</h2>
            {reviews.length === 0 && <p className="text-gray-500 italic">Not reviewed yet.</p>}
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} withProductLink={withProductLink}/>
            ))}
        </div>
    )
}

export default ReviewComponent;