'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '../../Breadcrumbs';
import CouponReveal from '../../CouponReveal';
import FollowButton from '../../FollowButton';
import Tracker from '../../Tracker';
import SafeImage from '../../SafeImage';
import AdSlot from '../../AdSlot';
import { useLang } from '../../LangToggle';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

function getExpiryLabel(validUntil: string, t: any): { text: string; className: string } | null {
  if (!validUntil) return null;
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: t.expired || 'Expired', className: 'bg-gray-500 text-white' };
  if (days === 0) return { text: t.expiresToday || 'Expires today!', className: 'bg-red-600 text-white' };
  if (days <= 3) return { text: `${t.expiresIn || 'Expires in'} ${days}d`, className: 'bg-orange-500 text-white' };
  if (days <= 7) return { text: `${days} ${t.daysLeft || 'days left'}`, className: 'bg-yellow-500 text-gray-900' };
  return null;
}

export default function OffersPage({ params }: { params: any }) {
  const { t } = useLang();
  const [offers, setOffers] = useState<any[]>([]);
  const [retailer, setRetailer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { retailerId } = await params;
      const [offersRes, retailerRes] = await Promise.all([
        fetch(`${API}/api/offers/${retailerId}`),
        fetch(`${API}/api/retailer/${retailerId}`),
      ]);
      if (offersRes.ok) setOffers(await offersRes.json());
      if (retailerRes.ok) setRetailer(await retailerRes.json());
      setLoading(false);
    }
    load();
  }, [params]);

  if (loading) return <div className="p-20 text-center"><i className="fa-solid fa-spinner fa-spin text-4xl text-red-600"></i></div>;

  const retailerId = retailer?.id || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';
  const whatsappText = encodeURIComponent(
    `🛍️ Check out ${retailer?.name || 'these'} deals on DealNamaa!\n${siteUrl}/offers/${retailerId}`
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          {retailer?.logo || retailer?.image ? (
            <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <SafeImage src={retailer.logo || retailer.image} alt={retailer.name} fill sizes="64px" className="object-contain p-2" />
            </div>
          ) : null}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">
              {retailer ? retailer.name : t.retailer}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {offers.length > 0
                ? `${offers.length} ${t.noActiveOffers || 'active offers'}`
                : t.heroSub}
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
                <i className="fa-solid fa-globe"></i> {t.visit} {t.retailer}
              </a>
            )}
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition text-sm"
            >
              <i className="fa-brands fa-whatsapp"></i> {t.share}
            </a>
            <Link href="/">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                &larr; {t.backTo} {t.home}
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
            <h2 className="text-xl font-bold mb-1">{t.noActiveOffers}</h2>
            <p>{t.tryAdjusting}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map((o: any) => {
              const expiryLabel = getExpiryLabel(o.validUntil, t);
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
                        {t.valid}: {o.validFrom ? new Date(o.validFrom).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''} &ndash; {o.validUntil ? new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : ''}
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
