'use client';

import UserBalance from "@/components/user-balance";
import { Balance, Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectStripeAccount from "@/components/connect-stripe-account";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import WalletTabs from "@/components/wallet-tabs";

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
    }, [user, authLoading]);

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
            
            <WalletTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                soldOrders={soldOrders} 
                payouts={payouts}
            />
        </div>
    );
}

export default Wallet;