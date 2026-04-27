'use client';

import SafeImage from './SafeImage';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { useLang } from './LangToggle';

function getDaysLeft(validUntil: string) {
  return Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getUrgencyBadge(validUntil: string, createdAt?: string): { text: string; cls: string } | null {
  const days = getDaysLeft(validUntil);
  if (days <= 0) return null;
  if (days === 1) return { text: 'Expires today!', cls: 'bg-red-600 text-white' };
  if (days <= 3) return { text: `${days} days left`, cls: 'bg-orange-500 text-white' };
  if (days <= 7) return { text: `${days} days left`, cls: 'bg-yellow-500 text-gray-900' };
  if (createdAt) {
    const addedDaysAgo = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (addedDaysAgo <= 7) return { text: 'New this week', cls: 'bg-green-500 text-white' };
  }
  return null;
}

export default function HomeHero({
  countries,
  topRetailers,
  latestOffers,
  expiringSoon,
  heroImages,
}: {
  countries: any[] | null;
  topRetailers: any[];
  latestOffers: any[];
  expiringSoon: any[];
  heroImages: any[];
}) {
  const { t } = useLang();

  return (
    <div>
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-white text-center md:text-left">
            <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              {t.newDeals}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight drop-shadow whitespace-pre-line">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 font-medium max-w-xl">
              {t.heroSub}
            </p>
            <SearchBar />
            <p className="mt-4 text-sm opacity-70">
              <i className="fa-solid fa-location-dot mr-1"></i>
              {t.coveringCities}
            </p>
          </div>
          {heroImages.length >= 4 && (
            <div className="hidden md:grid grid-cols-2 gap-2 flex-shrink-0 w-72 lg:w-96" style={{ gridTemplateRows: 'repeat(2, 1fr)' }}>
              {[...heroImages, ...heroImages].slice(0, 4).map((o: any, i: number) => (
                <div key={i} className="relative rounded-xl overflow-hidden shadow-xl" style={{ height: '140px' }}>
                  <SafeImage src={o.image} alt="" fill sizes="200px" className="object-cover" priority={i < 2} />
                  <div className="absolute inset-0 bg-black/10 rounded-xl" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Countries ── */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-globe text-red-600"></i> {t.selectCountry}
        </h2>
        {countries === null ? (
          <div className="text-center p-10 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
            <p className="font-bold">{t.backendError}</p>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center p-10 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
            <i className="fa-solid fa-database text-3xl mb-3"></i>
            <p className="font-bold">{t.noCountries}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {countries.map((c: any) => (
              <Link href={`/cities/${c.id || c._id}`} key={c.id || c._id}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <SafeImage src={c.image} alt={c.name} fill sizes="(max-width: 640px) 50vw, 20vw"
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
            <i className="fa-solid fa-store text-red-600"></i> {t.topRetailers}
          </h2>
          <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
            {t.viewAll} <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>
        {topRetailers.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
            <p>{t.noRetailers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {topRetailers.map((r: any) => (
              <Link href={`/offers/${r.id || r._id}`} key={r.id || r._id}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <SafeImage src={r.logo || r.image} alt={r.name} fill sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{r.name}</h3>
                    {r.category && (
                      <span className="inline-block text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1">{r.category}</span>
                    )}
                    {(r.offerCount ?? 0) > 0 ? (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        <i className="fa-solid fa-tag mr-1"></i>{r.offerCount} {r.offerCount === 1 ? t.offer : t.offers}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">{t.noActiveOffers}</p>
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
              <i className="fa-solid fa-clock text-orange-500"></i> {t.expiringWeek}
              <span className="text-sm font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-1">{t.dontMiss}</span>
            </h2>
            <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
              {t.viewAll} <i className="fa-solid fa-arrow-right ml-1"></i>
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
                      <SafeImage src={o.image} alt={o.title} fill sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <h3 className="text-xs font-bold text-gray-800 truncate">{o.title}</h3>
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        <i className="fa-regular fa-calendar mr-1"></i>
                        {t.until} {new Date(o.validUntil).toLocaleDateString()}
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
            <i className="fa-solid fa-ticket text-red-600"></i> {t.latestOffers}
          </h2>
          <Link href="/search" className="text-red-600 font-semibold hover:underline text-sm">
            {t.viewAll} <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>
        {latestOffers.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
            <p>{t.noOffers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {latestOffers.map((o: any) => {
              const urgency = o.validUntil ? getUrgencyBadge(o.validUntil, o.createdAt) : null;
              return (
                <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-red-200 group relative">
                    {urgency && (
                      <div className={`absolute top-2 right-2 z-10 text-xs font-bold px-2 py-1 rounded shadow ${urgency.cls}`}>
                        {urgency.text}
                      </div>
                    )}
                    {o.badge && (
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        {o.badge}
                      </div>
                    )}
                    <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                      <SafeImage src={o.image} alt={o.title} fill sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
                          {t.until} {new Date(o.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
