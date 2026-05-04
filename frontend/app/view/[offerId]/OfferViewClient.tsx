'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '../../Breadcrumbs';
import PDFFlipbook from '../../PDFFlipbook';
import SafeImage from '../../SafeImage';
import SaveButton from '../../SaveButton';
import RatingWidget from '../../RatingWidget';
import AdSlot from '../../AdSlot';

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
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const startTimeRef = useRef(Date.now());
  const maxPageRef = useRef(1);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';

  // Load user's previous feedback from localStorage
  useEffect(() => {
    const key = `dn_feedback_${offerId}`;
    const stored = localStorage.getItem(key);
    if (stored === 'like' || stored === 'dislike') {
      setUserFeedback(stored);
    }
  }, [offerId]);

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
    // If clicking the same button again, undo the feedback
    if (userFeedback === type) {
      try {
        const undoEndpoint = type === 'like' ? 'unlike' : 'undislike';
        const res = await fetch(`${apiBaseUrl}/api/offer/${offerId}/${undoEndpoint}`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setOffer({ ...offer, likes: data.likes, dislikes: data.dislikes });
          setUserFeedback(null);
          localStorage.removeItem(`dn_feedback_${offerId}`);
        }
      } catch {}
      return;
    }
    
    // If switching from one to another, prevent it (must undo first)
    if (userFeedback) {
      return;
    }
    
    // First time feedback
    try {
      const res = await fetch(`${apiBaseUrl}/api/offer/${offerId}/${type}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOffer({ ...offer, likes: data.likes, dislikes: data.dislikes });
        setUserFeedback(type);
        localStorage.setItem(`dn_feedback_${offerId}`, type);
      }
    } catch {}
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: offer.title,
      text: `🔥 Amazing deal alert! ${offer.title} at ${retailer?.name || 'this retailer'}\n\n💰 Help your friends save money too!`,
      url: `${siteUrl}/view/${offerId}`
    };

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(`${siteUrl}/view/${offerId}`);
        alert('Link copied to clipboard! Share it with your friends.');
      } catch (err) {
        // Final fallback: show the link
        prompt('Copy this link to share:', `${siteUrl}/view/${offerId}`);
      }
    }
  };

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
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition"
            aria-label="Share this offer"
          >
            <i className="fa-solid fa-share-nodes text-base"></i>
            <span className="hidden sm:inline">Share</span>
          </button>
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
              Valid: {offer.validFrom ? new Date(offer.validFrom).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : '—'} &ndash; {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : '—'}
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
                disabled={userFeedback === 'dislike'}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                  userFeedback === 'like' 
                    ? 'bg-green-500 text-white border-green-600 hover:bg-green-600' 
                    : userFeedback === 'dislike'
                    ? 'opacity-50 cursor-not-allowed text-green-600 border-green-200' 
                    : 'hover:bg-green-50 hover:border-green-300 text-green-600 border-green-200'
                }`}
                title={userFeedback === 'like' ? 'Click again to undo' : 'Mark as helpful'}
              >
                <i className={userFeedback === 'like' ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up'}></i> {offer.likes || 0}
              </button>
              <button
                onClick={() => handleFeedback('dislike')}
                disabled={userFeedback === 'like'}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                  userFeedback === 'dislike' 
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' 
                    : userFeedback === 'like'
                    ? 'opacity-50 cursor-not-allowed text-red-500 border-red-200' 
                    : 'hover:bg-red-50 hover:border-red-300 text-red-500 border-red-200'
                }`}
                title={userFeedback === 'dislike' ? 'Click again to undo' : 'Mark as not helpful'}
              >
                <i className={userFeedback === 'dislike' ? 'fa-solid fa-thumbs-down' : 'fa-regular fa-thumbs-down'}></i> {offer.dislikes || 0}
              </button>
              <SaveButton offerId={offerId} />
            </div>
          </div>

          {/* CTA column */}
          <div className="flex-shrink-0 flex flex-col items-stretch gap-3 w-full md:w-56">
            {offer.retailerUrl && offer.retailerUrl !== '#' && (
              <a
                href={`${apiBaseUrl}/api/redirect/offer/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <span className="font-black text-lg tracking-tight"><i className="fa-solid fa-bolt text-yellow-300"></i> Go to Deal</span>
                <span className="text-xs font-medium opacity-90">at {retailer?.name || 'Retailer Website'}</span>
              </a>
            )}
            {pdfSrc && (
              <button
                onClick={() => setIsFlipbookOpen(true)}
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 px-6 py-4 rounded-xl font-extrabold text-lg shadow-md hover:bg-yellow-500 hover:scale-105 transition-all border border-yellow-500"
              >
                <i className="fa-solid fa-book-open"></i> View Catalog
              </button>
            )}
            {!offer.retailerUrl && offer.couponUrl && offer.couponUrl !== '#' && (
              <a
                href={`${apiBaseUrl}/api/redirect/offer/${offer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-red-700 transition"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Shop Now
              </a>
            )}
            {retailer?.websiteUrl && (
              <a
                href={`${apiBaseUrl}/api/redirect/retailer/${retailer.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-200 transition border border-gray-200"
              >
                <i className="fa-solid fa-globe"></i> Visit {retailer.name}
              </a>
            )}
            {/* Multi-platform Share */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Share this deal</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`🔥 ${offer.title}\n${siteUrl}/view/${offerId}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition text-xs font-bold"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i>WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/view/${offerId}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition text-xs font-bold"
                >
                  <i className="fa-brands fa-facebook-f text-lg"></i>Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔥 ${offer.title}`)}&url=${encodeURIComponent(`${siteUrl}/view/${offerId}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 bg-gray-900 hover:bg-black text-white p-2 rounded-lg transition text-xs font-bold"
                >
                  <i className="fa-brands fa-x-twitter text-lg"></i>X
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${siteUrl}/view/${offerId}`)}&text=${encodeURIComponent(`🔥 ${offer.title}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition text-xs font-bold"
                >
                  <i className="fa-brands fa-telegram text-lg"></i>Telegram
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(offer.title)}&body=${encodeURIComponent(`Check out this deal: ${siteUrl}/view/${offerId}`)}`}
                  className="flex flex-col items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition text-xs font-bold"
                >
                  <i className="fa-solid fa-envelope text-lg"></i>Email
                </a>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 bg-gray-700 hover:bg-gray-800 text-white p-2 rounded-lg transition text-xs font-bold"
                >
                  <i className="fa-solid fa-link text-lg"></i>Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>

        <AdSlot format="horizontal" className="my-6" />

        {/* Flyer Image */}
        {/* Flyer Image with Side Ads */}
        <div className="flex gap-6 items-start">
          {/* Left Ad (desktop only) */}
          <div className="hidden lg:block flex-shrink-0 w-[300px]">
            <AdSlot format="vertical" className="sticky top-4" />
          </div>

          {/* Flyer Image */}
          <div className="flex-1 bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-8 flex justify-center">
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

          {/* Right Ad (desktop only) */}
          <div className="hidden lg:block flex-shrink-0 w-[300px]">
            <AdSlot format="vertical" className="sticky top-4" />
          </div>
        </div>

        {/* Mobile ad below image */}
        <div className="lg:hidden mt-4">
          <AdSlot format="horizontal" />
        </div>
      </div>

      {/* Flipbook Modal */}
      {isFlipbookOpen && pdfSrc && (
        <PDFFlipbook
          pdfUrl={pdfSrc}
          onClose={() => setIsFlipbookOpen(false)}
          title={offer.title}
          shareUrl={`${siteUrl}/view/${offerId}`}
          retailerUrl={offer.retailerUrl || offer.couponUrl}
          offerId={offer.id}
        />
      )}
    </div>
  );
}
