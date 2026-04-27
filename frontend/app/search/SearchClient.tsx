'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialCityId = searchParams.get('cityId') || 'all';
  const initialRetailerId = searchParams.get('retailerId') || 'all';
  const initialValidity = searchParams.get('validity') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [cityId, setCityId] = useState(initialCityId);
  const [retailerId, setRetailerId] = useState(initialRetailerId);
  const [validity, setValidity] = useState(initialValidity);
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<{ retailers: any[]; offers: any[] }>({ retailers: [], offers: [] });
  const [filters, setFilters] = useState<{ categories: string[]; cities: any[]; retailers: any[] }>({ categories: [], cities: [], retailers: [] });
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/search/filters`)
      .then(res => res.json())
      .then(data => setFilters(data))
      .catch(err => console.error('Failed to fetch filters:', err));
  }, [apiBaseUrl]);

  const updateURL = (newQuery: string, newCategory: string, newCityId: string, newRetailerId: string, newValidity: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    if (newCityId && newCityId !== 'all') params.set('cityId', newCityId);
    if (newRetailerId && newRetailerId !== 'all') params.set('retailerId', newRetailerId);
    if (newValidity && newValidity !== 'all') params.set('validity', newValidity);
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (category && category !== 'all') params.set('category', category);
        if (cityId && cityId !== 'all') params.set('cityId', cityId);
        if (retailerId && retailerId !== 'all') params.set('retailerId', retailerId);
        if (validity && validity !== 'all') params.set('validity', validity);
        const res = await fetch(`${apiBaseUrl}/api/search?${params.toString()}`);
        const data = await res.json();
        if (active) setResults(data);
      } catch (err) {
        console.error(err);
      }
      if (active) setLoading(false);
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [query, category, cityId, retailerId, validity, apiBaseUrl]);

  const handleQueryChange = (v: string) => { setQuery(v); updateURL(v, category, cityId, retailerId, validity); };
  const handleCategoryChange = (v: string) => { setCategory(v); updateURL(query, v, cityId, retailerId, validity); };
  const handleCityChange = (v: string) => { setCityId(v); setRetailerId('all'); updateURL(query, category, v, 'all', validity); };
  const handleRetailerChange = (v: string) => { setRetailerId(v); updateURL(query, category, cityId, v, validity); };
  const handleValidityChange = (v: string) => { setValidity(v); updateURL(query, category, cityId, retailerId, v); };
  const clearFilters = () => { setQuery(''); setCategory('all'); setCityId('all'); setRetailerId('all'); setValidity('all'); router.push('/search', { scroll: false }); };

  const activeFiltersCount = [category !== 'all', cityId !== 'all', retailerId !== 'all', validity !== 'all'].filter(Boolean).length;
  const filteredRetailers = cityId === 'all' ? filters.retailers : filters.retailers.filter((r: any) => r.cityId === cityId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-12 px-4 shadow-md">
        <h1 className="text-4xl font-black mb-4">Search Deals</h1>
        <p className="opacity-95">Find coupons, offers, and retailers</p>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search for electronics, groceries, fashion..."
              className="w-full p-4 pr-12 text-lg border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
            />
            {loading && (
              <div className="absolute right-4 top-4">
                <i className="fa-solid fa-spinner fa-spin text-red-600"></i>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 w-full md:hidden flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
          >
            <i className="fa-solid fa-filter"></i>
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 font-semibold">Clear All</button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2"><i className="fa-solid fa-tag mr-2"></i>Category</label>
                <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none bg-white">
                  <option value="all">All Categories</option>
                  {filters.categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2"><i className="fa-solid fa-location-dot mr-2"></i>City</label>
                <select value={cityId} onChange={(e) => handleCityChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none bg-white">
                  <option value="all">All Cities</option>
                  {filters.cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2"><i className="fa-solid fa-store mr-2"></i>Retailer</label>
                <select value={retailerId} onChange={(e) => handleRetailerChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none bg-white" disabled={filteredRetailers.length === 0}>
                  <option value="all">All Retailers</option>
                  {filteredRetailers.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <i className="fa-solid fa-clock mr-2 text-orange-500"></i>Expiry
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'Any time', icon: '' },
                    { value: 'today', label: 'Today', icon: '🔥' },
                    { value: 'week', label: 'This week', icon: '⚡' },
                    { value: 'month', label: 'This month', icon: '📅' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleValidityChange(opt.value)}
                      className={`text-xs font-bold py-2 px-2 rounded-lg border transition text-center ${
                        validity === opt.value
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
                      }`}
                    >
                      {opt.icon && <span className="mr-1">{opt.icon}</span>}{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <p className="text-sm text-gray-600">Active Filters:</p>
                  {category !== 'all' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Category: <strong>{category}</strong></span>
                      <button onClick={() => handleCategoryChange('all')} className="text-red-600"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  )}
                  {cityId !== 'all' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">City: <strong>{filters.cities.find(c => c.id === cityId)?.name}</strong></span>
                      <button onClick={() => handleCityChange('all')} className="text-red-600"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  )}
                  {retailerId !== 'all' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Retailer: <strong>{filters.retailers.find(r => r.id === retailerId)?.name}</strong></span>
                      <button onClick={() => handleRetailerChange('all')} className="text-red-600"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {(results.retailers.length > 0 || results.offers.length > 0) && (
              <div className="mb-4 text-gray-600">
                Found <strong>{results.retailers.length}</strong> retailer(s) and <strong>{results.offers.length}</strong> offer(s)
              </div>
            )}

            {results.retailers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Retailers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.retailers.map((r: any) => (
                    <Link href={`/offers/${r.id}`} key={r.id} className="bg-white p-4 rounded-lg shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative w-full h-16 mb-2">
                        <Image src={r.image} alt={r.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain" loading="lazy" />
                      </div>
                      <p className="font-bold text-center text-sm">{r.name}</p>
                      {r.category && <p className="text-xs text-gray-500 text-center mt-1">{r.category}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.offers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Offers</h2>
                <div className="space-y-4">
                  {results.offers.map((o: any) => (
                    <Link href={`/view/${o.id}`} key={o.id} className="block bg-white p-4 rounded-lg shadow hover:shadow-xl transition-all duration-300">
                      <div className="flex gap-4">
                        {o.image && (
                          <div className="relative w-20 h-20 flex-shrink-0">
                            <Image src={o.image} alt={o.title} fill sizes="80px" className="object-cover rounded" loading="lazy" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{o.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {o.badge && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-semibold">{o.badge}</span>}
                            {o.category && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{o.category}</span>}
                          </div>
                          {o.couponCode && <p className="text-sm text-gray-600 mt-2"><i className="fa-solid fa-ticket mr-1"></i>Code: <strong>{o.couponCode}</strong></p>}
                          {o.validUntil && (
                            <p className="text-xs text-gray-500 mt-2">
                              <i className="fa-regular fa-calendar mr-1"></i>
                              Valid until: {new Date(o.validUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.retailers.length === 0 && results.offers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <i className="fa-solid fa-magnifying-glass text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl text-gray-600 mb-2">No results found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-red-600 hover:underline font-semibold">
            <i className="fa-solid fa-arrow-left mr-2"></i>Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchClient() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
