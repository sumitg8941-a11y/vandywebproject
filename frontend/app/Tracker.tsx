'use client';

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export default function Tracker({ type, id }: { type: 'visit' | 'country' | 'city' | 'retailer' | 'offer'; id?: string }) {
  useEffect(() => {
    try {
      // visit: once per browser session
      if (type === 'visit') {
        if (sessionStorage.getItem('dn_visited')) return;
        sessionStorage.setItem('dn_visited', '1');
        fetch(`${API}/api/track/visit`, { method: 'POST' }).catch(() => {});
        return;
      }
      // others: once per session per entity
      const key = `dn_tracked_${type}_${id}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      fetch(`${API}/api/track/${type}/${id}`, { method: 'POST' }).catch(() => {});
    } catch {}
  }, [type, id]);

  return null;
}
