import api from "@/utils/axios";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

function ConnectStripeAccount() {
    const [loading, setLoading] = useState(false);
    const [accountUrl, setAccountUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
  
    const handleConnectStripe = async () => {
      try {
        setLoading(true);
        const response = await api.post('/stripe/connect');
        setAccountUrl(response.data.url);
        
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
          <CardHeader>
            <CardTitle className="text-2xl">Connect your Stripe account</CardTitle>
            <CardDescription>
              To receive payments from your book sales, you need to connect your Stripe account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                You won't be able to receive payouts until your Stripe account is verified.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-2">Benefits of connecting:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Receive payments directly to your bank account</li>
                <li>Track sales and payouts in one place</li>
                <li>Secure payment processing for your customers</li>
                <li>Automated tax calculations and reporting</li>
              </ul>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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