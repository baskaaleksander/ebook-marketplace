import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

function StarRating({ rating }: { rating: number }) {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i - 0.5 === roundedRating) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-yellow-400" />);
        }
    }
    
    return <div className="flex">{stars}</div>;
}

export default StarRating;