'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from './LangToggle';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-red-600 transition text-xl"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)}></div>
          <nav className="fixed top-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 space-y-1 z-50 shadow-lg">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition"
            >
              <i className="fa-solid fa-house mr-3"></i>{t.home}
            </Link>
            <Link
              href="/#retailers"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition"
            >
              <i className="fa-solid fa-store mr-3"></i>{t.retailers}
            </Link>
            <Link
              href="/#coupons"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition"
            >
              <i className="fa-solid fa-ticket mr-3"></i>{t.coupons}
            </Link>
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition"
            >
              <i className="fa-solid fa-magnifying-glass mr-3"></i>{t.search}
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
