/**
 * CLIENT-SIDE BREADCRUMB COMPONENT (Alternative Implementation)
 * 
 * Use this version if you need client-side interactivity or want to avoid
 * server-side API calls. This component uses URL parsing instead of API fetching.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseBreadcrumbContext, slugToDisplayName, buildBreadcrumbUrl } from './breadcrumbUtils';
import { useEffect, useState } from 'react';

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

export default function BreadcrumbsClient() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBreadcrumbs() {
      const context = parseBreadcrumbContext(pathname);
      if (!context) {
        setLoading(false);
        return;
      }

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
        const res = await fetch(`${apiBaseUrl}/api/breadcrumbs/${context.type}/${context.id}`);
        
        if (res.ok) {
          const data = await res.json();
          setBreadcrumbs(data);
        }
      } catch (err) {
        console.error('Breadcrumb fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBreadcrumbs();
  }, [pathname]);

  if (loading) {
    return (
      <nav className="flex text-sm text-gray-600 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-pulse flex space-x-2">
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      </nav>
    );
  }

  if (!breadcrumbs) return null;

  return (
    <nav 
      className="flex text-sm text-gray-600 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-x-auto"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        <li>
          <Link 
            href="/" 
            className="hover:text-red-600 transition-colors font-medium flex items-center"
          >
            <i className="fa-solid fa-home mr-1"></i>
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        
        {breadcrumbs.country && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/cities/${breadcrumbs.country.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
              >
                {breadcrumbs.country.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.state && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/cities/state/${breadcrumbs.state.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
              >
                {breadcrumbs.state.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.city && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/retailers/${breadcrumbs.city.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
              >
                {breadcrumbs.city.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.retailer && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/offers/${breadcrumbs.retailer.id}`} 
                className="hover:text-red-600 transition-colors font-medium"
              >
                {breadcrumbs.retailer.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.offer && (
          <>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-semibold" aria-current="page">
              {breadcrumbs.offer.name}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
