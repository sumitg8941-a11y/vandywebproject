'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from './LangToggle';

export default function HeaderSearch() {
  const { t } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <form onSubmit={handleSubmit} className="hidden md:flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-red-500 transition-colors bg-white">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder || 'Search deals...'}
        className="w-44 lg:w-64 px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        autoComplete="off"
      />
      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 transition-colors flex-shrink-0">
        <i className="fa-solid fa-magnifying-glass text-sm"></i>
      </button>
    </form>
  );
}
