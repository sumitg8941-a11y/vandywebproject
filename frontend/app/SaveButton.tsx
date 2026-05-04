'use client';

import { useState, useEffect } from 'react';
import { useLang } from './LangToggle';

export default function SaveButton({ offerId }: { offerId: string }) {
  const { t } = useLang();
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    try {
      const savedOffers = JSON.parse(localStorage.getItem('dn_saved_offers') || '[]');
      setSaved(savedOffers.includes(offerId));
    } catch { /* localStorage unavailable */ }
  }, [offerId]);

  const triggerPop = () => {
    setPopping(false);
    requestAnimationFrame(() => setPopping(true));
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  };

  const toggleSave = async () => {
    triggerPop();
    let savedOffers: string[] = [];
    try { savedOffers = JSON.parse(localStorage.getItem('dn_saved_offers') || '[]'); } catch { /* ignore */ }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

    if (saved) {
      const updated = savedOffers.filter((id: string) => id !== offerId);
      try { localStorage.setItem('dn_saved_offers', JSON.stringify(updated)); } catch { /* ignore */ }
      setSaved(false);
      fetch(`${apiBaseUrl}/api/offer/${offerId}/unsave`, { method: 'POST' }).catch(() => {});
    } else {
      savedOffers.push(offerId);
      try { localStorage.setItem('dn_saved_offers', JSON.stringify(savedOffers)); } catch { /* ignore */ }
      setSaved(true);
      fetch(`${apiBaseUrl}/api/offer/${offerId}/save`, { method: 'POST' })
        .then(r => r.json())
        .then(d => setCount(d.savedCount || 0))
        .catch(() => {});
    }
  };

  return (
    <button
      onClick={toggleSave}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition font-semibold text-sm ${
        saved
          ? 'bg-red-50 border-red-300 text-red-600'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <i className={`${saved ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} ${popping ? 'animate-pop' : ''}`} onAnimationEnd={() => setPopping(false)}></i>
      {saved ? t.saved || 'Saved' : t.save || 'Save'}
    </button>
  );
}
