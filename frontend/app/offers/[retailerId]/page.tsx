import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../Breadcrumbs';
import CouponReveal from '../../CouponReveal';
import FollowButton from '../../FollowButton';
import Tracker from '../../Tracker';
import SafeImage from '../../SafeImage';
import AdSlot from '../../AdSlot';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getPageData(retailerId: string) {
  const [offersRes, retailerRes] = await Promise.all([
    fetch(`${API}/api/offers/${retailerId}`, { cache: 'no-store' }),
    fetch(`${API}/api/retailer/${retailerId}`, { cache: 'no-store' }),
  ]);
  const offers = offersRes.ok ? await offersRes.json() : [];
  const retailer = retailerRes.ok ? await retailerRes.json() : null;
  return { offers, retailer };
}

export async function generateMetadata({ params }: { params: Promise<{ retailerId: string }> }): Promise<Metadata> {
  const { retailerId } = await params;
  const { retailer } = await getPageData(retailerId);
  const name = retailer?.name || 'Retailer';
  const image = retailer?.logo || retailer?.image;
  return {
    title: `${name} Offers & Flyers`,
    description: `Browse the latest coupons, flyers, and deals from ${name} on DealNamaa.`,
    openGraph: {
      title: `${name} Offers & Flyers | DealNamaa`,
      description: `Browse the latest coupons, flyers, and deals from ${name} on DealNamaa.`,
      ...(image && { images: [{ url: image }] }),
    },
  };
}

function getExpiryLabel(validUntil: string): { text: string; className: string } | null {
  if (!validUntil) return null;
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: 'Expired', className: 'bg-gray-500 text-white' };
  if (days === 0) return { text: 'Expires today!', className: 'bg-red-600 text-white' };
  if (days <= 3) return { text: `Expires in ${days}d`, className: 'bg-orange-500 text-white' };
  if (days <= 7) return { text: `${days} days left`, className: 'bg-yellow-500 text-gray-900' };
  return null;
}

export default async function OffersPage({ params }: { params: Promise<{ retailerId: string }> }) {
  const { retailerId } = await params;
  const { offers, retailer } = await getPageData(retailerId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';
  const whatsappText = encodeURIComponent(
    `🛍️ Check out ${retailer?.name || 'these'} deals on DealNamaa!\n${siteUrl}/offers/${retailerId}`
  );

  return (
    <div>
      {/* Compact Retailer Header */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          {retailer?.logo || retailer?.image ? (
            <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <SafeImage src={retailer.logo || retailer.image} alt={retailer.name} fill sizes="64px" className="object-contain p-2" />
            </div>
          ) : null}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
              {retailer ? retailer.name : 'Retailer Offers'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {offers.length > 0
                ? `${offers.length} active ${offers.length === 1 ? 'offer' : 'offers'} available`
                : 'Browse the latest deals and flyers.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {retailer?.websiteUrl && (
              <a
                href={`${API}/api/redirect/retailer/${retailer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition text-sm border border-gray-200"
              >
                <i className="fa-solid fa-globe"></i> Visit Website
              </a>
            )}
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm"
            >
              <i className="fa-brands fa-whatsapp"></i> Share
            </a>
            <Link href="/">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                &larr; Back
              </button>
            </Link>
          </div>
        </div>
        <FollowButton retailerId={retailerId} retailerName={retailer?.name || 'this retailer'} />
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-2">
        <Tracker type="retailer" id={retailerId} />
        <Breadcrumbs type="retailer" id={retailerId} />
      </div>

      <div className="max-w-6xl mx-auto px-4"><AdSlot format="horizontal" /></div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {offers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-3"></i>
            <h2 className="text-xl font-bold mb-1">No Active Offers</h2>
            <p>This retailer currently has no active offers. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map((o: any) => {
              const expiryLabel = getExpiryLabel(o.validUntil);
              return (
                <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-orange-300 group relative">
                    {o.badge && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                        {o.badge}
                      </div>
                    )}
                    {expiryLabel && (
                      <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded shadow z-10 ${expiryLabel.className}`}>
                        {expiryLabel.text}
                      </div>
                    )}
                    <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                      <SafeImage
                        src={o.image}
                        alt={o.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-800 truncate mb-1">{o.title}</h3>
                      <p className="text-xs text-gray-400">
                        <i className="fa-regular fa-calendar mr-1"></i>
                        {o.validFrom ? new Date(o.validFrom).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''} &ndash; {o.validUntil ? new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''}
                      </p>
                      {o.couponCode && <CouponReveal code={o.couponCode} />}
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
