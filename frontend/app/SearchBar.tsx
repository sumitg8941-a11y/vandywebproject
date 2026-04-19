"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex justify-center max-w-3xl mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-white/20">
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for electronics, groceries, fashion..." 
        className="w-full p-4 text-black outline-none text-lg font-medium"
        required 
      />
      <button type="submit" className="bg-yellow-400 text-gray-900 px-8 font-black text-xl hover:bg-yellow-500 transition-colors flex items-center">
        <i className="fa-solid fa-magnifying-glass mr-2"></i> Search
      </button>
    </form>
  );
}