'use client';

import SafeImage from './SafeImage';
import Link from 'next/link';
import SearchBar from './SearchBar';
import AdSlot from './AdSlot';
import { useLang } from './LangToggle';
import { SkeletonCard, SkeletonOfferCard } from './SkeletonLoader';

function getDaysLeft(validUntil: string) {
  return Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getUrgencyBadge(validUntil: string, t: any, createdAt?: string): { text: string; cls: string } | null {
  const days = getDaysLeft(validUntil);
  if (days <= 0) return null;
  if (days === 1) return { text: t.expiresToday, cls: 'bg-red-600 text-white' };
  if (days <= 3) return { text: `${days} ${t.daysLeft}`, cls: 'bg-orange-500 text-white' };
  if (days <= 7) return { text: `${days} ${t.daysLeft}`, cls: 'bg-yellow-500 text-gray-900' };
  if (createdAt) {
    const addedDaysAgo = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (addedDaysAgo <= 7) return { text: t.newThisWeek, cls: 'bg-green-500 text-white' };
  }
  return null;
}

export default function HomeHero({
  countries,
  topRetailers,
  latestOffers,
  expiringSoon,
  heroImages,
  customHomeMessage,
}: {
  countries: any[] | null;
  topRetailers: any[];
  latestOffers: any[];
  expiringSoon: any[];
  heroImages: any[];
  customHomeMessage?: string;
}) {
  const { lang, t } = useLang();

  return (
    <div>
      {/* ── Ad Slot ── */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <AdSlot format="horizontal" />
      </div>

      {/* ── Countries ── */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <div className="max-w-xl mx-auto mb-8">
          <SearchBar />
        </div>
        <div className="text-center mb-8">
          <span className="inline-block bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
            {t.startHere}
          </span>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{t.selectCountry}</h2>
          <p className="text-gray-600">{t.browseByLocation}</p>
        </div>
        {countries === null ? (
          <div className="text-center p-10 bg-red-50 text-red-700 rounded-xl border border-red-200">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
            <p className="font-bold">{t.backendError}</p>
          </div>
        ) : countries.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
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
                    <h3 className="text-sm font-bold text-gray-800">
                      {(lang !== 'en' && c[`name_${lang}`]) ? c[`name_${lang}`] : c.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Top Retailers ── */}
      <div id="retailers" className="max-w-6xl mx-auto px-4 mt-20 scroll-mt-20">
        <div className="text-center mb-8">
          <span className="inline-block bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
            {t.popularStores}
          </span>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{t.topRetailers}</h2>
          <p className="text-gray-600">{t.shopBrands}</p>
        </div>
        {topRetailers.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
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
                    <h3 className="text-sm font-bold text-gray-800 truncate">
                      {(lang !== 'en' && r[`name_${lang}`]) ? r[`name_${lang}`] : r.name}
                    </h3>
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
        <div className="bg-gradient-to-br from-orange-50 to-red-50 py-16 mt-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <span className="inline-block bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 animate-pulse">
                ⚡ Urgent
              </span>
              <h2 className="text-3xl font-black text-gray-900 mb-2">{t.expiringWeek}</h2>
              <p className="text-gray-700 font-semibold">{t.dontMiss}</p>
            </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {expiringSoon.map((o: any) => {
              const days = getDaysLeft(o.validUntil);
              return (
                <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-orange-200 group relative">
                    <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                      {days === 0 ? t.expiresToday : `${days}${t.daysLeft.split(' ')[0]} ${t.daysLeft.split(' ')[1] || ''}`}
                    </div>
                    {o.badge && (
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        {(lang !== 'en' && o[`badge_${lang}`]) ? o[`badge_${lang}`] : o.badge}
                      </div>
                    )}
                    <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                      <SafeImage src={o.image} alt={o.title} fill sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <h3 className="text-xs font-bold text-gray-800 truncate">
                        {(lang !== 'en' && o[`title_${lang}`]) ? o[`title_${lang}`] : o.title}
                      </h3>
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        <i className="fa-regular fa-calendar mr-1"></i>
                        {t.until} {new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* ── Latest Coupons & Offers ── */}
      <div id="coupons" className="max-w-6xl mx-auto px-4 mt-20 scroll-mt-20 mb-16">
        <div className="text-center mb-8">
          <span className="inline-block bg-green-100 text-green-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
            {t.freshDeals}
          </span>
          <h2 className="text-3xl font-black text-gray-900 mb-2">{t.latestOffers}</h2>
          <p className="text-gray-600">{t.justAdded}</p>
        </div>
        {latestOffers.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <SkeletonOfferCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {latestOffers.map((o: any) => {
              const urgency = o.validUntil ? getUrgencyBadge(o.validUntil, t, o.createdAt) : null;
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
                        {(lang !== 'en' && o[`badge_${lang}`]) ? o[`badge_${lang}`] : o.badge}
                      </div>
                    )}
                    <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                      <SafeImage src={o.image} alt={o.title} fill sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <h3 className="text-xs font-bold text-gray-800 truncate mb-1">
                        {(lang !== 'en' && o[`title_${lang}`]) ? o[`title_${lang}`] : o.title}
                      </h3>
                      {o.retailerName && (
                        <p className="text-xs text-gray-500 truncate">
                          <i className="fa-solid fa-store mr-1 text-red-400"></i>
                          {(lang !== 'en' && o[`retailerName_${lang}`]) ? o[`retailerName_${lang}`] : o.retailerName}
                        </p>
                      )}
                      {o.validUntil && (
                        <p className="text-xs text-gray-400 mt-1">
                          <i className="fa-regular fa-calendar mr-1"></i>
                          {t.until} {new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}
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
