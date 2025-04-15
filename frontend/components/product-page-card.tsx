import { Product, UserData } from "@/lib/definitions";
import Link from "next/link";
import { Button } from "./ui/button";
import api from "@/utils/axios";
import { useAuth } from "@/providers/authprovider";
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

function ProductPageCard({product, seller}: {product: Product, seller: UserData}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToFavorites = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.post(`/listing/favourites/${product.id}`);

      if (response.status === 200) {
        product.isFavourite = true;
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  }

  const removeFromFavorites = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.delete(`/listing/favourites/${product.id}`);

      if (response.status === 200) {
        product.isFavourite = false;
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  }

  const startPurchaseFlow = () => {

    if (!user) {
      router.push('/login');
      return;
    }
    
    setIsPurchaseDialogOpen(true);
  };

  const handlePurchase = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await api.post('/stripe/order/checkout', {
        id: product.id
      });
      
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
        <div className="rounded-lg overflow-hidden shadow-lg">
          <div className="bg-slate-100 p-8 ">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="max-w-full object-contain aspect-square" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 aspect-square h-full">
                <img src="/file.svg" alt="Document" className="w-20 h-20 mb-4" />
                <p>E-book preview not available</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <div className="text-sm text-gray-600 mb-4">
            {seller && <Link href={`/user/${seller.id}`} className="mb-1 hover:underline">{seller.name} {seller.surname}</Link>}
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{product.description}</p>
            
            {product.isFeatured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded mb-3">
                Featured Product
              </span>
            )}
          </div>
                    
          <div className="flex flex-col space-y-3 mt-auto">
            <Button 
              onClick={startPurchaseFlow} 
              className="font-bold py-3 px-4"
            >
              Purchase for ${product.price?.toFixed(2)}
            </Button>
            {product.isFavourite ? <Button onClick={removeFromFavorites} variant="outline">
              Remove from Favorites
            </Button> : <Button variant="outline" onClick={addToFavorites}>
              Add to Favorites
            </Button>}
          </div>
        </div>
      </div>

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase "{product.title}" for ${product.price?.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Product:</span> 
                <span>{product.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Price:</span> 
                <span>${product.price?.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Seller:</span> 
                <span>{seller?.name} {seller?.surname}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsPurchaseDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
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