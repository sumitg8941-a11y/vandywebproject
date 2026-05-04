import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../Breadcrumbs';
import Tracker from '../../Tracker';
import SafeImage from '../../SafeImage';
import AdSlot from '../../AdSlot';
import RetailerGrid from './RetailerGrid';

async function getRetailers(cityId: string) {
  try {
    const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const [retailers, offerCounts] = await Promise.all([
      fetch(`${apiBaseUrl}/api/retailers/${cityId}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${apiBaseUrl}/api/offer-counts`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    return retailers.map((r: any) => ({ ...r, offerCount: offerCounts[r.id] || 0 }));
  } catch {
    return [];
  }
}

async function getCity(cityId: string) {
  try {
    const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/breadcrumbs/city/${cityId}`, { cache: 'no-store' });
    const data = await res.json();
    return data.city || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ cityId: string }> }): Promise<Metadata> {
  const { cityId } = await params;
  const city = await getCity(cityId);
  const name = city?.name || 'City';
  return {
    title: `Retailers in ${name}`,
    description: `Browse top retailers and latest offers in ${name} on DealNamaa.`,
    openGraph: {
      title: `Retailers in ${name} | DealNamaa`,
      description: `Browse top retailers and latest offers in ${name} on DealNamaa.`,
    },
  };
}

export default async function RetailersPage({ params }: { params: Promise<{ cityId: string }> }) {
  const { cityId } = await params;
  const retailers = await getRetailers(cityId);

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">Shop Top Retailers</h1>
            <p className="text-sm text-gray-500 mt-1">Find the latest catalogs and offers from your favorite brands.</p>
          </div>
          <Link href="/">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
              &larr; Back
            </button>
          </Link>
        </div>
        <AdSlot format="horizontal" />
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <Tracker type="city" id={cityId} />
        <Breadcrumbs type="city" id={cityId} />
      </div>

      <div className="max-w-6xl mx-auto px-6"><AdSlot format="horizontal" /></div>

      {/* Retailers Grid */}
      <div className="max-w-6xl mx-auto p-6 mt-2">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Retailers in this City</h2>
        
        {retailers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Retailers Found</h2>
            <p>We couldn&apos;t find any retailers for this city. Please check back later.</p>
          </div>
        ) : (
          <RetailerGrid retailers={retailers} />
        )}
      </div>
    </div>
  );
}