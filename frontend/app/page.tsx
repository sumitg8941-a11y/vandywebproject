import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './SearchBar';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getCountries() {
  try {
    const res = await fetch(`${API}/api/countries`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    return res.json();
  } catch { return null; }
}

async function getTopRetailers() {
  try {
    const [retailers, offerCounts] = await Promise.all([
      fetch(`${API}/api/retailers?limit=10&sort=clicks`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API}/api/offer-counts`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    return retailers.map((r: any) => ({ ...r, offerCount: offerCounts[r.id] || 0 }));
  } catch { return []; }
}

async function getLatestOffers() {
  try {
    const res = await fetch(`${API}/api/offers?limit=8`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    return res.json();
  } catch { return []; }
}

async function getExpiringSoon() {
  try {
    const res = await fetch(`${API}/api/offers/expiring-soon`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    return res.json();
  } catch { return []; }
}

function getDaysLeft(validUntil: string) {
  return Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function HomePage() {
  const [countries, topRetailers, latestOffers, expiringSoon] = await Promise.all([
    getCountries(),
    getTopRetailers(),
    getLatestOffers(),
    getExpiringSoon(),
  ]);

  // Pick up to 5 offer images for the hero mosaic
  const heroImages = latestOffers.filter((o: any) => o.image).slice(0, 5);

  return (
    <div>
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          {/* Left: copy + search */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              🔥 New deals every week
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-lg leading-tight">
              Find the Best<br />Deals Near You
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 font-medium max-w-lg">
              Browse thousands of flyers, coupons, and exclusive offers from top retailers — all in one place.
            </p>
            <SearchBar />
            <p className="mt-4 text-sm opacity-70">
              <i className="fa-solid fa-location-dot mr-1"></i>
              Covering retailers across multiple cities &amp; regions
            </p>
          </div>

          {/* Right: live offer mosaic */}
          {heroImages.length > 0 && (
            <div className="hidden md:grid grid-cols-3 gap-2 flex-shrink-0 w-72">
              {heroImages.slice(0, 3).map((o: any, i: number) => (
                <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}
                  className={`relative rounded-xl overflow-hidden shadow-lg border-2 border-white/20 hover:scale-105 transition-transform duration-300 ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                  <Image src={o.image} alt={o.title} fill sizes="200px" className="object-cover" />
                  {o.badge && (
                    <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {o.badge}
                    </span>
                  )}
                </Link>
              ))}
              {heroImages.slice(3, 5).map((o: any) => (
                <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}
                  className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white/20 hover:scale-105 transition-transform duration-300 aspect-square">
                  <Image src={o.image} alt={o.title} fill sizes="100px" className="object-cover" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Countries ── */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-globe text-red-600"></i> Select a Country
        </h2>

        {countries === null ? (
          <div className="text-center p-10 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
            <p className="font-bold">Could not connect to the backend. Is your server running on port 3000?</p>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center p-10 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
            <i className="fa-solid fa-database text-3xl mb-3"></i>
            <p className="font-bold">No countries yet. Add some via the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {countries.map((c: any) => (
              <Link href={`/cities/${c.id || c._id}`} key={c.id || c._id}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <Image src={c.image} alt={c.name} fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-bold text-gray-800">{c.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Top Retailers ── */}
      <div id="retailers" className="max-w-6xl mx-auto px-4 mt-14 scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-store text-red-600"></i> Top Retailers
          </h2>
          <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
            View All <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {topRetailers.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
            <p>No retailers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {topRetailers.map((r: any) => (
              <Link href={`/offers/${r.id || r._id}`} key={r.id || r._id}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <Image src={r.logo || r.image} alt={r.name} fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
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
        )}
      </div>

      {/* ── Expiring Soon ── */}
      {expiringSoon.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-clock text-orange-500"></i> Expiring This Week
              <span className="text-sm font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">Don&apos;t miss out!</span>
            </h2>
            <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
              View All <i className="fa-solid fa-arrow-right ml-1"></i>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {expiringSoon.map((o: any) => {
              const days = getDaysLeft(o.validUntil);
              return (
                <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-orange-200 group relative">
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      {days === 0 ? 'Today!' : `${days}d left`}
                    </div>
                    {o.badge && (
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        {o.badge}
                      </div>
                    )}
                    <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                      <Image src={o.image} alt={o.title} fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" />
                    </div>
                    <div className="p-3 border-t border-orange-100">
                      <h3 className="text-xs font-bold text-gray-800 truncate">{o.title}</h3>
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        <i className="fa-regular fa-calendar mr-1"></i>
                        Until {new Date(o.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Latest Coupons & Offers ── */}
      <div id="coupons" className="max-w-6xl mx-auto px-4 mt-14 scroll-mt-20 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-ticket text-red-600"></i> Latest Coupons &amp; Offers
          </h2>
          <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
            View All <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {latestOffers.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
            <p>No offers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {latestOffers.map((o: any) => (
              <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-red-200 group relative">
                  {o.badge && (
                    <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      {o.badge}
                    </div>
                  )}
                  <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                    <Image src={o.image} alt={o.title} fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy" />
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-800 truncate mb-1">{o.title}</h3>
                    {o.retailerId && (
                      <p className="text-xs text-gray-500 truncate">
                        <i className="fa-solid fa-store mr-1 text-red-400"></i>{o.retailerId}
                      </p>
                    )}
                    {o.validUntil && (
                      <p className="text-xs text-gray-400 mt-1">
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
