'use client';

import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

// Fire-and-forget tracking — one component handles all event types
export default function Tracker({ type, id }: { type: 'visit' | 'country' | 'city' | 'retailer' | 'offer'; id?: string }) {
  useEffect(() => {
    const url = type === 'visit'
      ? `${API}/api/track/visit`
      : `${API}/api/track/${type}/${id}`;
    fetch(url, { method: 'POST' }).catch(() => {});
  }, [type, id]);

  return null;
}
