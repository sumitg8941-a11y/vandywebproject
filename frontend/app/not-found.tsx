import Link from 'next/link';
import SafeImage from './SafeImage';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getActiveOffers() {
  try {
    const res = await fetch(`${API}/api/offers?limit=6`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const offers = await getActiveOffers();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-9xl font-black text-red-600 mb-4">404</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Deal Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">
            This offer may have expired or been removed. But don't worry — we have plenty of other hot deals!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              <i className="fa-solid fa-house"></i> Go Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              <i className="fa-solid fa-magnifying-glass"></i> Search Deals
            </Link>
          </div>
        </div>

        {offers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Check Out These Active Offers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {offers.map((o: any) => (
                <Link href={`/view/${o.id}`} key={o.id}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                    <div className="aspect-[3/4] bg-gray-50 relative">
                      <SafeImage
                        src={o.image}
                        alt={o.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain p-2"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <h3 className="text-xs font-bold text-gray-800 truncate">{o.title}</h3>
                      {o.validUntil && (
                        <p className="text-xs text-gray-400 mt-1">
                          Until {new Date(o.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
