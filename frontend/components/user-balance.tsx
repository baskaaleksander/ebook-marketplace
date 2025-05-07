import { Balance } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Clock } from "lucide-react";
import { useState } from "react";
import api from "@/utils/axios";
import { toast } from "sonner";

/**
 * UserBalance component displays a seller's financial information
 * Shows available and pending balances with the ability to request payouts
 * Provides visual feedback during payout requests with loading states
 * 
 * @param {Object} props - Component props
 * @param {Balance} props.balance - Balance data with available and pending amounts
 * @param {Function} props.onPayoutRequested - Optional callback after successful payout request
 */
function UserBalance({ balance, onPayoutRequested }: { 
    balance: Balance, 
    onPayoutRequested?: () => void 
  }) {
    // State for tracking payout request processing
    const [isLoading, setIsLoading] = useState(false);
    
    // Convert amounts from cents to dollars/currency units for display
    const availableAmount = balance.available.amount / 100;
    const pendingAmount = balance.pending.amount / 100;
    const currency = balance.available.currency.toUpperCase();
    
    /**
     * Handles user request for payout of available funds
     * Makes API call to create a payout through Stripe
     * Shows success/failure notifications and invokes callback on success
     */
    const handleRequestPayout = async () => {
        // Don't attempt payout if no funds are available
        if (availableAmount <= 0) return;
        
        try {
            // Set loading state and make API request
            setIsLoading(true);
            await api.post('/stripe/payouts/create');
            
            // Show success notification
            toast.success("Payout requested");

            // Invoke callback if provided to update parent component
            if (onPayoutRequested) {
                onPayoutRequested();
            }
            
        } catch (error) {
            // Handle and log errors
            console.error("Error requesting payout:", error);
            toast.error("Payout failed");
        } finally {
            // Reset loading state regardless of outcome
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
            {/* Available balance card */}
            <Card className="bg-white border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <BadgeDollarSign className="h-5 w-5 text-blue-500" />
                        Available Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Format currency with two decimal places */}
                    <p className="text-3xl font-bold mb-4">
                        {currency} {availableAmount.toFixed(2)}
                    </p>
                    {/* Only show payout button when funds are available */}
                    {availableAmount > 0 && (
                        <Button 
                            onClick={handleRequestPayout} 
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Processing..." : "Request Payout"}
                        </Button>
                    )}
                </CardContent>
            </Card>
            
            {/* Pending balance card */}
            <Card className="bg-gray-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        Pending Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Format currency with two decimal places */}
                    <p className="text-3xl font-bold text-gray-700">
                        {currency} {pendingAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Pending balances become available after customer payment processing completes.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default UserBalance;