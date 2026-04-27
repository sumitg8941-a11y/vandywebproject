'use client';

import Link from 'next/link';
import { useLang } from './LangToggle';

export default function NavLinks() {
  const { t } = useLang();
  return (
    <>
      <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-semibold">
        <Link href="/" className="hover:text-red-600 transition">{t.home}</Link>
        <Link href="/#retailers" className="hover:text-red-600 transition">{t.retailers}</Link>
        <Link href="/#coupons" className="hover:text-red-600 transition">{t.coupons}</Link>
        <Link href="/search" className="hover:text-red-600 transition">{t.search}</Link>
      </nav>
      <nav className="hidden peer-checked:block md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
        <Link href="/" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
          <i className="fa-solid fa-house mr-3"></i>{t.home}
        </Link>
        <Link href="/#retailers" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
          <i className="fa-solid fa-store mr-3"></i>{t.retailers}
        </Link>
        <Link href="/#coupons" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
          <i className="fa-solid fa-ticket mr-3"></i>{t.coupons}
        </Link>
        <Link href="/search" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
          <i className="fa-solid fa-magnifying-glass mr-3"></i>{t.search}
        </Link>
      </nav>
    </>
  );
}
