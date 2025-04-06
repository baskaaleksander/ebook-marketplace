import { Balance } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Clock } from "lucide-react";
import { useState } from "react";
import api from "@/utils/axios";
import { toast } from "sonner";

function UserBalance({ balance, onPayoutRequested }: { 
    balance: Balance, 
    onPayoutRequested?: () => void 
  }) {    const [isLoading, setIsLoading] = useState(false);
    
    const availableAmount = balance.available.amount / 100;
    const pendingAmount = balance.pending.amount / 100;
    const currency = balance.available.currency.toUpperCase();
    
    const handleRequestPayout = async () => {
        if (availableAmount <= 0) return;
        
        try {
            setIsLoading(true);
            await api.post('/stripe/payouts/create');
            
            toast.success("Payout requested", {
                description: `Your payout for ${currency} ${availableAmount.toFixed(2)} has been requested.`,
            });

            if (onPayoutRequested) {
                onPayoutRequested();
            }
            
        } catch (error) {
            console.error("Error requesting payout:", error);
            toast.error("Payout failed", {
                description: "There was an error requesting your payout. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card className="bg-white border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <BadgeDollarSign className="h-5 w-5 text-blue-500" />
                        Available Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold mb-4">
                        {currency} {availableAmount.toFixed(2)}
                    </p>
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
            
            <Card className="bg-gray-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        Pending Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
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