import GeoDetect from './GeoDetect';
import MyRetailers from './MyRetailers';
import HomeHero from './HomeHero';

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

export default async function HomePage() {
  const [countries, topRetailers, latestOffers, expiringSoon] = await Promise.all([
    getCountries(),
    getTopRetailers(),
    getLatestOffers(),
    getExpiringSoon(),
  ]);

  const heroImages = latestOffers.filter((o: any) => o.image).slice(0, 5);

  return (
    <div>
      <GeoDetect countries={(countries || []).map((c: any) => ({ id: c.id, name: c.name }))} />
      <MyRetailers />
      <HomeHero
        countries={countries}
        topRetailers={topRetailers}
        latestOffers={latestOffers}
        expiringSoon={expiringSoon}
        heroImages={heroImages}
      />
    </div>
  );
}
