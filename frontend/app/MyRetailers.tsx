'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFollowedRetailers } from './FollowButton';

interface Retailer {
  id: string;
  name: string;
  image: string;
  offerCount?: number;
}

export default function MyRetailers() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  async function load() {
    const ids = getFollowedRetailers();
    if (ids.length === 0) { setRetailers([]); return; }
    try {
      const [allRetailers, offerCounts] = await Promise.all([
        fetch(`${apiBaseUrl}/api/retailers`).then(r => r.json()),
        fetch(`${apiBaseUrl}/api/offer-counts`).then(r => r.json()),
      ]);
      const followed = ids
        .map((id: string) => allRetailers.find((r: any) => r.id === id))
        .filter(Boolean)
        .map((r: any) => ({ ...r, offerCount: offerCounts[r.id] || 0 }));
      setRetailers(followed);
    } catch { setRetailers([]); }
  }

  useEffect(() => {
    load();
    window.addEventListener('dn_follow_change', load);
    return () => window.removeEventListener('dn_follow_change', load);
  }, []);

  if (retailers.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-heart text-red-600"></i> My Retailers
          <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-1">
            {retailers.length}
          </span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {retailers.map(r => (
          <Link href={`/offers/${r.id}`} key={r.id}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-red-100 group">
              <div className="overflow-hidden h-24 relative">
                <Image
                  src={r.image}
                  alt={r.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 text-center border-t border-red-50">
                <h3 className="text-sm font-bold text-gray-800 truncate">{r.name}</h3>
                {r.offerCount > 0 ? (
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    <i className="fa-solid fa-tag mr-1"></i>{r.offerCount} {r.offerCount === 1 ? 'offer' : 'offers'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">No active offers</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
