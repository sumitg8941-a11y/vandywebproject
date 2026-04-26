"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{ retailers: any[]; offers: any[] }>({ retailers: [], offers: [] });
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    let active = true;

    if (!query.trim()) {
      setTimeout(() => {
        if (active) setResults({ retailers: [], offers: [] });
      }, 0);
      return () => { active = false; };
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';
        const res = await fetch(`${apiBaseUrl}/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (active) setResults(data);
      } catch (err) {
        console.error(err);
      }
      if (active) setLoading(false);
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-12 px-4 rounded-xl mb-8">
        <h1 className="text-4xl font-black mb-4">Search Deals</h1>
        <p className="opacity-95">Find coupons, offers, and retailers</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for electronics, groceries, fashion..."
          className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
        />
        
        {loading && (
          <div className="absolute right-4 top-4">
            <i className="fa-solid fa-spinner fa-spin text-red-600"></i>
          </div>
        )}
      </div>

      {/* Results */}
      {results.retailers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Retailers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.retailers.map((r: any) => (
              <Link href={`/offers/${r.id}`} key={r.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <img src={r.image} alt={r.name} className="w-full h-16 object-contain mb-2" />
                <p className="font-bold text-center">{r.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.offers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Offers</h2>
          <div className="space-y-4">
            {results.offers.map((o: any) => (
              <Link href={`/view/${o.id}`} key={o.id} className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex gap-4">
                  {o.image && <img src={o.image} alt={o.title} className="w-20 h-20 object-cover rounded" />}
                  <div>
                    <h3 className="font-bold">{o.title}</h3>
                    {o.badge && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">{o.badge}</span>}
                    {o.couponCode && <p className="text-sm text-gray-600">Code: {o.couponCode}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.retailers.length === 0 && results.offers.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p>No results found for &quot;{query}&quot;</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-red-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}