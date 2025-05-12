'use client';

import UserBalance from "@/components/user-balance";
import WalletSkeleton from "@/components/wallet-skeleton";
import { Balance, Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectStripeAccount from "@/components/connect-stripe-account";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import WalletTabs from "@/components/wallet-tabs";

/**
 * Wallet component handles financial operations and displays seller balance information
 * It shows available/pending balance, transactions, and payout options
 * Requires Stripe account verification to function
 */
function Wallet() {
    // Get authenticated user data and auth loading state from context
    const { user, loading: authLoading } = useAuth();
    
    // State for financial data and UI states
    const [balance, setBalance] = useState<Balance>(); // Available and pending balance amounts
    const [soldOrders, setSoldOrders] = useState<Order[]>([]); // Orders that generated revenue
    const [payouts, setPayouts] = useState<Payout[]>([]); // Previous payouts to bank account
    const [loading, setLoading] = useState(true); // Loading state for data fetching
    const [error, setError] = useState<string | null>(null); // Error state for API failures
    
    // Router for navigation if user is not authenticated
    const router = useRouter();
    
    // Controls which tab is currently active in the wallet interface
    const [activeTab, setActiveTab] = useState("orders"); // Options: "orders" or "payouts"

    /**
     * Effect to check authentication and redirect if not logged in
     * Ensures wallet page is only accessible to authenticated users
     */
    useEffect(() => {
        if (!authLoading && !user) {
          router.push('/login');
        }
      }, [user, router, authLoading]);
      
    /**
     * Effect to fetch financial data when component mounts
     * Only loads data if user has verified Stripe account
     * Makes multiple parallel API calls for different data types
     */
    useEffect(() => {
        const fetchData = async () => {
            // Skip fetching if auth is loading or user doesn't have verified Stripe account
            if (authLoading || !user || user.stripeStatus !== 'verified') return;
            
            try {
                setLoading(true);
                
                // Make parallel API calls for better performance
                const [balanceResponse, soldOrdersResponse, payoutsResponse] = await Promise.all([
                    api.get(`/stripe/balance`),
                    api.get(`/stripe/orders/sold/`),
                    api.get(`/stripe/payouts/`)
                ]);

                // Update state with fetched financial data
                setBalance(balanceResponse.data.data);
                setSoldOrders(soldOrdersResponse.data.data);
                setPayouts(payoutsResponse.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading]); // Re-fetch when auth state or user changes

    /**
     * Handles payout request flow and refreshes balance data
     * Called when user initiates a payout from available balance to bank account
     */
    const handlePayoutRequested = async () => {
        if (!user) return;
        
        try {
            // Refresh balance data to show updated amounts after payout
            const balanceResponse = await api.get(`/stripe/balance`);
            
            // Format balance data from API response
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
            
            // Update state with new balance information
            setBalance(extractedBalance);
            
            // Refresh payouts list to include the new payout
            const payoutsResponse = await api.get(`/stripe/payouts/`);
            setPayouts(payoutsResponse.data);
            
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };

    // Don't render anything if user isn't loaded yet
    if (!user) {
      return null;
    }

    // Show Stripe onboarding if user doesn't have a verified account
    if (user.stripeStatus !== 'verified') {
      return (
        <div className="container mx-auto px-4 py-12 h-screen">
            <ConnectStripeAccount />
        </div>
      );
    }

    // Show skeleton loader while data is being fetched
    if (loading) {
        return <WalletSkeleton />;
    }    

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Display error message if API request failed */}
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {/* Page header */}
            <h1 className="text-3xl font-bold mb-6">Wallet</h1>
            
            {/* Balance card with payout functionality */}
            {balance && (
                <UserBalance 
                    balance={balance} 
                    onPayoutRequested={handlePayoutRequested} 
                />
            )}
            
            {/* Tabbed interface for orders and payouts history */}
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