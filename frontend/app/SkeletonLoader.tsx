'use client';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-24 bg-gray-200"></div>
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonOfferCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[3/4] bg-gray-200"></div>
      <div className="p-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
