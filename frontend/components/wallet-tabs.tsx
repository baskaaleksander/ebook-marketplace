import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SoldOrdersTable from "@/components/sold-orders-table";
import PayoutsTable from "@/components/payouts-table";
import { Order, Payout } from "@/lib/definitions";

interface WalletTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  soldOrders: Order[];
  payouts: Payout[];
}

function WalletTabs({ activeTab, setActiveTab, soldOrders, payouts }: WalletTabsProps) {
  return (
    <Tabs 
      defaultValue="orders" 
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
                You haven&apos;t sold any orders yet.
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
                You haven&apos;t made any payout requests yet.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default WalletTabs;