import { Metadata } from "next";
import SoldOrders from "./sold-orders";

export const metadata : Metadata = {
    title: "Sold Orders | bookify",
    description: "Sold Orders page",
    openGraph: {
        title: "Sold Orders | bookify",
        description: "Sold Orders page",
    },
}

export default function SoldOrdersPage() {
    return <SoldOrders />
}