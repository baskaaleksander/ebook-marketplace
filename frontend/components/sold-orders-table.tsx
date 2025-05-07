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
import { useState } from "react";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "@/components/ui/pagination";

/**
 * SoldOrdersTable displays a paginated table of orders sold by the current user
 * Includes order ID, amount, status, and other relevant information
 * Implements client-side pagination for improved performance with large datasets
 * 
 * @param {Object} props - Component properties
 * @param {Order[]} props.orders - Array of order objects to display
 */
function SoldOrdersTable({ orders }: { orders: Order[] }) {
    // Pagination state and configuration
    const [currentPage, setCurrentPage] = useState(1);  // Current active page number
    const itemsPerPage = 10;                           // Number of orders to show per page
    const totalPages = Math.ceil(orders.length / itemsPerPage);  // Calculate total pages needed
    
    /**
     * Calculate which items to display on the current page
     * Uses array slicing to extract the correct subset of orders
     */
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
    
    /**
     * Pagination navigation functions
     * Control page changes with boundary checks
     */
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);  // Go to specific page
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));  // Go to next page with upper bound check
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));  // Go to previous page with lower bound check

    /**
     * Generates a limited range of page numbers to display in pagination
     * Uses a sliding window approach to show relevant page numbers
     * Ensures the current page is always visible in the pagination bar
     * 
     * @returns {number[]} Array of page numbers to display
     */
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Show max 5 page numbers
        
        // Calculate start page (try to center current page in the range)
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        // Adjust start if we're near the end to always show maxPagesToShow if available
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        // Generate the array of page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    return (
        <div>
            {/* Pagination navigation - only shown when multiple pages exist */}
            {totalPages > 1 && (
                <div className="mb-4">
                    <Pagination>
                        <PaginationContent>
                            {/* Previous page button - disabled on first page */}
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={prevPage}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                                />
                            </PaginationItem>
                            
                            {/* Dynamic page number buttons */}
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
                            
                            {/* Next page button - disabled on last page */}
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

            {/* Orders table with current page items */}
            <Table>
                {/* Table caption with pagination information */}
                <TableCaption>Your sold orders - Page {currentPage} of {totalPages}</TableCaption>
                
                {/* Table header row with column titles */}
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Refund ID</TableHead>
                        <TableHead>Buyer ID</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                
                {/* Table body with order data rows */}
                <TableBody>
                    {currentItems.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            {/* Format amount from cents to dollars/PLN with 2 decimal places */}
                            <TableCell>{(order.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.refundId || ""}</TableCell>
                            <TableCell>{order.buyerId}</TableCell>
                            {/* Format timestamp to localized date string */}
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </div>
    )
}

export default SoldOrdersTable;