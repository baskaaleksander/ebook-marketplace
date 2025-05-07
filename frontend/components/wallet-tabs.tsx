import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SoldOrdersTable from "@/components/sold-orders-table";
import PayoutsTable from "@/components/payouts-table";
import { Order, Payout } from "@/lib/definitions";

/**
 * Interface for WalletTabs component props
 * Defines state and data requirements for the tabbed interface
 */
interface WalletTabsProps {
  activeTab: string;             // Current active tab identifier
  setActiveTab: (value: string) => void;  // Function to change the active tab
  soldOrders: Order[];           // Array of orders sold by the user
  payouts: Payout[];             // Array of payout records for the user
}

/**
 * WalletTabs component provides a tabbed interface for financial data
 * Allows users to switch between viewing sold orders and payout history
 * Each tab has its own card with appropriate data display or empty state
 * 
 * @param {WalletTabsProps} props - Component properties
 * @param {string} props.activeTab - Currently selected tab identifier
 * @param {Function} props.setActiveTab - Tab change handler function
 * @param {Order[]} props.soldOrders - Sales history data to display
 * @param {Payout[]} props.payouts - Payout history data to display
 */
function WalletTabs({ activeTab, setActiveTab, soldOrders, payouts }: WalletTabsProps) {
  return (
    <Tabs 
      defaultValue="orders" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="mt-8"
    >
      {/* Tab navigation buttons */}
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="payouts">Payouts</TabsTrigger>
      </TabsList>
      
      {/* Orders tab content - shows sold order history */}
      <TabsContent value="orders" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Sold Orders</CardTitle>
            <CardDescription>
              Track all your successful sales and their statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Conditional rendering based on data availability */}
            {soldOrders.length > 0 ? (
              // Show orders table when data exists
              <SoldOrdersTable orders={soldOrders} />
            ) : (
              // Show empty state message when no orders exist
              <p className="text-center py-6 text-gray-500 italic">
                You haven&apos;t sold any orders yet.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Payouts tab content - shows payout history */}
      <TabsContent value="payouts" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>
              View your completed and pending payouts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Conditional rendering based on data availability */}
            {payouts.length > 0 ? (
              // Show payouts table when data exists
              <PayoutsTable payouts={payouts} />
            ) : (
              // Show empty state message when no payouts exist
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