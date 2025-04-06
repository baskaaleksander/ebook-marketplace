'use client';

import UserBalance from "@/components/user-balance";
import { Balance, Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectStripeAccount from "@/components/connect-stripe-account";

function Wallet() {
    const { user } = useAuth();
    const [balance, setBalance] = useState<Balance>();
    const [soldOrders, setSoldOrders] = useState<Order[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push('/');
      }
    }, [user, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || user.stripeStatus !== 'verified') return;
            
            try {
                setLoading(true);
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

    if (!user) {
      return null;
    }

    if (user.stripeStatus !== 'verified') {
      return <ConnectStripeAccount />;
    }

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }    
    return (
        <div className="container mx-auto px-4 py-8">
            {error && <div className="text-center py-10 text-red-500">{error}</div>}
            {balance ? <UserBalance balance={balance} /> : <div className="text-center py-10">No balance data available.</div>}
            {soldOrders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Sold Orders</h2>
                    <ul className="space-y-4">
                        {soldOrders.map((order) => (
                            <li key={order.id} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium
                                            ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`
                                        }>
                                            {order.status}
                                        </span>
                                        <p className="text-right font-semibold mt-1">
                                            ${(order.amount / 100).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {payouts.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Payouts</h2>
                    <ul className="space-y-4">
                        {payouts.map((payout) => (
                            <li key={payout.id} className="bg-white p-4 rounded-lg shadow">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">Payout #{payout.id.substring(0, 8)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium
                                            ${payout.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                              payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`
                                        }>
                                            {payout.status}
                                        </span>
                                        <p className="text-right font-semibold mt-1">
                                            ${(payout.amount / 100).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Wallet;