import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '../../Breadcrumbs';
import CouponReveal from '../../CouponReveal';
import FollowButton from '../../FollowButton';
import Tracker from '../../Tracker';

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
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-16 px-4 shadow-md">
        {retailer?.logo || retailer?.image ? (
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 bg-white rounded-xl shadow-md overflow-hidden">
              <Image
                src={retailer.logo || retailer.image}
                alt={retailer.name}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </div>
          </div>
        ) : null}
        <h1 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-md uppercase tracking-tight">
          {retailer ? retailer.name : 'Retailer Offers'}
        </h1>
        <p className="text-lg md:text-xl mb-6 font-medium opacity-90">
          {offers.length > 0
            ? `${offers.length} active ${offers.length === 1 ? 'offer' : 'offers'} available`
            : 'Browse the latest deals and flyers.'}
        </p>
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <Link href="/">
            <button className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500 transition shadow-sm text-sm">
              &larr; Back to Home
            </button>
          </Link>
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-bold transition shadow-sm text-sm"
          >
            <i className="fa-brands fa-whatsapp"></i> Share
          </a>
        </div>
        <div className="mt-4">
          <FollowButton retailerId={retailerId} retailerName={retailer?.name || 'this retailer'} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <Tracker type="retailer" id={retailerId} />
        <Breadcrumbs type="retailer" id={retailerId} />
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
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
                      <Image
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
                        {o.validFrom ? new Date(o.validFrom).toLocaleDateString() : ''} &ndash; {o.validUntil ? new Date(o.validUntil).toLocaleDateString() : ''}
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
