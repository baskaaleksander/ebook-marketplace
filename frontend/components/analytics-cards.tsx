import { AnalyticsData } from "@/lib/definitions";
import { Card } from "./ui/card";

function AnalyticsCards({data} : {data: AnalyticsData}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Total Sales</h2>
          <p className="text-2xl font-bold">
            {((data.totalSoldOrders || 0) / 100).toFixed(2)} PLN
          </p>
          <p className="text-gray-500">Lifetime</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Total Sold Listings</h2>
          <p className="text-2xl font-bold">{data.totalSoldListings || 0}</p>
          <p className="text-gray-500">Lifetime</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Total Views</h2>
          <p className="text-2xl font-bold">{data.totalViews || 0}</p>
          <p className="text-gray-500">Lifetime</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Listings Count</h2>
          <p className="text-2xl font-bold">{data.totalListings || 0}</p>
          <p className="text-gray-500">Active</p>
        </Card>
      </div>

    )
}

export default AnalyticsCards;