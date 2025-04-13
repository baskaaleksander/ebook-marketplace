import { Review } from "@/lib/definitions";
import StarRating from "./star-rating";

interface ReviewWithBuyer extends Omit<Review, 'buyer'> {
  buyer: {
    id: string;
    email: string;
    name: string;
    surname: string;
    avatarUrl?: string;
  };
}

function ReviewCard({ review }: { review: ReviewWithBuyer }) {
  const { buyer } = review;
  
  return (
    <div className="flex flex-col p-4 border-b border-gray-300">
      <div className="flex items-start mb-2">
        <img
          src={buyer.avatarUrl || `https://ui-avatars.com/api/?name=${buyer.name}+${buyer.surname}&bold=true`}
          alt="User Avatar"
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{buyer.name} {buyer.surname}</h3>
          <p className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <StarRating rating={review.rating} />
      <p className="text-gray-700 mt-2">{review.comment}</p>
    </div>
  );
}

export default ReviewCard;