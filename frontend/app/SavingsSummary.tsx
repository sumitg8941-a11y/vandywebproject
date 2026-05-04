'use client';

interface Offer {
  id: string;
  title: string;
  badge?: string;
  discountPercent?: number;
}

/**
 * Returns discount % as an integer (0–100).
 * Prefers the explicit discountPercent field; falls back to parsing badge text.
 * Uses integer math (* 100) to avoid floating-point drift.
 */
function getDiscount(offer: Offer): number {
  if (offer.discountPercent && offer.discountPercent > 0) {
    // Integer math: ensure it's a clean integer
    return Math.min(Math.round(offer.discountPercent * 100) / 100, 100) | 0;
  }
  if (!offer.badge) return 0;
  const match = offer.badge.match(/(\d+)/);
  return match ? Math.min(parseInt(match[1], 10), 100) : 0;
}

export default function SavingsSummary({ offers }: { offers: Offer[] }) {
  if (!offers.length) return null;

  const discounts = offers.map(o => getDiscount(o)).filter(d => d > 0);
  // Integer math: sum * 100 / length / 100 avoids floating-point drift in the average
  const avgDiscount = discounts.length
    ? Math.round((discounts.reduce((a, b) => a * 100 + b * 100, 0) / discounts.length) / 100)
    : 0;
  const offersWithDiscount = discounts.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-red-600/80 to-orange-500/80 backdrop-blur-md shadow-xl p-5 text-white mb-8">
      {/* Glassmorphism inner glow */}
      <div className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-piggy-bank text-lg"></i>
        </div>
        <div>
          <h2 className="font-black text-lg leading-tight">Savings Summary</h2>
          <p className="text-white/70 text-xs">{offers.length} saved deal{offers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-2xl font-black">{offersWithDiscount}</p>
          <p className="text-xs text-white/80 mt-0.5">Deals with discount</p>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <p className="text-2xl font-black">{avgDiscount > 0 ? `${avgDiscount}%` : '—'}</p>
          <p className="text-xs text-white/80 mt-0.5">Avg. discount</p>
        </div>
      </div>

      {offersWithDiscount === 0 && (
        <p className="relative text-xs text-white/60 mt-3 text-center">
          Add offers with discount badges to see savings stats.
        </p>
      )}
    </div>
  );
}
