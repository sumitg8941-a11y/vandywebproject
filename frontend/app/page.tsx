import GeoDetect from './GeoDetect';
import MyRetailers from './MyRetailers';
import HomeHero from './HomeHero';
import SocialProof from './SocialProof';
import PushNotification from './PushNotification';
import AdSlot from './AdSlot';
import CategoriesNav from './CategoriesNav';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getCountries() {
  try {
    const res = await fetch(`${API}/api/countries`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) { 
    console.error("Fetch error (countries):", err);
    return null; 
  }
}

async function getTopRetailers() {
  try {
    const [retRes, countRes] = await Promise.all([
      fetch(`${API}/api/retailers?limit=10&sort=clicks`, { cache: 'no-store' }),
      fetch(`${API}/api/offer-counts`, { cache: 'no-store' })
    ]);
    const retailers = retRes.ok ? await retRes.json() : [];
    const offerCounts = countRes.ok ? await countRes.json() : {};
    
    if (!Array.isArray(retailers)) return [];
    return retailers.map((r: any) => ({ ...r, offerCount: (offerCounts && offerCounts[r.id]) || 0 }));
  } catch (err) {
    console.error("Fetch error (top retailers):", err);
    return [];
  }
}

async function getLatestOffers() {
  try {
    const [offRes, retRes] = await Promise.all([
      fetch(`${API}/api/offers?limit=8`, { cache: 'no-store' }),
      fetch(`${API}/api/retailers`, { cache: 'no-store' })
    ]);
    const offers = offRes.ok ? await offRes.json() : [];
    const retailers = retRes.ok ? await retRes.json() : [];
    
    if (!Array.isArray(offers)) return [];
    const retailerMap = Object.fromEntries(Array.isArray(retailers) ? retailers.map((r: any) => [r.id, r.name]) : []);
    return offers.map((o: any) => ({ ...o, retailerName: retailerMap[o.retailerId] || o.retailerId }));
  } catch (err) {
    console.error("Fetch error (latest offers):", err);
    return [];
  }
}

async function getExpiringSoon() {
  try {
    const [offRes, retRes] = await Promise.all([
      fetch(`${API}/api/offers/expiring-soon`, { cache: 'no-store' }),
      fetch(`${API}/api/retailers`, { cache: 'no-store' })
    ]);
    const offers = offRes.ok ? await offRes.json() : [];
    const retailers = retRes.ok ? await retRes.json() : [];
    
    if (!Array.isArray(offers)) return [];
    const retailerMap = Object.fromEntries(Array.isArray(retailers) ? retailers.map((r: any) => [r.id, r.name]) : []);
    return offers.map((o: any) => ({ ...o, retailerName: retailerMap[o.retailerId] || o.retailerId }));
  } catch (err) {
    console.error("Fetch error (expiring soon):", err);
    return [];
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${API}/api/settings`, { cache: 'no-store' });
    if (!res.ok) return {};
    return res.json();
  } catch (err) {
    console.error("Fetch error (settings):", err);
    return {};
  }
}

export default async function HomePage() {
  const [countries, topRetailers, latestOffers, expiringSoon, settings] = await Promise.all([
    getCountries(),
    getTopRetailers(),
    getLatestOffers(),
    getExpiringSoon(),
    getSettings(),
  ]);

  const heroImages = latestOffers.filter((o: any) => o.image).slice(0, 5);

  return (
    <div>
      <GeoDetect countries={(countries || []).map((c: any) => ({ id: c.id, name: c.name }))} />
      <CategoriesNav />
      <SocialProof />

      {/* Top horizontal ad — full width, above all content */}
      <div className="px-4 max-w-6xl mx-auto">
        <AdSlot format="horizontal" />
      </div>

      {/* Main content + sidebar ad (desktop only) */}
      <div className="max-w-6xl mx-auto px-4 flex gap-6 items-start">

        {/* Main content column */}
        <div className="flex-1 min-w-0">
          <MyRetailers />
          <HomeHero
            countries={countries}
            topRetailers={topRetailers}
            latestOffers={latestOffers}
            expiringSoon={expiringSoon}
            heroImages={heroImages}
            customHomeMessage={settings?.homeMessage}
          />
        </div>

        {/* Sidebar ad — desktop only, sticky */}
        <aside className="hidden xl:block flex-shrink-0 w-[300px]">
          <div className="sticky top-20">
            <AdSlot format="vertical" />
          </div>
        </aside>

      </div>

      <PushNotification />
    </div>
  );
}
