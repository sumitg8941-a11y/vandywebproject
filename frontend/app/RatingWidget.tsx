'use client';

import { useState } from 'react';

export default function RatingWidget({ offerId, initialRating = 0, initialCount = 0 }: { offerId: string; initialRating: number; initialCount: number }) {
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [hover, setHover] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  const handleRate = async (stars: number) => {
    if (hasRated) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/offer/${offerId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: stars }),
      });
      if (res.ok) {
        const data = await res.json();
        setRating(data.rating);
        setCount(data.ratingCount);
        setHasRated(true);
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
            onMouseEnter={() => !hasRated && setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={hasRated}
            className={`text-xl transition ${hasRated ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          >
            <i className={`fa-${(hover || rating) >= star ? 'solid' : 'regular'} fa-star ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}></i>
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-600">
        {rating > 0 ? `${rating.toFixed(1)}★` : 'Rate this'} {count > 0 && `(${count})`}
      </span>
    </div>
  );
}
