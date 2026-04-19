import Link from 'next/link';

async function getOffers(retailerId: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/offers/${retailerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    return [];
  }
}

async function getRetailer(retailerId: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/retailer/${retailerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function OffersPage({ params }: { params: { retailerId: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const retailerId = resolvedParams.retailerId;
  const offers = await getOffers(retailerId);
  const retailer = await getRetailer(retailerId);

  return (
    <div>
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-20 px-4 shadow-md">
        <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md uppercase tracking-tight">
          {retailer ? retailer.name : 'Retailer Offers'}
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-medium opacity-95 drop-shadow-sm">Browse all the latest deals and flyers.</p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-md font-bold hover:bg-yellow-500 transition shadow-sm">
              &larr; Back to Home
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-8">
        {offers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Offers Found</h2>
            <p>This retailer currently has no active offers. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map((o: any) => (
              <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-orange-400 group relative">
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
        )}
      </div>
    </div>
  );
}