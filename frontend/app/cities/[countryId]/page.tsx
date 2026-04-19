import Link from 'next/link';

// Fetch cities from your Node.js Backend API
async function getCities(countryId: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/cities/${countryId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function CitiesPage({ params }: { params: { countryId: string } }) {
  // Wait for params in Next.js 15+ (if using asynchronous params, but we can treat as a promise if needed. Next 15 often uses async params)
  const resolvedParams = await Promise.resolve(params);
  const cities = await getCities(resolvedParams.countryId);

  return (
    <div>
      {/* Hero Banner Section */}
      <div className="bg-blue-600 text-white text-center py-20 px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Choose Your City</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">Find the best local deals and offers near you.</p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-bold hover:bg-gray-100 transition">
              &larr; Back to Countries
            </button>
          </Link>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="max-w-6xl mx-auto p-6 mt-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Cities in this Region</h2>
        
        {cities.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Cities Found</h2>
            <p>We couldn't find any cities for this country. Please check back later or add some via the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {cities.map((c: any) => (
              <Link href={`/retailers/${c.id || c._id}`} key={c.id || c._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                  <div className="overflow-hidden h-24">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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