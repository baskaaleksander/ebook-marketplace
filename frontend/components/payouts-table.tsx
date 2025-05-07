import { Payout } from "@/lib/definitions";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

/**
 * PayoutsTable component displays a list of seller payouts in a tabular format
 * Shows payout amount, status, and creation date in a structured table
 * 
 * @param {Object} props - Component properties
 * @param {Payout[]} props.payouts - Array of payout objects to display
 */
function PayoutsTable({ payouts }: { payouts: Payout[] }) {
    /**
     * Format currency amount to display in a consistent format
     * Converts cents to dollars and adds currency symbol
     * 
     * @param {number} amount - The payout amount in cents
     * @returns {string} Formatted currency string
     */
    const formatAmount = (amount: number): string => {
        return `$${(amount / 100).toFixed(2)}`;
    };

    /**
     * Returns appropriate CSS classes based on payout status
     * Provides visual differentiation between payout states
     * 
     * @param {string} status - The current status of the payout
     * @returns {string} CSS class names for styling
     */
    const getStatusClasses = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'text-green-600';
            case 'pending':
                return 'text-amber-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <>
            {/* Payout history table with responsive design */}
            <Table>
                <TableCaption>All your payouts</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                
                {/* Table body with conditional rendering for empty state */}
                <TableBody>
                    {payouts.length > 0 ? (
                        // Map each payout to a table row with formatted data
                        payouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell>{formatAmount(payout.amount)}</TableCell>
                                <TableCell className={getStatusClasses(payout.status)}>
                                    {payout.status}
                                </TableCell>
                                <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        // Empty state row when no payouts exist
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                No payouts found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    )
}

export default PayoutsTable;