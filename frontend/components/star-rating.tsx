import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

/**
 * Props interface for the StarRating component
 * Defines configuration options for rating display and interaction
 */
interface StarRatingProps {
  rating: number;           // The rating value to display (can include half-stars with .5 values)
  editable?: boolean;       // Whether stars can be clicked to change the rating
  onChange?: (rating: number) => void;  // Callback function when rating changes
}

/**
 * StarRating component displays a 5-star rating visualization
 * Supports both read-only display and interactive editing modes
 * Renders full stars, half stars, and empty stars based on the rating value
 * 
 * @param {StarRatingProps} props - Component properties
 * @param {number} props.rating - Current rating value (1-5, supports half-stars)
 * @param {boolean} props.editable - Whether users can click to change the rating
 * @param {function} props.onChange - Callback triggered when rating changes in editable mode
 */
function StarRating({ rating, editable = false, onChange }: StarRatingProps) {
    // Array to store star elements
    const stars = [];
    
    // Round to nearest half-star for consistent display
    // Multiplying by 2 and dividing by 2 ensures we only get whole and half star values
    const roundedRating = Math.round(rating * 2) / 2;
    
    /**
     * Handles star click events in editable mode
     * Calls the onChange callback with the new rating value
     * 
     * @param {number} newRating - The new rating value (1-5)
     */
    const handleClick = (newRating: number) => {
        if (editable && onChange) {
            onChange(newRating);
        }
    };
    
    // Generate 5 stars with appropriate filled/half/empty state
    for (let i = 1; i <= 5; i++) {
        let star;
        
        // Determine star type based on position relative to rating
        if (i <= roundedRating) {
            // Full star for positions at or below the rating
            star = <FaStar key={i} className="text-yellow-400" />;
        } else if (i - 0.5 === roundedRating) {
            // Half star for position exactly 0.5 above a whole number rating
            star = <FaStarHalfAlt key={i} className="text-yellow-400" />;
        } else {
            // Empty star for positions above the rating
            star = <FaRegStar key={i} className="text-yellow-400" />;
        }
        
        // For editable mode, wrap star in clickable span with title for accessibility
        if (editable) {
            stars.push(
                <span 
                    key={i} 
                    onClick={() => handleClick(i)}
                    className="cursor-pointer"
                    title={`${i} stars`}
                    role="button"
                    aria-label={`Rate ${i} stars`}
                >
                    {star}
                </span>
            );
        } else {
            // For read-only mode, just add the star without wrapper
            stars.push(star);
        }
    }
    
    // Render stars in a horizontal flex container
    return (
        <div className="flex" aria-label={`Rating: ${roundedRating} out of 5 stars`}>
            {stars}
        </div>
    );
}

export default StarRating;