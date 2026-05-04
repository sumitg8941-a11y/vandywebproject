'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeImage from '../SafeImage';
import SavingsSummary from '../SavingsSummary';
import ShoppingRoute from '../ShoppingRoute';

interface Offer {
  id: string;
  title: string;
  image?: string;
  badge?: string;
  validUntil?: string;
  retailerId?: string;
}

export default function SavedPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedIds: string[] = JSON.parse(localStorage.getItem('dn_saved_offers') || '[]');
    if (!savedIds.length) { setLoading(false); return; }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    fetch(`${apiBase}/api/offers?includeExpired=true`)
      .then(r => r.json())
      .then((all: Offer[]) => {
        setOffers(all.filter(o => savedIds.includes(o.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unsave = (id: string) => {
    const updated = offers.filter(o => o.id !== id);
    setOffers(updated);
    localStorage.setItem('dn_saved_offers', JSON.stringify(updated.map(o => o.id)));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 min-h-[60vh]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <i className="fa-solid fa-heart text-red-500"></i>
          Saved Offers
        </h1>
        <p className="text-gray-500 mt-1">Your bookmarked deals, all in one place.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse">
              <div className="h-40 bg-gray-100 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && offers.length === 0 && (
        <div className="text-center py-24">
          <i className="fa-regular fa-heart text-6xl text-gray-200 mb-4 block"></i>
          <p className="text-xl font-semibold text-gray-400">No saved offers yet</p>
          <p className="text-gray-400 mt-1 mb-6">Tap the heart on any offer to save it here.</p>
          <Link href="/search" className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition">
            Browse Offers
          </Link>
        </div>
      )}

      {!loading && offers.length > 0 && (
        <>
          <SavingsSummary offers={offers} />
          <ShoppingRoute offers={offers} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {offers.map(offer => {
            const daysLeft = offer.validUntil
              ? Math.ceil((new Date(offer.validUntil).getTime() - Date.now()) / 86400000)
              : null;
            const expired = daysLeft !== null && daysLeft < 0;

            return (
              <div key={offer.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
                {offer.badge && (
                  <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {offer.badge}
                  </span>
                )}
                <button
                  onClick={() => unsave(offer.id)}
                  className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
                  title="Remove from saved"
                >
                  <i className="fa-solid fa-heart text-xs"></i>
                </button>

                <Link href={`/view/${offer.id}`}>
                  <div className="relative h-40 overflow-hidden bg-gray-50">
                    <SafeImage
                      src={offer.image || ''}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug h-10">{offer.title}</p>
                    {daysLeft !== null && (
                      <p className={`text-[11px] mt-1 font-bold uppercase tracking-tight ${expired ? 'text-gray-400' : daysLeft <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                        {expired ? 'Expired' : daysLeft === 0 ? 'Expires today!' : `${daysLeft}d left`}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
