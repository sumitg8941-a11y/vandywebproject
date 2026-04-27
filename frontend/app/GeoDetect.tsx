'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Country {
  id: string;
  name: string;
}

const STORAGE_KEY = 'dn_geo_dismissed';
const COUNTRY_KEY = 'dn_detected_country';

export default function GeoDetect({ countries }: { countries: Country[] }) {
  const router = useRouter();
  const [detected, setDetected] = useState<Country | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed or we're on a sub-page
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (window.location.pathname !== '/') return;

    // Check if we already detected and cached the country this session
    const cached = sessionStorage.getItem(COUNTRY_KEY);
    if (cached) {
      const match = countries.find(c => c.id === cached);
      if (match) { setDetected(match); setVisible(true); }
      return;
    }

    // Detect via IP
    fetch('https://ipapi.co/json/', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const code = (data.country_code || '').toLowerCase();
        const match = countries.find(c => c.id === code);
        if (match) {
          sessionStorage.setItem(COUNTRY_KEY, match.id);
          setDetected(match);
          setVisible(true);
        }
      })
      .catch(() => {}); // silently fail — never break the page
  }, [countries]);

  function handleYes() {
    if (!detected) return;
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    router.push(`/cities/${detected.id}`);
  }

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible || !detected) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 border border-white/10">
        <div className="text-2xl flex-shrink-0">📍</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">
            Looks like you&apos;re in {detected.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            See deals available near you
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleYes}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            View Deals →
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition p-1"
            aria-label="Dismiss"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
