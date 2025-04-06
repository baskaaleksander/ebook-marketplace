import { Order } from "@/lib/definitions";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

function SoldOrdersTable({ orders }: { orders: Order[] }) {

    return (
        <>
            <Table>
                <TableCaption>All your sold orders</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Refund ID</TableHead>
                        <TableHead>Buyer ID</TableHead>
                        <TableHead>Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.amount}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.refundId || ""}</TableCell>
                            <TableCell>{order.buyerId}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default SoldOrdersTable;