import { Card } from "./ui/card";

function AnalyticsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`card-${i}`} className="p-6">
            <div className="flex flex-col space-y-2">
              {/* Card title */}
              <div className="h-5 w-24 bg-gray-300 rounded"></div>
              
              {/* Card value */}
              <div className="h-9 w-16 bg-gray-400 rounded"></div>
              
              {/* Card description */}
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    )
}

export default AnalyticsCardsSkeleton;