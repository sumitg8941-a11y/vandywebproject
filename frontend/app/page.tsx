import Link from 'next/link';

async function getSearchResults(query: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch search results');
    return res.json();
  } catch (error) {
    return { retailers: [], offers: [] };
  }
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const resolvedParams = await Promise.resolve(searchParams);
  const query = resolvedParams.q || '';
  const { retailers, offers } = await getSearchResults(query);

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gray-800 text-white text-center py-12 px-4 shadow-inner">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">Search Results</h1>
        <p className="text-lg opacity-90">Showing results for "{query}"</p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-white text-gray-800 px-6 py-2 rounded-md font-bold hover:bg-gray-100 transition">
              &larr; Back to Home
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        {retailers.length === 0 && offers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-magnifying-glass"></i> No Results Found</h2>
            <p>We couldn't find any retailers or offers matching "{query}".</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Retailers Results */}
            {retailers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Retailers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {retailers.map((r: any) => (
                    <Link href={`/offers/${r.id || r._id}`} key={r.id || r._id}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                        <div className="overflow-hidden h-32">
                          <img src={r.logo || r.image} alt={r.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-3 text-center border-t border-gray-100">
                          <h3 className="text-lg font-bold text-gray-800">{r.name}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Offers Results */}
            {offers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Offers & Flyers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {offers.map((o: any) => (
                    <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group relative">
                        {o.badge && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
                            {o.badge}
                          </div>
                        )}
                        <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                          <img src={o.image} alt={o.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4 border-t border-gray-100">
                          <h3 className="text-lg font-bold text-gray-800 truncate mb-1">{o.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}