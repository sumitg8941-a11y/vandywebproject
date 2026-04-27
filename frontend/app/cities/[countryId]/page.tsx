import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '../../Breadcrumbs';
import Tracker from '../../Tracker';

async function getRegions(countryId: string) {
  try {
    const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/regions/${countryId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return { states: [], directCities: [] };
  }
}

async function getCountry(countryId: string) {
  try {
    const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/countries`, { cache: 'no-store' });
    const countries = await res.json();
    return countries.find((c: any) => c.id === countryId) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ countryId: string }> }): Promise<Metadata> {
  const { countryId } = await params;
  const country = await getCountry(countryId);
  const name = country?.name || 'Region';
  return {
    title: `${name} - Cities & Deals`,
    description: `Browse states and cities with top retail offers in ${name} on DealNamaa.`,
    openGraph: {
      title: `${name} - Cities & Deals | DealNamaa`,
      description: `Browse states and cities with top retail offers in ${name} on DealNamaa.`,
    },
  };
}

function RegionCard({ href, image, name, tag, tagColor = 'red' }: { href: string; image: string; name: string; tag?: string; tagColor?: 'red' | 'orange' }) {
  const pillCls = tagColor === 'orange'
    ? 'bg-orange-100 text-orange-600'
    : 'bg-red-100 text-red-600';
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
        <div className="overflow-hidden h-24 relative">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-3 text-center">
          <h3 className="text-sm font-bold text-gray-800">{name}</h3>
          {tag && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${pillCls}`}>
              {tag}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function CitiesPage({ params }: { params: Promise<{ countryId: string }> }) {
  const { countryId } = await params;
  const [regions, country] = await Promise.all([getRegions(countryId), getCountry(countryId)]);

  const states: any[] = regions.states || [];
  const directCities: any[] = regions.directCities || [];
  const hasStates = states.length > 0;
  const hasDirectCities = directCities.length > 0;
  const isEmpty = !hasStates && !hasDirectCities;

  return (
    <div>
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 text-white text-center py-16 px-4 shadow-md">
        <h1 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-md uppercase tracking-tight">
          {country?.name || 'Browse Deals'}
        </h1>
        <p className="text-lg md:text-xl font-medium opacity-90">
          {hasStates && hasDirectCities
            ? 'Browse by state or jump straight to your city'
            : hasStates
            ? 'Select your state to find local deals'
            : 'Select your city to find local deals'}
        </p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-5 py-2 rounded-lg font-semibold transition text-sm">
              &larr; All Countries
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Tracker type="country" id={countryId} />
        <Breadcrumbs type="country" id={countryId} />
      </div>

      {isEmpty && (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-10 text-yellow-800">
            <i className="fa-solid fa-triangle-exclamation text-3xl mb-3 block"></i>
            <h2 className="text-xl font-bold">No regions found</h2>
            <p className="text-sm mt-2">No states or cities have been added for this country yet.</p>
          </div>
        </div>
      )}

      {/* Unified grid — states first, then direct cities */}
      {!isEmpty && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 text-red-600 rounded-lg p-2">
              <i className="fa-solid fa-map-location-dot text-lg"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Where are you shopping?</h2>
              <p className="text-sm text-gray-500">Pick your region or city to see local deals</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {states.map((s: any) => (
              <RegionCard
                key={s.id}
                href={`/cities/state/${s.id}`}
                image={s.image}
                name={s.name}
                tag="Region"
                tagColor="red"
              />
            ))}
            {directCities.map((c: any) => (
              <RegionCard
                key={c.id}
                href={`/retailers/${c.id}`}
                image={c.image}
                name={c.name}
                tag="City"
                tagColor="orange"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
