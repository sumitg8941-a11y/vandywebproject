import Link from 'next/link';
import SafeImage from '../SafeImage';
import CouponReveal from '../CouponReveal';
import AdSlot from '../AdSlot';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export const metadata = {
  title: 'Coupons & Deals',
  description: 'Browse all active coupon codes and deals on DealNamaa. Save big with exclusive promo codes from top retailers.',
};

async function getOffersWithCoupons() {
  try {
    const [offers, retailers] = await Promise.all([
      fetch(`${API}/api/offers?limit=50`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API}/api/retailers`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    const retMap = Object.fromEntries(retailers.map((r: any) => [r.id, r]));
    return offers
      .filter((o: any) => o.couponCode)
      .map((o: any) => ({ ...o, retailer: retMap[o.retailerId] || null }));
  } catch {
    return [];
  }
}

async function getLatestOffers() {
  try {
    const [offers, retailers] = await Promise.all([
      fetch(`${API}/api/offers?limit=12`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API}/api/retailers`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    const retMap = Object.fromEntries(retailers.map((r: any) => [r.id, r.name]));
    return offers.map((o: any) => ({ ...o, retailerName: retMap[o.retailerId] || o.retailerId }));
  } catch {
    return [];
  }
}

export default async function CouponsPage() {
  const [coupons, latest] = await Promise.all([getOffersWithCoupons(), getLatestOffers()]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <span className="inline-block bg-green-100 text-green-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
          Save More
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Coupons & Promo Codes</h1>
        <p className="text-gray-600">Tap to reveal exclusive coupon codes from top retailers.</p>
      </div>

      <AdSlot format="horizontal" />

      {/* Coupon Cards */}
      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {coupons.map((o: any) => (
            <div key={o.id || o._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                {o.retailer?.logo || o.retailer?.image ? (
                  <div className="relative w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <SafeImage src={o.retailer.logo || o.retailer.image} alt={o.retailer.name} fill sizes="40px" className="object-contain p-1" />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-800 truncate">{o.title}</h3>
                  <p className="text-xs text-gray-500">{o.retailer?.name || o.retailerId}</p>
                </div>
              </div>
              {o.badge && (
                <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full mb-3">{o.badge}</span>
              )}
              <CouponReveal code={o.couponCode} />
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>
                  <i className="fa-regular fa-calendar mr-1"></i>
                  Until {new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}
                </span>
                <Link href={`/view/${o.id || o._id}`} className="text-red-600 font-bold hover:underline">
                  View Deal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-yellow-50 rounded-xl border border-yellow-200 mt-6">
          <i className="fa-solid fa-ticket text-4xl text-yellow-400 mb-3"></i>
          <h2 className="text-xl font-bold text-gray-800">No Coupons Yet</h2>
          <p className="text-gray-600 text-sm mt-1">Check back soon for exclusive promo codes!</p>
        </div>
      )}

      <AdSlot format="horizontal" className="mt-8" />

      {/* Latest Offers */}
      <div className="mt-12">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Latest Offers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {latest.map((o: any) => (
            <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                  <SafeImage src={o.image} alt={o.title} fill sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-3 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-800 truncate">{o.title}</h3>
                  {o.retailerName && (
                    <p className="text-xs text-gray-500 truncate">
                      <i className="fa-solid fa-store mr-1 text-red-400"></i>{o.retailerName}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
