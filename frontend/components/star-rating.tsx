import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

function StarRating({ rating, editable = false, onChange }: StarRatingProps) {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    const handleClick = (newRating: number) => {
        if (editable && onChange) {
            onChange(newRating);
        }
    };
    
    for (let i = 1; i <= 5; i++) {
        let star;
        if (i <= roundedRating) {
            star = <FaStar key={i} className="text-yellow-400" />;
        } else if (i - 0.5 === roundedRating) {
            star = <FaStarHalfAlt key={i} className="text-yellow-400" />;
        } else {
            star = <FaRegStar key={i} className="text-yellow-400" />;
        }
        
        if (editable) {
            stars.push(
                <span 
                    key={i} 
                    onClick={() => handleClick(i)}
                    className="cursor-pointer"
                    title={`${i} stars`}
                >
                    {star}
                </span>
            );
        } else {
            stars.push(star);
        }
    }
    
    return <div className="flex">{stars}</div>;
}

export default StarRating;