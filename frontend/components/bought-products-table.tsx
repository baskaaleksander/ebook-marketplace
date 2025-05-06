import { Order } from "@/lib/definitions";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import api from "@/utils/axios";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/star-rating";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "@/components/ui/pagination";

/**
 * BoughtProductsTable displays a list of products purchased by the user
 * Includes functionality for pagination, requesting refunds, and writing reviews
 * 
 * @param {Object} props - Component props
 * @param {Order[]} props.orders - Array of order data for purchased products
 */
function BoughtProductsTable({ orders }: { orders: Order[] }) {
    // Dialog and action state management
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Tracks which order is being processed
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Controls refund confirmation dialog
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false); // Controls review input dialog
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // Currently selected order ID
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null); // Currently selected product ID
    
    // Review form state
    const [reviewRating, setReviewRating] = useState(5); // Star rating for review (1-5)
    const [reviewComment, setReviewComment] = useState(""); // Text comment for review
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1); // Current page being viewed
    const itemsPerPage = 10; // Number of orders to show per page
    const totalPages = Math.ceil(orders.length / itemsPerPage); // Calculate total number of pages
    
    // Calculate which items to display on current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
    
    /**
     * Pagination control functions
     * Handle page navigation and boundary conditions
     */
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    /**
     * Opens refund confirmation dialog for a specific order
     * @param {string} orderId - ID of order to potentially refund
     */
    const openRefundDialog = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDialogOpen(true);
    };

    /**
     * Opens review dialog for a specific product/order
     * @param {string} orderId - ID of the order
     * @param {string} productId - ID of the product to review
     */
    const openReviewDialog = (orderId: string, productId: string) => {
        setSelectedOrderId(orderId);
        setSelectedProductId(productId);
        setIsReviewDialogOpen(true);
    };

    /**
     * Handles refund request submission
     * Makes API call to process refund for selected order
     */
    const handleRefund = async () => {
        if (!selectedOrderId) return;
        
        setIsSubmitting(selectedOrderId);
        try {
            await api.post('/stripe/order/refund', { id: selectedOrderId });
            setIsDialogOpen(false);
        } catch (error) {
            console.log("Error processing refund:", error);
        } finally {
            setIsSubmitting(null);
        }
    };

    /**
     * Handles review submission
     * Makes API call to submit review for selected product
     */
    const handleReviewSubmit = async () => {
        if (!selectedProductId || isSubmitting) return;
        
        setIsSubmitting(selectedOrderId);
        try {
            await api.post(`/listing/${selectedOrderId}/reviews`, {
                rating: reviewRating,
                comment: reviewComment
            });
            
            setIsReviewDialogOpen(false);

            // Reset form for next use
            setReviewRating(5);
            setReviewComment("");
        } catch (error) {
            console.log("Error submitting review:", error);
        } finally {
            setIsSubmitting(null);
        }
    };

    /**
     * Calculates which page numbers to show in pagination
     * Shows a limited window of pages around the current page
     * @returns {number[]} Array of page numbers to display
     */
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Maximum number of page links to show at once
        
        // Calculate start page to show a window around current page
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        // Adjust start page if we're near the end to always show maxPagesToShow if possible
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        // Generate array of page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    return (
        <div>
            {/* Pagination controls - only show if multiple pages exist */}
            {totalPages > 1 && (
                <div className="mb-4">
                    <Pagination>
                        <PaginationContent>
                            {/* Previous page button - disabled if on first page */}
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={prevPage}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                                />
                            </PaginationItem>
                            
                            {/* Page number buttons */}
                            {getPageNumbers().map(number => (
                                <PaginationItem key={number}>
                                    <PaginationLink
                                        onClick={() => paginate(number)}
                                        isActive={currentPage === number}
                                        className="cursor-pointer"
                                    >
                                        {number}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            
                            {/* Next page button - disabled if on last page */}
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={nextPage}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Orders table with purchased products */}
            <Table>
                <TableCaption>Your purchased orders - Page {currentPage} of {totalPages}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Product title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Refund ID</TableHead>
                        <TableHead>Seller ID</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Download</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell><Link href={`/product/${order.product.id}`}>{order.product.title}</Link></TableCell>
                            {/* Format price from cents to dollars */}
                            <TableCell>{(order.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.refundId || ""}</TableCell>
                            <TableCell>{order.sellerId}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            {/* Only show download link for completed orders */}
                            <TableCell>{!(order.status === 'COMPLETED') ? ' ' : <Link href={order.product.fileUrl} className="hover:underline">Download</Link>}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    {/* Show action buttons based on order status */}
                                    {(order.status !== 'REFUNDED' && order.status !== 'PENDING') && (
                                        <>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => openRefundDialog(order.id)}
                                            >
                                                Refund
                                            </Button>
                                            {/* Show review button only if not already reviewed */}
                                            {!order.isReviewed ? <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => openReviewDialog(order.id, order.product.id)}
                                            >
                                                Review
                                            </Button> : <span className="text-gray-500">Already reviewed</span>}
                                        </>
                                    )}
                                    {/* Show status message for refunded orders */}
                                    {order.status === 'REFUNDED' && (
                                        <span className="text-gray-500">Already refunded</span>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            {/* Refund confirmation dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Refund</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to request a refund for this product?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRefund}
                            disabled={isSubmitting === selectedOrderId}
                        >
                            {/* Show loading state during API call */}
                            {isSubmitting === selectedOrderId ? "Processing..." : "Request Refund"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product review dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                            Share your thoughts about this product
                        </DialogDescription>
                    </DialogHeader>
                    {/* Review form with rating and comment fields */}
                    <div className="py-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <StarRating 
                                rating={reviewRating}
                                editable={true}
                                onChange={(rating) => setReviewRating(rating)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Comment</label>
                            <Textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Write your review here..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsReviewDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReviewSubmit}
                            disabled={isSubmitting === selectedOrderId}
                        >
                            {/* Show loading state during API call */}
                            {isSubmitting === selectedOrderId ? "Submitting..." : "Submit Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BoughtProductsTable;