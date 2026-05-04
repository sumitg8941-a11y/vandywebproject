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
          className="w-full flex items-center justify-between gap-1 bg-red-50 border-2 border-dashed border-red-300 rounded-xl px-3 py-2 group hover:bg-red-100 hover:border-red-400 transition-all active:scale-95 shadow-sm"
        >
          <span className="text-xs font-bold text-red-600 flex items-center gap-2">
            <i className="fa-solid fa-ticket text-red-400"></i>
            <span className="blur-[2px] select-none tracking-widest">{code}</span>
          </span>
          <span className="text-[10px] font-black text-white bg-red-600 px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap group-hover:bg-red-700">
            Reveal Code
          </span>
        </button>
      ) : (
        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-between gap-1 border-2 border-dashed rounded-xl px-3 py-2 transition-all active:scale-95 shadow-sm ${copied ? 'bg-green-50 border-green-500' : 'bg-green-50 border-green-400 hover:bg-green-100 hover:border-green-500'}`}
        >
          <span className={`text-sm font-bold font-mono tracking-widest truncate ${copied ? 'text-green-800' : 'text-green-700'}`}>
            {code}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded-md ${copied ? 'bg-green-600 text-white' : 'bg-green-700 text-white'}`}>
            {copied ? <><i className="fa-solid fa-check mr-1"></i>Copied!</> : 'Copy'}
          </span>
        </button>
      )}
    </div>
  );
}
