import { Metadata } from "next";
import Wallet from "./wallet";

export const metadata: Metadata = {
    title: "Wallet | bookify",
    description: "Wallet page",
    openGraph: {
        title: "Wallet | bookify",
        description: "Wallet page",
    },
}

export default function WalletPage() {
    return <Wallet />
}