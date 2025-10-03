"use client"

const RequestCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4 animate-pulse">
      {/* Top Section */}
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full bg-gray-300 mr-4"></div>
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Middle Section (Urgency Meter) */}
      <div>
        <div className="w-full bg-gray-300 rounded-full h-1.5"></div>
        <div className="h-4 w-48 bg-gray-300 rounded mt-1.5"></div>
      </div>

      {/* Bottom Section (Action Buttons) */}
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-gray-300 rounded-lg"></div>
        <div className="flex-1 h-12 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default RequestCardSkeleton;