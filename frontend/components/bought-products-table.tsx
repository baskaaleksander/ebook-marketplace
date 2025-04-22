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

function BoughtProductsTable({ orders }: { orders: Order[] }) {
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
    
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const openRefundDialog = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDialogOpen(true);
    };

    const openReviewDialog = (orderId: string, productId: string) => {
        setSelectedOrderId(orderId);
        setSelectedProductId(productId);
        setIsReviewDialogOpen(true);
    };

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

    const handleReviewSubmit = async () => {
        if (!selectedProductId || isSubmitting) return;
        
        setIsSubmitting(selectedOrderId);
        try {
            await api.post(`/listing/${selectedOrderId}/reviews`, {
                rating: reviewRating,
                comment: reviewComment
            });
            
            setIsReviewDialogOpen(false);

            setReviewRating(5);
            setReviewComment("");
        } catch (error) {
            console.log("Error submitting review:", error);
        } finally {
            setIsSubmitting(null);
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    return (
        <div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mb-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={prevPage}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                                />
                            </PaginationItem>
                            
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
                            <TableCell>{(order.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.refundId || ""}</TableCell>
                            <TableCell>{order.sellerId}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{!(order.status === 'COMPLETED') ? ' ' : <Link href={order.product.fileUrl} className="hover:underline">Download</Link>}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    {(order.status !== 'REFUNDED' && order.status !== 'PENDING') && (
                                        <>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => openRefundDialog(order.id)}
                                            >
                                                Refund
                                            </Button>
                                            {!order.isReviewed ? <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => openReviewDialog(order.id, order.product.id)}
                                            >
                                                Review
                                            </Button> : <span className="text-gray-500">Already reviewed</span>}
                                        </>
                                    )}
                                    {order.status === 'REFUNDED' && (
                                        <span className="text-gray-500">Already refunded</span>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            

            {/* Refund Dialog */}
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
                            {isSubmitting === selectedOrderId ? "Processing..." : "Request Refund"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                            Share your thoughts about this product
                        </DialogDescription>
                    </DialogHeader>
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
                            {isSubmitting === selectedOrderId ? "Submitting..." : "Submit Review"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BoughtProductsTable;