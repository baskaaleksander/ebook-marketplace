import { Product, UserData } from "@/lib/definitions";
import Link from "next/link";
import { Button } from "./ui/button";
import api from "@/utils/axios";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * ProductPageCard displays detailed information about a single product
 * Provides functionality for viewing product details, favoriting, and purchasing
 * Handles authentication status and redirects unauthenticated users when needed
 * 
 * @param {Object} props - Component props
 * @param {Product} props.product - The product to display
 * @param {UserData} props.seller - User information about the product seller
 */
function ProductPageCard({product: initialProduct, seller}: {product: Product, seller: UserData}) {
  // Authentication and navigation hooks
  const { user } = useAuth();   // Current user authentication state
  const router = useRouter();   // Next.js router for navigation

  // Dialog and processing states
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false); // Controls purchase confirmation dialog
  const [isProcessing, setIsProcessing] = useState(false);                 // Tracks purchase processing state
  
  // Local product state that can be modified (e.g., for favorite status changes)
  const [product, setProduct] = useState<Product>(initialProduct);

  /**
   * Adds the current product to user's favorites
   * Redirects to login if user is not authenticated
   * Updates UI state optimistically after successful API call
   */
  const addToFavorites = async () => {
    // Authentication check with redirect
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // API call to add product to favorites
      const response = await api.post(`/listing/favourites/${product.id}`);

      if (response.status === 200) {
        // Update local state to reflect favorite status
        setProduct({
          ...product,
          isFavourite: true
        });
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  }

  /**
   * Removes the current product from user's favorites
   * Redirects to login if user is not authenticated
   * Updates UI state optimistically after successful API call
   */
  const removeFromFavorites = async () => {
    // Authentication check with redirect
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      // API call to remove product from favorites
      const response = await api.delete(`/listing/favourites/${product.id}`);

      if (response.status === 200) {
        // Update local state to reflect favorite status
        setProduct({
          ...product,
          isFavourite: false
        });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  }

  /**
   * Initiates the purchase flow by showing confirmation dialog
   * Redirects to login if user is not authenticated
   */
  const startPurchaseFlow = () => {
    // Authentication check with redirect
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Open purchase confirmation dialog
    setIsPurchaseDialogOpen(true);
  };

  /**
   * Handles the actual product purchase after confirmation
   * Makes API call to create a Stripe checkout session
   * Redirects user to the Stripe checkout page on success
   */
  const handlePurchase = async () => {
    // Prevent multiple submissions
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Create Stripe checkout session for this product
      const response = await api.post('/stripe/order/checkout', {
        id: product.id
      });
      
      // Redirect to Stripe checkout if URL is returned
      if (response?.data?.url) {
        router.push(response.data.url);
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      setIsPurchaseDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {/* Product image container - left column */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <div className="bg-slate-100">
            {/* Conditional rendering based on image availability */}
            {product.imageUrl ? (
              <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 aspect-square h-full">
                <img src="/file.svg" alt="Document" className="w-20 h-20 mb-4" />
                <p>E-book preview not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Product details container - right column */}
        <div className="flex flex-col h-full">
          {/* Product title */}
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          
          {/* Seller information with link to seller profile */}
          <div className="text-sm text-gray-600 mb-4">
            {seller && <Link href={`/user/${seller.id}`} className="mb-1 hover:underline">{seller.name} {seller.surname}</Link>}
          </div>
          
          {/* Product description and featured badge */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{product.description}</p>
            
            {/* Featured badge shown only for featured products */}
            {product.isFeatured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded mb-3">
                Featured Product
              </span>
            )}
          </div>
          
          {/* Action buttons container - aligned to bottom */}
          <div className="flex flex-col space-y-3 mt-auto">
            {/* Purchase button with price */}
            <Button 
              onClick={startPurchaseFlow} 
              className="font-bold py-3 px-4"
            >
              Purchase for {product.price?.toFixed(2)}PLN
            </Button>
            
            {/* Toggle favorite button based on current favorite status */}
            {product.isFavourite ? (
              <Button onClick={removeFromFavorites} variant="outline">
                Remove from Favorites
              </Button> 
            ) : (
              <Button variant="outline" onClick={addToFavorites}>
                Add to Favorites
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Purchase confirmation dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase &rdquo;{product.title}&rdquo; for {product.price?.toFixed(2)}PLN
            </DialogDescription>
          </DialogHeader>
          
          {/* Purchase details summary */}
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Product:</span> 
                <span>{product.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Price:</span> 
                <span>{product.price?.toFixed(2)}PLN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Seller:</span> 
                <span>{seller?.name} {seller?.surname}</span>
              </div>
            </div>
          </div>
          
          {/* Dialog action buttons */}
          <DialogFooter className="sm:justify-between">
            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={() => setIsPurchaseDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            {/* Proceed button with loading state */}
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProductPageCard;