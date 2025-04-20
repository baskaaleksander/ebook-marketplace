'use client';

import { useState } from 'react';
import { LiaHeart, LiaHeartSolid } from 'react-icons/lia';
import { Button } from './ui/button';
import { toast } from 'sonner';
import api from '@/utils/axios';
import { useAuth } from '@/providers/auth-provider';

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorite?: boolean;
}

export default function FavoriteButton({ productId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please login to add items to favorites',
      });
      return;
    }
    
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    setIsLoading(true);
    
    try {
      if (previousState) {
        await api.delete(`/listing/favourites/${productId}`);
        toast.success('Removed from favorites');
      } else {
        await api.post(`/listing/favourites/${productId}`);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-pulse bg-gray-200 rounded-full"></div>
      ) : isFavorite ? (
        <LiaHeartSolid className="h-5 w-5 text-red-500" />
      ) : (
        <LiaHeart className="h-5 w-5 text-gray-600 hover:text-red-400 transition-colors" />
      )}
    </Button>
  );
}