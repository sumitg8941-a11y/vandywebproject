'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from './LangToggle';

const HISTORY_KEY = 'dn_search_history';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

function getHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(query: string) {
  try {
    const prev = getHistory().filter(q => q !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([query, ...prev].slice(0, 5)));
  } catch (e) {
    console.error('Failed to save search history:', e);
  }
}

export default function SearchBar() {
  const { t } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; type: string }[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        const items = [
          ...(data.retailers || []).slice(0, 3).map((r: any) => ({ label: r.name, type: 'retailer' })),
          ...(data.offers || []).slice(0, 4).map((o: any) => ({ label: o.title, type: 'offer' })),
        ];
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch { /* silent */ }
    }, 250);
  };

  const navigate = (q: string) => {
    saveToHistory(q);
    setHistory(getHistory());
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(query.trim());
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto w-full">
      {/* Quick Chips */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {history.map(q => (
            <button
              key={q}
              type="button"
              onClick={() => navigate(q)}
              className="text-xs bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full px-3 py-1 transition-colors"
            >
              <i className="fa-solid fa-clock-rotate-left mr-1 opacity-70"></i>{q}
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="flex shadow-2xl rounded-lg overflow-hidden border-4 border-white/20"
        >
          <input
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={t.searchPlaceholder}
            className="w-full p-4 bg-white text-gray-900 placeholder-gray-400 outline-none text-lg font-medium"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-yellow-400 text-gray-900 px-8 font-black text-xl hover:bg-yellow-500 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span className="hidden sm:inline">{t.search}</span>
          </button>
        </form>

        {/* Dropdown */}
        {open && (
          <ul className="absolute z-50 top-full left-0 right-0 bg-white rounded-b-lg shadow-xl border border-gray-100 overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => navigate(s.label)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-800 text-sm"
                >
                  <i className={`fa-solid ${s.type === 'retailer' ? 'fa-store' : 'fa-tag'} text-gray-400 w-4`}></i>
                  {s.label}
                  <span className="ml-auto text-xs text-gray-400 capitalize">{s.type}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
