'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SafeImage from '../../SafeImage';
import { useLang } from '../../LangToggle';

interface Retailer {
  id: string;
  _id?: string;
  name: string;
  name_ar?: string;
  name_ur?: string;
  name_hi?: string;
  logo?: string;
  image?: string;
  category?: string;
  offerCount: number;
}

export default function RetailerGrid({ retailers }: { retailers: Retailer[] }) {
  const { lang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(retailers.map(r => r.category || 'Other'));
    return ['All', ...Array.from(cats).sort()];
  }, [retailers]);

  const filtered = activeCategory === 'All'
    ? retailers
    : retailers.filter(r => (r.category || 'Other') === activeCategory);

  return (
    <>
      {/* Category Filters */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border ${
                activeCategory === cat
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1 text-xs opacity-75">({retailers.filter(r => (r.category || 'Other') === cat).length})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
          <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Retailers Found</h2>
          <p>No retailers match this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filtered.map((r) => (
            <Link href={`/offers/${r.id || r._id}`} key={r.id || r._id}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                <div className="overflow-hidden h-32 relative">
                  <SafeImage 
                    src={r.logo || r.image || ''} 
                    alt={r.name} 
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-3 text-center border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">
                    {(lang !== 'en' && (r as any)[`name_${lang}`]) ? (r as any)[`name_${lang}`] : r.name}
                  </h3>
                  {r.category && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{r.category}</p>
                  )}
                  <p className="text-xs text-red-600 font-semibold mt-1">
                    <i className="fa-solid fa-tag mr-1"></i>{r.offerCount} {r.offerCount === 1 ? t.offer : t.offers}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
