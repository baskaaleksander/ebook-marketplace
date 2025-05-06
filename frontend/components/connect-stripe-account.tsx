import api from "@/utils/axios";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

/**
 * ConnectStripeAccount component facilitates seller onboarding with Stripe Connect
 * Allows users to connect their Stripe account to receive payments from product sales
 * Redirects to Stripe's onboarding flow when initiated
 */
function ConnectStripeAccount() {
    // State for tracking API request and error handling
    const [loading, setLoading] = useState(false); // Controls button loading state
    const [error, setError] = useState<string | null>(null); // Stores error message if connection fails
  
    /**
     * Initiates the Stripe Connect onboarding process
     * Makes API call to generate a Stripe Connect URL and redirects user
     * Handles loading state and potential errors
     */
    const handleConnectStripe = async () => {
      try {
        setLoading(true);
        // Request Stripe Connect onboarding URL from backend
        const response = await api.post('/stripe/connect');
        
        // Redirect user to Stripe's onboarding page
        window.location.href = response.data.url;
      } catch (err) {
        console.error("Error creating Stripe account link:", err);
        setError("Failed to connect with Stripe. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          {/* Card header explaining the purpose of Stripe connection */}
          <CardHeader>
            <CardTitle className="text-2xl">Connect your Stripe account</CardTitle>
            <CardDescription>
              To receive payments from your book sales, you need to connect your Stripe account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Important notice about account verification requirement */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                You won&apos;t be able to create listings until your Stripe account is verified.
              </AlertDescription>
            </Alert>
            
            {/* Benefits section highlighting advantages of connecting Stripe */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-2">Benefits of connecting:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Receive payments directly to your bank account</li>
                <li>Track sales and payouts in one place</li>
                <li>Secure payment processing for your customers</li>
                <li>Automated tax calculations and reporting</li>
              </ul>
            </div>
            
            {/* Conditional error message display if connection attempt fails */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Connect button with loading state */}
            <div className="flex justify-center">
              <Button 
                onClick={handleConnectStripe} 
                disabled={loading}
                className="flex items-center gap-2"
                size="lg"
              >
                {loading ? "Connecting..." : "Connect with Stripe"} 
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
export default ConnectStripeAccount;