'use client';

import Link from 'next/link';
import { useLang } from './LangToggle';

export default function FindDealsButton() {
  const { t } = useLang();
  return (
    <Link href="/search" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition text-sm">
      <i className="fa-solid fa-magnifying-glass mr-2"></i>{t.findDeals}
    </Link>
  );
}
