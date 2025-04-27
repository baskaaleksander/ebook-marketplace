
interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

function TableSkeleton({ rowCount = 5, columnCount = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden animate-pulse">
      {/* Table header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex px-4 py-3">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <div 
              key={`header-${colIndex}`} 
              className="flex-1 h-6 bg-gray-300 rounded mr-2"
            />
          ))}
        </div>
      </div>

      {/* Table body */}
      <div className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex px-4 py-4">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                className="flex-1 h-5 bg-gray-200 rounded mr-2"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;