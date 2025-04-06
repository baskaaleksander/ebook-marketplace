'use client';

import { Balance, Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Wallet() {

    const { user } = useAuth();
    const [balance, setBalance] = useState<Balance>();
    const [soldOrders, setSoldOrders] = useState<Order[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    if(!user) {
        router.push('/')
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceResponse, soldOrdersResponse, payoutsResponse] = await Promise.all([
                    api.get(`/stripe/balance`),
                    api.get(`/stripe/orders/sold/`),
                    api.get(`/stripe/payouts/`)
                ]);

                const extractedBalance = {
                    available: {
                      amount: balanceResponse.data.available[0].amount, 
                      currency: balanceResponse.data.available[0].currency
                    },
                    pending: {
                      amount: balanceResponse.data.pending[0].amount,
                      currency: balanceResponse.data.pending[0].currency
                    }
                  };

                setBalance(extractedBalance);
                setSoldOrders(soldOrdersResponse.data);
                setPayouts(payoutsResponse.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }
    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }
    
    return (
        <div>
            {balance && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Balance</h2>
                    <p>Available: {balance.available.amount / 100} {balance.available.currency}</p>
                    <p>Pending: {balance.pending.amount / 100} {balance.pending.currency}</p>
                </div>
            )}
            {soldOrders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Sold Orders</h2>
                    <ul>
                        {soldOrders.map((order) => (
                            <li key={order.id} className="mb-2">
                                Order ID: {order.id}, Amount: {order.amount}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {payouts.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Payouts</h2>
                    <ul>
                        {payouts.map((payout) => (
                            <li key={payout.id} className="mb-2">
                                Payout ID: {payout.id}, Amount: {payout.amount}, Status: {payout.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default Wallet;