'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '../../Breadcrumbs';
import PDFFlipbook from '../../PDFFlipbook';
import SafeImage from '../../SafeImage';
import SaveButton from '../../SaveButton';
import RatingWidget from '../../RatingWidget';

interface Props {
  offer: any;
  retailer: any;
  offerId: string;
}

function getExpiryLabel(validUntil: string): { text: string; className: string } | null {
  if (!validUntil) return null;
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: 'Expired', className: 'bg-gray-500 text-white' };
  if (days === 0) return { text: 'Expires today!', className: 'bg-red-600 text-white' };
  if (days <= 3) return { text: `Expires in ${days}d`, className: 'bg-orange-500 text-white' };
  if (days <= 7) return { text: `${days} days left`, className: 'bg-yellow-500 text-gray-900' };
  return null;
}

export default function OfferViewClient({ offer: initialOffer, retailer, offerId }: Props) {
  const [offer, setOffer] = useState(initialOffer);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const startTimeRef = useRef(Date.now());
  const maxPageRef = useRef(1);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';

  // Track offer click on mount
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/track/offer/${offerId}`, { method: 'POST' }).catch(() => {});
  }, [offerId, apiBaseUrl]);

  // Track time spent when user leaves
  useEffect(() => {
    const trackStats = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const data = JSON.stringify({ duration, maxPage: maxPageRef.current });
      
      // Try sendBeacon first (more reliable for page unload)
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`${apiBaseUrl}/api/track/offer-stats/${offerId}`, blob);
      } else {
        // Fallback to fetch with keepalive
        fetch(`${apiBaseUrl}/api/track/offer-stats/${offerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Track on beforeunload (more reliable than unmount)
    window.addEventListener('beforeunload', trackStats);

    // Also track on unmount for SPA navigation
    return () => {
      window.removeEventListener('beforeunload', trackStats);
      trackStats();
    };
  }, [offerId, apiBaseUrl]);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (feedbackGiven) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/offer/${offerId}/${type}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOffer({ ...offer, likes: data.likes, dislikes: data.dislikes });
        setFeedbackGiven(true);
      }
    } catch {}
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const whatsappText = encodeURIComponent(
    `🔥 Amazing deal alert! ${offer.title} at ${retailer?.name || 'this retailer'}\n\n💰 Help your friends save money too!\n${siteUrl}/view/${offerId}`
  );

  const expiryLabel = getExpiryLabel(offer.validUntil);
  const pdfSrc = offer.pdfUrl && offer.pdfUrl !== '#'
    ? (offer.pdfUrl.startsWith('http') ? offer.pdfUrl : `${apiBaseUrl}${offer.pdfUrl}`)
    : null;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Sub-header */}
      <div className="bg-white shadow-sm border-b py-3 px-6 flex justify-between items-center">
        <Link href={`/offers/${offer.retailerId}`} className="text-gray-600 hover:text-gray-900 font-semibold transition flex items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i>
          <span className="hidden sm:inline">Back to {retailer?.name || 'Retailer'}</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* WhatsApp Share */}
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition"
            aria-label="Share on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp text-base"></i>
            <span className="hidden sm:inline">Share</span>
          </a>
          <div className="font-black text-red-600 tracking-tight hidden sm:block">
            HOT DEAL <i className="fa-solid fa-fire text-orange-500"></i>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 px-4">
        <Breadcrumbs type="offer" id={offerId} />

        {/* Offer Header Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start mb-8">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {offer.badge && (
                <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-red-200">
                  {offer.badge}
                </span>
              )}
              {expiryLabel && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${expiryLabel.className}`}>
                  {expiryLabel.text}
                </span>
              )}
              {offer.isSponsored && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200">
                  Sponsored
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{offer.title}</h1>

            {retailer && (
              <Link href={`/offers/${retailer.id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition mb-3 font-medium">
                <i className="fa-solid fa-store text-red-400"></i>
                {retailer.name}
              </Link>
            )}

            <p className="text-gray-500 text-sm mb-5">
              <i className="fa-regular fa-calendar mr-2"></i>
              Valid: {offer.validFrom ? new Date(offer.validFrom).toLocaleDateString() : '—'} &ndash; {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : '—'}
            </p>

            {/* Coupon Code */}
            {offer.couponCode && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Coupon Code</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 font-mono text-lg font-bold text-gray-800 text-center">
                    {offer.couponCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition ${copied ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    {copied ? <><i className="fa-solid fa-check mr-1"></i>Copied!</> : <><i className="fa-regular fa-copy mr-1"></i>Copy</>}
                  </button>
                </div>
              </div>
            )}

            {/* Like / Dislike */}
            <div className="mb-4">
              <RatingWidget offerId={offerId} initialRating={offer.rating || 0} initialCount={offer.ratingCount || 0} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
              <span className="text-gray-500">Was this helpful?</span>
              <button
                onClick={() => handleFeedback('like')}
                disabled={feedbackGiven}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${feedbackGiven ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50 hover:border-green-300'} text-green-600 border-green-200`}
              >
                <i className="fa-regular fa-thumbs-up"></i> {offer.likes || 0}
              </button>
              <button
                onClick={() => handleFeedback('dislike')}
                disabled={feedbackGiven}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${feedbackGiven ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-300'} text-red-500 border-red-200`}
              >
                <i className="fa-regular fa-thumbs-down"></i> {offer.dislikes || 0}
              </button>
              <SaveButton offerId={offerId} />
            </div>
          </div>

          {/* CTA column */}
          <div className="flex-shrink-0 flex flex-col items-stretch gap-3 w-full md:w-56">
            {pdfSrc && (
              <button
                onClick={() => setIsFlipbookOpen(true)}
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-6 py-4 rounded-xl font-extrabold text-lg shadow-md hover:bg-yellow-500 hover:scale-105 transition-all border border-yellow-500"
              >
                <i className="fa-solid fa-book-open"></i> View Catalog
              </button>
            )}
            {offer.couponUrl && offer.couponUrl !== '#' && (
              <a
                href={`${apiBaseUrl}/api/redirect/offer/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-red-700 transition"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Shop Now
              </a>
            )}
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-green-600 transition"
            >
              <i className="fa-brands fa-whatsapp"></i> Share & Help Friends Save
            </a>
            {retailer?.websiteUrl && (
              <a
                href={retailer.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-200 transition border border-gray-200"
              >
                <i className="fa-solid fa-globe"></i> Visit {retailer.name}
              </a>
            )}
          </div>
        </div>

        {/* Flyer Image */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-8 flex justify-center">
          <div className="relative w-full max-w-2xl" style={{ aspectRatio: '3/4' }}>
            <SafeImage
              src={offer.image}
              alt={offer.title}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="rounded-xl object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Flipbook Modal */}
      {isFlipbookOpen && pdfSrc && (
        <PDFFlipbook
          pdfUrl={pdfSrc}
          onClose={() => setIsFlipbookOpen(false)}
          title={offer.title}
          shareUrl={`${siteUrl}/view/${offerId}`}
        />
      )}
    </div>
  );
}
