'use client';

import { useState } from 'react';

export default function CouponReveal({ code }: { code: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleReveal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRevealed(true);
  }

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-2" onClick={(e) => e.preventDefault()}>
      {!revealed ? (
        <button
          onClick={handleReveal}
          className="w-full flex items-center justify-between gap-1 bg-red-50 border border-dashed border-red-300 rounded-lg px-2 py-1.5 group hover:bg-red-100 transition"
        >
          <span className="text-xs font-bold text-red-600 flex items-center gap-1">
            <i className="fa-solid fa-ticket text-red-400"></i>
            <span className="blur-sm select-none tracking-widest">{code}</span>
          </span>
          <span className="text-[10px] font-black text-red-600 uppercase tracking-wide whitespace-nowrap">
            Tap to reveal
          </span>
        </button>
      ) : (
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-between gap-1 bg-green-50 border border-dashed border-green-400 rounded-lg px-2 py-1.5 hover:bg-green-100 transition"
        >
          <span className="text-xs font-bold text-green-700 font-mono tracking-wider truncate">
            {code}
          </span>
          <span className="text-[10px] font-black text-green-600 uppercase tracking-wide whitespace-nowrap">
            {copied ? '✓ Copied!' : 'Copy'}
          </span>
        </button>
      )}
    </div>
  );
}
