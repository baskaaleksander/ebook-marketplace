import { Review } from "@/lib/definitions";
import ReviewCard from "./review-card";
import ReviewSkeleton from "./review-skeleton";

/**
 * Interface defining the props for the ReviewComponent
 * Specifies the data and configuration options for displaying reviews
 */
interface ReviewComponentProps {
  reviews: Review[];            // Array of review data to display
  withProductLink: boolean;     // Whether to include links to the product in each review
  loading?: boolean;            // Optional flag to indicate loading state
}

/**
 * ReviewComponent displays a collection of product reviews
 * Handles different states: loading, empty reviews, and populated reviews
 * Delegates the rendering of individual reviews to ReviewCard components
 * 
 * @param {ReviewComponentProps} props - Component properties
 * @param {Review[]} props.reviews - Array of review objects to display
 * @param {boolean} props.withProductLink - Whether to show links to products in the reviews
 * @param {boolean} props.loading - Whether the reviews are currently loading
 */
function ReviewComponent({ reviews, withProductLink, loading = false }: ReviewComponentProps) {
  return (
    <div className="flex flex-col p-4">
      {/* Section header */}
      <h2 className="text-xl font-medium mb-2">Reviews</h2>
      
      {/* Conditional rendering based on loading status and data availability */}
      {loading ? (
        // Show skeleton placeholder UI while loading
        <ReviewSkeleton count={3} />
      ) : reviews.length === 0 ? (
        // Show empty state message when no reviews exist
        <p className="text-gray-500 italic">Not reviewed yet.</p>
      ) : (
        // Map review data to individual ReviewCard components
        reviews.map((review) => (
          <ReviewCard 
            key={review.id}       // Unique key for React's reconciliation
            review={review}       // Pass review data
            withProductLink={withProductLink}  // Configure display mode
          />
        ))
      )}
    </div>
  );
}

export default ReviewComponent;