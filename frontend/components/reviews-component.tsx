import { Review } from "@/lib/definitions";
import ReviewCard from "./review-card";
import ReviewSkeleton from "./review-skeleton";

interface ReviewComponentProps {
  reviews: Review[];
  withProductLink: boolean;
  loading?: boolean;
}

function ReviewComponent({ reviews, withProductLink, loading = false }: ReviewComponentProps) {
  return (
    <div className="flex flex-col p-4">
      <h2 className="text-xl font-medium mb-2">Reviews</h2>
      
      {loading ? (
        <ReviewSkeleton count={3} />
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 italic">Not reviewed yet.</p>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review.id} review={review} withProductLink={withProductLink} />
        ))
      )}
    </div>
  );
}

export default ReviewComponent;