'use client';

import { useMemo } from 'react';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  badge?: string;
  retailerId?: string;
}

export default function ShoppingRoute({ offers }: { offers: Offer[] }) {
  const sorted = useMemo(() => {
    const groups = offers.reduce<Record<string, Offer[]>>((acc, offer) => {
      const key = offer.retailerId || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(offer);
      return acc;
    }, {});
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [offers]);

  if (!offers.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-black text-gray-800 mb-3 flex items-center gap-2">
        <i className="fa-solid fa-route text-red-500"></i>
        Shopping Route
      </h2>
      <div className="space-y-3">
        {sorted.map(([retailerId, items], idx) => (
          <div
            key={retailerId}
            className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <Link
                  href={`/offers/${retailerId}`}
                  className="font-bold text-gray-800 hover:text-red-600 transition-colors capitalize"
                >
                  {retailerId.replace(/-/g, ' ')}
                </Link>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {items.length} deal{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className="space-y-1 pl-8">
              {items.map(offer => (
                <li key={offer.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <i className="fa-solid fa-circle-check text-green-500 text-xs flex-shrink-0"></i>
                  <Link href={`/view/${offer.id}`} className="hover:text-red-600 transition-colors truncate">
                    {offer.title}
                  </Link>
                  {offer.badge && (
                    <span className="flex-shrink-0 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      {offer.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
