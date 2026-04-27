import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '../../Breadcrumbs';
import Tracker from '../../Tracker';

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
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-20 px-4 shadow-md">
        <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md uppercase tracking-tight">Shop Top Retailers</h1>
        <p className="text-xl md:text-2xl mb-8 font-medium opacity-95 drop-shadow-sm">Find the latest catalogs and offers from your favorite brands.</p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-md font-bold hover:bg-yellow-500 transition shadow-sm">
              &larr; Back to Regions
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <Tracker type="city" id={cityId} />
        <Breadcrumbs type="city" id={cityId} />
      </div>

      {/* Retailers Grid */}
      <div className="max-w-6xl mx-auto p-6 mt-2">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Retailers in this City</h2>
        
        {retailers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Retailers Found</h2>
            <p>We couldn&apos;t find any retailers for this city. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {retailers.map((r: any) => (
              <Link href={`/offers/${r.id || r._id}`} key={r.id || r._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                  <div className="overflow-hidden h-32 relative">
                    <Image 
                      src={r.logo || r.image} 
                      alt={r.name} 
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-3 text-center border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">{r.name}</h3>
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      <i className="fa-solid fa-tag mr-1"></i>{r.offerCount} {r.offerCount === 1 ? 'offer' : 'offers'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}