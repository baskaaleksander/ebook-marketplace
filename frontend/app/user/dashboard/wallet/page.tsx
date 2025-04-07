'use client';

import UserBalance from "@/components/user-balance";
import SoldOrdersTable from "@/components/sold-orders-table";
import PayoutsTable from "@/components/payouts-table";
import { Balance, Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectStripeAccount from "@/components/connect-stripe-account";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

function Wallet() {
    const { user, loading: authLoading } = useAuth();
    const [balance, setBalance] = useState<Balance>();
    const [soldOrders, setSoldOrders] = useState<Order[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("orders");

    useEffect(() => {
        if (!authLoading && !user) {
          router.push('/login');

        }
      }, [user, router, authLoading]);
    useEffect(() => {
        const fetchData = async () => {
            if (authLoading || !user || user.stripeStatus !== 'verified') return;
            
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

    const handlePayoutRequested = async () => {
        if (!user) return;
        
        try {
            const balanceResponse = await api.get(`/stripe/balance`);
            
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
            
            const payoutsResponse = await api.get(`/stripe/payouts/`);
            setPayouts(payoutsResponse.data);
            
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };

    if (!user) {
      return null;
    }

    if (user.stripeStatus !== 'verified') {
      return (
        <div className="container mx-auto px-4 py-12 h-screen">
            <ConnectStripeAccount />
        </div>
    );
    }

    if (loading) {
        return <div className="container flex items-center justify-center h-screen">
            <div className="text-center py-10">Loading your financial information...</div>
        </div>;
    }    

    return (
        <div className="container mx-auto px-4 py-8 h-screen">
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <h1 className="text-3xl font-bold mb-6">Wallet</h1>
            
            {balance && (
                <UserBalance 
                    balance={balance} 
                    onPayoutRequested={handlePayoutRequested} 
                />
            )}
            
            <Tabs 
                defaultValue="overview" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="mt-8"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sold Orders</CardTitle>
                            <CardDescription>
                                Track all your successful sales and their statuses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {soldOrders.length > 0 ? (
                                <SoldOrdersTable orders={soldOrders} />
                            ) : (
                                <p className="text-center py-6 text-gray-500 italic">
                                    You haven't sold any orders yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="payouts" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription>
                                View your completed and pending payouts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {payouts.length > 0 ? (
                                <PayoutsTable payouts={payouts} />
                            ) : (
                                <p className="text-center py-6 text-gray-500 italic">
                                    You haven't made any payout requests yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Wallet;