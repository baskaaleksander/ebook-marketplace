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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import api from "@/utils/axios";

function BoughtProductsTable({ orders }: { orders: Order[] }) {
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const openRefundDialog = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDialogOpen(true);
    };

    const handleRefund = async () => {
        if (!selectedOrderId) return;
        
        setIsSubmitting(selectedOrderId);
        try {
            await api.post('/stripe/order/refund', { id: selectedOrderId });
            // Close dialog on success
            setIsDialogOpen(false);
        } catch (error) {
            console.log("Error processing refund:", error);
        } finally {
            setIsSubmitting(null);
        }
    };

    return (
        <>
            <Table>
                <TableCaption>All your purchased orders</TableCaption>
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
                        <TableHead>Refund</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell><Link href={`/product/${order.product.id}`}>{order.product.title}</Link></TableCell>
                            <TableCell>{(order.amount / 100).toFixed(2)}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.refundId || ""}</TableCell>
                            <TableCell>{order.sellerId}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{order.status === 'REFUNDED' ? ' ' : <Link href={`https://${order.product.fileUrl}`} className="hover:underline">Download</Link>}</TableCell>
                            <TableCell>
                                {order.status !== 'REFUNDED' && (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => openRefundDialog(order.id)}
                                    >
                                        Refund
                                    </Button>
                                )}
                                {order.status === 'REFUNDED' && (
                                    <span className="text-gray-500">Already refunded</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
        </>
    )
}

export default BoughtProductsTable;