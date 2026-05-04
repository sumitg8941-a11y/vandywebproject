'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SavedLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      const ids = JSON.parse(localStorage.getItem('dn_saved_offers') || '[]');
      setCount(ids.length);
    };
    read();
    window.addEventListener('storage', read);
    // poll for same-tab updates
    const id = setInterval(read, 1000);
    return () => { window.removeEventListener('storage', read); clearInterval(id); };
  }, []);

  return (
    <Link
      href="/saved"
      className="flex items-center gap-1.5 text-gray-700 hover:text-red-600 transition font-semibold text-sm"
    >
      <i className="fa-solid fa-heart text-red-500"></i>
      <span className="hidden sm:inline">Saved</span>
      {count > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{count}</span>}
    </Link>
  );
}
