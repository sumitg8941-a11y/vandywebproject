'use client';

import { useEffect, useState } from 'react';

export default function SocialProof() {
  const [stats, setStats] = useState({ visits: 0, totalSaves: 0, avgRating: 0, totalRatings: 0 });
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/social-proof`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [apiBaseUrl]);

  if (stats.visits === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-4">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-users text-2xl"></i>
          <div>
            <div className="text-2xl font-black">{(stats.visits / 1000).toFixed(1)}K+</div>
            <div className="text-xs opacity-90">Visitors</div>
          </div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-white/30"></div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-bookmark text-2xl"></i>
          <div>
            <div className="text-2xl font-black">{(stats.totalSaves / 1000).toFixed(1)}K+</div>
            <div className="text-xs opacity-90">Deals Saved</div>
          </div>
        </div>
        {stats.avgRating > 0 && (
          <>
            <div className="hidden sm:block w-px h-10 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-star text-2xl text-yellow-300"></i>
              <div>
                <div className="text-2xl font-black">{stats.avgRating.toFixed(1)}★</div>
                <div className="text-xs opacity-90">from {stats.totalRatings} reviews</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
