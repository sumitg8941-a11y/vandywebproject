import Link from 'next/link';
import Breadcrumbs from '../../BreadcrumbsEnhanced';

async function getOffers(retailerId: string) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/offers/${retailerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch offers');
    return res.json();
  } catch (error) {
    return [];
  }
}

async function getRetailer(retailerId: string) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/retailer/${retailerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch retailer');
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function OffersPage({ params }: { params: { retailerId: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const [offers, retailer] = await Promise.all([
    getOffers(resolvedParams.retailerId),
    getRetailer(resolvedParams.retailerId)
  ]);

  return (
    <div>
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-16 px-4 shadow-md">
        <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-md uppercase tracking-tight">
          {retailer?.name || 'Retailer'} Offers
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-medium opacity-95 drop-shadow-sm">
          Browse the latest deals and promotions
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        <Breadcrumbs type="retailer" id={resolvedParams.retailerId} />
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-2">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Available Offers</h2>
        
        {offers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Offers Available</h2>
            <p>Check back soon for new deals and promotions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map((offer: any) => (
              <Link href={`/view/${offer.id || offer._id}`} key={offer.id || offer._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100">
                  {offer.image && (
                    <div className="overflow-hidden h-48">
                      <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{offer.title}</h3>
                    {offer.badge && (
                      <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded-full mb-2">
                        {offer.badge}
                      </span>
                    )}
                    <p className="text-sm text-gray-600">
                      Valid until: {new Date(offer.validUntil).toLocaleDateString()}
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
