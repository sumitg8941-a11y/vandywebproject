import Link from 'next/link';

// Fetch offers from your Node.js Backend API
async function getOffers(retailerId: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/offers/${retailerId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch offers');
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function OffersPage({ params }: { params: { retailerId: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const offers = await getOffers(resolvedParams.retailerId);

  // Group offers by category
  const categorizedOffers = offers.reduce((acc: any, offer: any) => {
    const cat = offer.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(offer);
    return acc;
  }, {});

  return (
    <div>
      {/* Hero Banner Section */}
      <div className="bg-purple-600 text-white text-center py-20 px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Latest Catalogs & Deals</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">Browse through the weekly flyers and exclusive offers.</p>
        <div className="flex justify-center mt-6">
          <Link href="/">
            <button className="bg-white text-purple-600 px-6 py-2 rounded-md font-bold hover:bg-gray-100 transition">
              &larr; Back to Regions
            </button>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {offers.length === 0 ? (
          <div className="text-center p-10 bg-yellow-100 text-yellow-800 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> No Offers Found</h2>
            <p>There are currently no active offers for this retailer. Please check back later.</p>
          </div>
        ) : (
          <div>
            {Object.keys(categorizedOffers).map((category) => (
              <div key={category} className="mb-14">
                <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3 mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{category} Offers</h2>
                  <span className="text-gray-500 font-medium">{categorizedOffers[category].length} Deals</span>
                </div>
                
                {/* 
                  Dense Grid to accommodate multiple offers:
                  - Mobile: 2 columns (dense)
                  - Tablet: 3 columns
                  - Desktop: 4 or 5 columns
                  - Ultra-wide: 6 columns
                */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
                  {categorizedOffers[category].map((o: any) => (
                    <Link 
                      href={`/view/${o.id || o._id}`} 
                      key={o.id || o._id} 
                      className="group block h-full"
                    >
                      <div className={`bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border ${o.isSponsored ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-100'} relative flex flex-col h-full overflow-hidden transform group-hover:-translate-y-1`}>
                        
                        {o.badge && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md shadow-lg z-10">
                            {o.badge}
                          </div>
                        )}

                        {o.isSponsored && (
                          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-md shadow-lg z-10">
                            AD
                          </div>
                        )}

                        {/* Bigger PDF Thumbnail with flyer aspect ratio (1:1.414 approximation) */}
                        <div className="w-full aspect-[1/1.4] relative overflow-hidden bg-gray-50">
                          <img 
                            src={o.image} 
                            alt={o.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300"></div>
                        </div>
                        
                        <div className="p-4 flex-grow flex flex-col justify-between bg-white z-20">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 mb-2 leading-snug group-hover:text-purple-700 transition-colors">{o.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mb-3 flex items-center">
                              <i className="fa-regular fa-calendar mr-1.5 opacity-70"></i>
                              {new Date(o.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          
                          <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
                            {o.couponCode ? (
                              <span className="text-green-700 text-sm sm:text-base font-bold border-2 border-green-600/30 px-3 py-1 rounded bg-green-50 shadow-sm">
                                {o.couponCode}
                              </span>
                            ) : (
                              <span className="text-blue-600 text-sm sm:text-base font-semibold group-hover:text-blue-800 transition-colors flex items-center">
                                View Deal <i className="fa-solid fa-chevron-right ml-1.5 text-xs opacity-70 group-hover:translate-x-1 transition-transform"></i>
                              </span>
                            )}
                            <span className="text-xs sm:text-sm text-gray-400 flex items-center font-medium">
                              <i className="fa-regular fa-eye mr-1.5 opacity-70"></i> {o.clicks}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}