import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '../../Breadcrumbs';

// Fetch regions (states or cities) from your Node.js Backend API
async function getRegions(countryId: string) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/regions/${countryId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch regions');
    return res.json();
  } catch (error) {
    return { type: 'cities', data: [] };
  }
}

export default async function CitiesPage({ params }: { params: { countryId: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const regions = await getRegions(resolvedParams.countryId);
  const isStates = regions.type === 'states';
  const items = regions.data;

  return (
    <div>
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-20 px-4 shadow-md">
        <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md uppercase tracking-tight">Choose Your {isStates ? 'State' : 'City'}</h1>
        <p className="text-xl md:text-2xl mb-8 font-medium opacity-95 drop-shadow-sm">Find the best local deals and offers near you.</p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-md font-bold hover:bg-yellow-500 transition shadow-sm">
              &larr; Back to Countries
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <Breadcrumbs type="country" id={resolvedParams.countryId} />
      </div>

      {/* Regions Grid */}
      <div className="max-w-6xl mx-auto p-6 mt-2">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">{isStates ? 'States' : 'Cities'} in this Region</h2>
        
        {items.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No {isStates ? 'States' : 'Cities'} Found</h2>
            <p>We couldn't find any {isStates ? 'states' : 'cities'} for this country. Please check back later or add some via the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((c: any) => (
              <Link href={isStates ? `/cities/state/${c.id || c._id}` : `/retailers/${c.id || c._id}`} key={c.id || c._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                  <div className="overflow-hidden h-24 relative">
                    <Image 
                      src={c.image} 
                      alt={c.name} 
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
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