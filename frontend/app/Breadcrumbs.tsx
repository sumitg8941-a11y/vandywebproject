'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from './LangToggle';

export default function Breadcrumbs({ type, id, items }: { type?: string, id?: string, items?: { label: string, href?: string }[] }) {
  const { t } = useLang();
  const [breadcrumbs, setBreadcrumbs] = useState<any>(null);

  useEffect(() => {
    if (items) return;
    if (!type || !id) return;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    fetch(`${apiBaseUrl}/api/breadcrumbs/${type}/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setBreadcrumbs(data))
      .catch(() => setBreadcrumbs(null));
  }, [type, id, items]);

  if (!items && !breadcrumbs) return null;

  if (items) {
    return (
      <nav className="flex text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-nowrap">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
              <i className="fa-solid fa-home"></i> {t.home || 'Home'}
            </Link>
          </li>
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              {item.href ? (
                <Link href={item.href} className="hover:text-red-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-800 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav className="flex text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-nowrap">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
            <i className="fa-solid fa-home"></i> {t.home || 'Home'}
          </Link>
        </li>
        
        {breadcrumbs.country && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/cities/${breadcrumbs.country.id}`} className="hover:text-red-600 transition-colors">
                {breadcrumbs.country.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.state && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/cities/state/${breadcrumbs.state.id}`} className="hover:text-red-600 transition-colors">
                {breadcrumbs.state.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.city && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/retailers/${breadcrumbs.city.id}`} className="hover:text-red-600 transition-colors">
                {breadcrumbs.city.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.retailer && (
          <>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/offers/${breadcrumbs.retailer.id}`} className="hover:text-red-600 transition-colors">
                {breadcrumbs.retailer.name}
              </Link>
            </li>
          </>
        )}

        {breadcrumbs.offer && (
          <>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800 font-medium">
              {breadcrumbs.offer.name}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}