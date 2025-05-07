'use client';
import { Review } from "@/lib/definitions";
import StarRating from "./star-rating";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import api from "@/utils/axios";
import { Textarea } from "./ui/textarea";

/**
 * ReviewCard component displays a single product review
 * Shows buyer information, rating, comment, and timestamps
 * Provides editing and deletion functionality for review owners
 * Optionally links back to the reviewed product
 * 
 * @param {Object} props - Component props
 * @param {Review} props.review - Review data to display
 * @param {boolean} props.withProductLink - Whether to show a link to the product
 */
function ReviewCard({ review, withProductLink }: { review: Review, withProductLink: boolean}) {
  // Extract buyer data from review for easy access
  const { buyer } = review;
  
  // Authentication hook to determine if current user is review owner
  const { user } = useAuth();
  
  // Dialog visibility state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false); // Controls edit dialog visibility
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false); // Controls delete dialog visibility
  
  // Editing state for form fields
  const [editedComment, setEditedComment] = useState(review.comment); // Stores modified comment text
  const [editedRating, setEditedRating] = useState(review.rating); // Stores modified rating value
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false); // Controls button loading states and prevents double-submission
  
  /**
   * Handles submission of edited review
   * Makes API call to update review data
   * Handles loading state and error cases
   */
  const handleEditSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Send updated review data to API
      await api.put(`/listing/reviews/${review.id}`, {
        comment: editedComment,
        rating: editedRating
      });
      
      // Close dialog on success
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handles review deletion
   * Makes API call to delete review and reloads page on success
   * Handles loading state and error cases
   */
  const handleDelete = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Send delete request to API
      await api.delete(`/listing/reviews/${review.id}`);
      
      // Close dialog and refresh page to show updated reviews list
      setIsDeleteDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      {/* Main review card */}
      <div className="flex flex-col p-4 border-b border-gray-300">
        {/* Reviewer information section with avatar */}
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
        
        {/* Star rating display */}
        <StarRating rating={review.rating} />
        
        {/* Review comment text */}
        <p className="text-gray-700 mt-2">{review.comment}</p>
        
        {/* Action buttons container */}
        <div className="flex justify-end gap-2"> 
          {/* Edit/Delete buttons only visible to review owner */}
          {user?.id === review.buyer.id &&
          <>
            <Button onClick={() => setIsEditDialogOpen(true)} className="mt-2" variant="outline">Edit</Button>
            <Button 
              onClick={() => setIsDeleteDialogOpen(true)} 
              variant="destructive" 
              className="mt-2"
            >
              Delete
            </Button>
          </>
          }
          
          {/* Optional link to product - shown based on prop */}
          {withProductLink && (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.href = `/product/${review.productId}`}
            >
              View Product
            </Button>
          )}
        </div>
      </div>
      
      {/* Edit review dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* Editable star rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <StarRating 
                rating={editedRating}
                editable={true}
                onChange={(newRating) => setEditedRating(newRating)}
              />
            </div>
            
            {/* Editable comment textarea */}
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <Textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          {/* Dialog action buttons */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {/* Dialog action buttons */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ReviewCard;