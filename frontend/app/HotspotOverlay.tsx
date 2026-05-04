'use client';

import { useState, useEffect, useRef } from 'react';

export interface Hotspot {
  id: string;
  /** 0–1 fraction of page width */
  x: number;
  /** 0–1 fraction of page height */
  y: number;
  label: string;
  price?: string;
  stock?: string;
}

interface Props {
  hotspots: Hotspot[];
  /** Page number these hotspots belong to (1-indexed) */
  page: number;
  /** Current visible page */
  currentPage: number;
}

export default function HotspotOverlay({ hotspots, page, currentPage }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close when page changes
  useEffect(() => { setOpenId(null); }, [currentPage]);

  if (page !== currentPage) return null;

  return (
    // Fills the relative wrapper around <Page> exactly
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none" aria-label="Product hotspots">
      {hotspots.map(hs => {
        const isOpen = openId === hs.id;
        // Flip popover to left if pin is in the right half
        const popoverSide = hs.x > 0.5 ? 'right-full mr-2' : 'left-full ml-2';

        return (
          <div
            key={hs.id}
            className="absolute pointer-events-auto"
            style={{ left: `${hs.x * 100}%`, top: `${hs.y * 100}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pin button */}
            <button
              onClick={() => setOpenId(isOpen ? null : hs.id)}
              aria-expanded={isOpen}
              aria-label={`Hotspot: ${hs.label}`}
              className="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-white"
            >
              <i className="fa-solid fa-tag text-[10px]"></i>
            </button>

            {/* Popover */}
            {isOpen && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${popoverSide} z-10 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 p-3`}
                role="tooltip"
              >
                <p className="font-bold text-gray-900 text-sm leading-tight mb-1">{hs.label}</p>
                {hs.price && (
                  <p className="text-red-600 font-black text-base">{hs.price}</p>
                )}
                {hs.stock && (
                  <p className={`text-xs font-semibold mt-1 ${hs.stock.toLowerCase().includes('out') ? 'text-gray-400' : 'text-green-600'}`}>
                    <i className={`fa-solid ${hs.stock.toLowerCase().includes('out') ? 'fa-circle-xmark' : 'fa-circle-check'} mr-1`}></i>
                    {hs.stock}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
