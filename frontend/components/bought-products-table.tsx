import { Order, Product } from "@/lib/definitions";
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
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import Link from "next/link";

function BoughtProductsTable({ orders }: { orders: Order[] }) {


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
                            <TableCell><Link href={`https://${order.product.fileUrl}`} className="hover:underline">Download</Link></TableCell>
                            <TableCell>Refund</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

export default BoughtProductsTable;