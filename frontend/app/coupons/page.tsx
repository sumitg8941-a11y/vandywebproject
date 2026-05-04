import CouponsClient from './CouponsClient';

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
    const retMap = Object.fromEntries(retailers.map((r: any) => [r.id, r]));
    return offers.map((o: any) => {
      const ret = retMap[o.retailerId] || {};
      return { 
        ...o, 
        retailerName: ret.name || o.retailerId,
        retailerName_ar: ret.name_ar,
        retailerName_ur: ret.name_ur,
        retailerName_hi: ret.name_hi
      };
    });
  } catch {
    return [];
  }
}

export default async function CouponsPage() {
  const [coupons, latest] = await Promise.all([getOffersWithCoupons(), getLatestOffers()]);
  return <CouponsClient coupons={coupons} latest={latest} />;
}
