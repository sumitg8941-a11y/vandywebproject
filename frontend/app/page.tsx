import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './SearchBar';

async function getCountries() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/countries`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  } catch (error) {
    return null;
  }
}

async function getTopRetailers() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const [all, offerCounts] = await Promise.all([
      fetch(`${apiBaseUrl}/api/retailers`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${apiBaseUrl}/api/offer-counts`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    return all.slice(0, 10).map((r: any) => ({ ...r, offerCount: offerCounts[r.id] || 0 }));
  } catch (error) {
    return [];
  }
}

async function getLatestOffers() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/offers`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch offers');
    const all = await res.json();
    return all.slice(0, 8);
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const [countries, topRetailers, latestOffers] = await Promise.all([
    getCountries(),
    getTopRetailers(),
    getLatestOffers(),
  ]);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white text-center py-24 px-4 shadow-md relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg uppercase tracking-tight">Massive Savings & Top Offers</h1>
          <p className="text-xl md:text-2xl mb-10 font-medium opacity-95 drop-shadow-md">Explore thousands of flyers, coupons, and discounts from top retailers.</p>
          <SearchBar />
        </div>
      </div>

      {/* Countries */}
      <div className="max-w-6xl mx-auto p-6 mt-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Select a Country</h2>

        {countries === null ? (
          <div className="text-center p-10 bg-red-100 text-red-700 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> Server Error</h2>
            <p>Could not connect to the backend. Is your Node.js server running on port 3000?</p>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center p-10 bg-blue-100 text-blue-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-database"></i> Database is Empty</h2>
            <p>Connection successful! But there are no countries in the database yet. Log in to the Admin Panel to add some.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {countries.map((c: any) => (
              <Link href={`/cities/${c.id || c._id}`} key={c.id || c._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Retailers anchor section */}
      <div id="retailers" className="max-w-6xl mx-auto p-6 mt-12 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 border-b pb-2">
          <h2 className="text-3xl font-bold text-gray-800">Top Retailers</h2>
          <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
            View All <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {topRetailers.length === 0 ? (
          <div className="text-center p-10 bg-gray-100 text-gray-600 rounded-lg">
            <p>No retailers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {topRetailers.map((r: any) => (
              <Link href={`/offers/${r.id || r._id}`} key={r.id || r._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <Image
                      src={r.logo || r.image}
                      alt={r.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{r.name}</h3>
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      <i className="fa-solid fa-tag mr-1"></i>{r.offerCount} {r.offerCount === 1 ? 'offer' : 'offers'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Coupons / Latest Offers anchor section */}
      <div id="coupons" className="max-w-6xl mx-auto p-6 mt-12 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 border-b pb-2">
          <h2 className="text-3xl font-bold text-gray-800">Latest Coupons & Offers</h2>
          <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
            View All <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {latestOffers.length === 0 ? (
          <div className="text-center p-10 bg-gray-100 text-gray-600 rounded-lg">
            <p>No offers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {latestOffers.map((o: any) => (
              <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-orange-400 group relative">
                  {o.badge && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
                      {o.badge}
                    </div>
                  )}
                  <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                    <Image
                      src={o.image}
                      alt={o.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{o.title}</h3>
                    {o.validUntil && (
                      <p className="text-xs text-gray-500 mt-1">
                        <i className="fa-regular fa-calendar mr-1"></i>
                        Until {new Date(o.validUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
