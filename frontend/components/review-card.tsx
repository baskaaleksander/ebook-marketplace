'use client';
import { Review } from "@/lib/definitions";
import StarRating from "./star-rating";
import { useAuth } from "@/providers/authprovider";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import api from "@/utils/axios";
import { Textarea } from "./ui/textarea";


function ReviewCard({ review }: { review: Review;}) {
  const { buyer } = review;
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [editedComment, setEditedComment] = useState(review.comment);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleEditSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await api.put(`/listing/reviews/${review.id}`, {
        comment: editedComment,
        rating: editedRating
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/listing/reviews/${review.id}`);
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
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
        {user?.id === review.buyer.id &&
          <div className="flex justify-end gap-2"> 
            <Button onClick={() => setIsEditDialogOpen(true)} className="mt-2" variant="outline">Edit</Button>
            <Button 
              onClick={() => setIsDeleteDialogOpen(true)} 
              variant="destructive" 
              className="mt-2"
            >
              Delete
            </Button>
          </div>
        }
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <StarRating 
                rating={editedRating}
                editable={true}
                onChange={(newRating) => setEditedRating(newRating)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <Textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
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
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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