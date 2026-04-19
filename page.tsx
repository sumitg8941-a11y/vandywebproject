import Link from 'next/link';

// Fetch offers from the secure Node.js backend API
async function getOffers(retailerId: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/offers/${retailerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch offers');
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function OffersPage({ params }: { params: Promise<{ retailerId: string }> }) {
  const resolvedParams = await params;
  const offers = await getOffers(resolvedParams.retailerId);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <Link href="/" className="inline-block mb-6 text-gray-600 hover:text-green-600 font-semibold transition">
        <i className="fa-solid fa-arrow-left"></i> Back to Start
      </Link>
      
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Latest Offers & Flyers</h2>
      
      {offers.length === 0 ? (
        <div className="text-center p-10 bg-gray-100 text-gray-600 rounded-lg">
          <h2 className="text-2xl font-bold">No offers found</h2>
          <p>Check back later for updates!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {offers.map((offer: any) => (
            <div key={offer.id || offer._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative group cursor-pointer border border-gray-100">
              {offer.badge && (
                <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md">
                  {offer.badge}
                </span>
              )}
              <div className="overflow-hidden aspect-[1/1.4] w-full bg-gray-100 relative">
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">{offer.title}</h3>
                <p className="text-gray-500 text-sm"><i className="fa-regular fa-calendar"></i> {new Date(offer.date).toISOString().split('T')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}