import { Metadata } from "next";
import Purchased from "./purchased";

export const metadata : Metadata = {
    title: "Purchased Products | bookify",
    description: "Purchased Products page",
    openGraph: {
        title: "Purchased Products | bookify",
        description: "Purchased Products page",
    },
}

export default function PurchasedProductsPage() {

    return <Purchased />
}