import Link from 'next/link';

/**
 * Breadcrumb Navigation Component
 * 
 * Dynamically generates hierarchical navigation based on the current page context.
 * Supports: Country > State > City > Retailer > Offer
 * 
 * @param type - The entity type: 'city', 'state', 'retailer', or 'offer'
 * @param id - The entity ID to build breadcrumbs for
 */

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbData {
  country?: BreadcrumbItem;
  state?: BreadcrumbItem;
  city?: BreadcrumbItem;
  retailer?: BreadcrumbItem;
  offer?: BreadcrumbItem;
}

async function fetchBreadcrumbData(type: string, id: string): Promise<BreadcrumbData | null> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/breadcrumbs/${type}/${id}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Breadcrumb fetch error:', err);
    return null;
  }
}

function truncateText(text: string, maxLength: number = 25): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default async function Breadcrumbs({ 
  type, 
  id 
}: { 
  type: 'city' | 'state' | 'retailer' | 'offer', 
  id: string 
}) {
  const breadcrumbs = await fetchBreadcrumbData(type, id);

  if (!breadcrumbs) return null;

  return (
    <nav 
      className="flex text-sm text-gray-600 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-x-auto"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        {/* Home */}
        <li>
          <Link 
            href="/" 
            className="hover:text-red-600 transition-colors font-medium flex items-center"
            title="Go to homepage"
          >
            <i className="fa-solid fa-home mr-1"></i>
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        
        {/* Country */}
        {breadcrumbs.country && (
          <>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li>
              <Link 
                href={`/cities/${breadcrumbs.country.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
                title={`View regions in ${breadcrumbs.country.name}`}
              >
                <span className="hidden md:inline">{breadcrumbs.country.name}</span>
                <span className="md:hidden">{truncateText(breadcrumbs.country.name, 15)}</span>
              </Link>
            </li>
          </>
        )}

        {/* State */}
        {breadcrumbs.state && (
          <>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li>
              <Link 
                href={`/cities/state/${breadcrumbs.state.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
                title={`View cities in ${breadcrumbs.state.name}`}
              >
                <span className="hidden md:inline">{breadcrumbs.state.name}</span>
                <span className="md:hidden">{truncateText(breadcrumbs.state.name, 15)}</span>
              </Link>
            </li>
          </>
        )}

        {/* City */}
        {breadcrumbs.city && (
          <>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li>
              <Link 
                href={`/retailers/${breadcrumbs.city.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
                title={`View retailers in ${breadcrumbs.city.name}`}
              >
                <span className="hidden md:inline">{breadcrumbs.city.name}</span>
                <span className="md:hidden">{truncateText(breadcrumbs.city.name, 15)}</span>
              </Link>
            </li>
          </>
        )}

        {/* Retailer */}
        {breadcrumbs.retailer && (
          <>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li>
              <Link 
                href={`/offers/${breadcrumbs.retailer.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
                title={`View offers from ${breadcrumbs.retailer.name}`}
              >
                <span className="hidden md:inline">{breadcrumbs.retailer.name}</span>
                <span className="md:hidden">{truncateText(breadcrumbs.retailer.name, 15)}</span>
              </Link>
            </li>
          </>
        )}

        {/* Offer (Current Page - Not Clickable) */}
        {breadcrumbs.offer && (
          <>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li 
              className="text-gray-900 font-semibold"
              aria-current="page"
              title={breadcrumbs.offer.name}
            >
              <span className="hidden md:inline">{truncateText(breadcrumbs.offer.name, 30)}</span>
              <span className="md:hidden">{truncateText(breadcrumbs.offer.name, 15)}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
