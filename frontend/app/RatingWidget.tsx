'use client';

import { useState, useEffect } from 'react';
import { useLang } from './LangToggle';

export default function RatingWidget({ offerId, initialRating = 0, initialCount = 0 }: { offerId: string; initialRating: number; initialCount: number }) {
  const { t } = useLang();
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  useEffect(() => {
    const key = `dn_rating_${offerId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsedRating = parseInt(stored, 10);
      if (parsedRating >= 1 && parsedRating <= 5) {
        setUserRating(parsedRating);
      }
    }
  }, [offerId]);

  const handleRate = async (stars: number) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/offer/${offerId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: stars, previousRating: userRating }),
      });
      if (res.ok) {
        const data = await res.json();
        setRating(data.rating);
        setCount(data.ratingCount);
        setUserRating(stars);
        localStorage.setItem(`dn_rating_${offerId}`, stars.toString());
      }
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-xl transition cursor-pointer hover:scale-110"
          >
            <i className={`fa-${(hover || userRating || rating) >= star ? 'solid' : 'regular'} fa-star ${
              hover >= star ? 'text-yellow-500' : 
              userRating && userRating >= star ? 'text-yellow-400' : 
              rating >= star ? 'text-yellow-300' : 
              'text-gray-300'
            }`}></i>
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-600">
        {rating > 0 ? `${rating.toFixed(1)}★` : t.rateThis || 'Rate this'} {count > 0 && `(${count})`}
        {userRating && <span className="text-xs text-gray-400 ml-1">({t.you || 'You'}: {userRating}★)</span>}
      </span>
    </div>
  );
}
