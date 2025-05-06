'use client';

import { useState } from 'react';
import { LiaHeart, LiaHeartSolid } from 'react-icons/lia';
import { Button } from './ui/button';
import { toast } from 'sonner';
import api from '@/utils/axios';
import { useAuth } from '@/providers/auth-provider';

/**
 * Props interface for the FavoriteButton component
 * Defines properties needed to manage favorite status for a product
 */
interface FavoriteButtonProps {
  productId: string;              // ID of the product to toggle favorite status
  initialIsFavorite?: boolean;    // Initial favorite state, defaults to false
}

/**
 * FavoriteButton component displays a heart icon that toggles a product's favorite status
 * Provides visual feedback with different icons for favorited and unfavorited states
 * Includes loading state and authentication check
 * 
 * @param {FavoriteButtonProps} props - Component props
 */
export default function FavoriteButton({ productId, initialIsFavorite = false }: FavoriteButtonProps) {
  // State management for favorite status and API interaction
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite); // Current favorite status
  const [isLoading, setIsLoading] = useState(false); // Controls loading/disabled state during API calls
  
  // Get authenticated user data from context
  const { user } = useAuth();

  /**
   * Toggles product favorite status with optimistic UI update
   * Prevents event bubbling to parent elements
   * Requires authentication and shows toast notifications for feedback
   * 
   * @param {React.MouseEvent} e - Click event object
   */
  const toggleFavorite = async (e: React.MouseEvent) => {
    // Prevent the event from triggering parent elements' click handlers
    e.preventDefault();
    e.stopPropagation();
    
    // Show authentication error if user is not logged in
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please login to add items to favorites',
      });
      return;
    }
    
    // Store previous state for rollback if API call fails
    const previousState = isFavorite;
    
    // Optimistically update UI before API call completes
    setIsFavorite(!isFavorite);
    setIsLoading(true);
    
    try {
      if (previousState) {
        // Remove from favorites if currently favorited
        await api.delete(`/listing/favourites/${productId}`);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites if not currently favorited
        await api.post(`/listing/favourites/${productId}`);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Revert to previous state if API call fails
      setIsFavorite(previousState);
      toast.error('Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow-sm hover:shadow"
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} // Accessibility label
    >
      {/* Show different UI states based on loading and favorite status */}
      {isLoading ? (
        // Loading indicator when API call is in progress
        <div className="h-5 w-5 animate-pulse bg-gray-200 rounded-full"></div>
      ) : isFavorite ? (
        // Solid heart icon when item is favorited
        <LiaHeartSolid className="h-5 w-5 text-red-500" />
      ) : (
        // Outline heart icon when item is not favorited
        <LiaHeart className="h-5 w-5 text-gray-600 hover:text-red-400 transition-colors" />
      )}
    </Button>
  );
}