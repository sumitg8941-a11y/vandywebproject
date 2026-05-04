'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '../../Breadcrumbs';
import PDFFlipbook from '../../PDFFlipbook';
import SafeImage from '../../SafeImage';
import SaveButton from '../../SaveButton';
import RatingWidget from '../../RatingWidget';
import AdSlot from '../../AdSlot';
import { useLang } from '../../LangToggle';

interface Props {
  offer: any;
  retailer: any;
  offerId: string;
}

function getExpiryLabel(validUntil: string, t: any): { text: string; className: string } | null {
  if (!validUntil) return null;
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: t.expired || 'Expired', className: 'bg-gray-500 text-white' };
  if (days === 0) return { text: t.expiresToday || 'Expires today!', className: 'bg-red-600 text-white' };
  if (days <= 3) return { text: `${t.expiresIn || 'Expires in'} ${days}d`, className: 'bg-orange-500 text-white' };
  if (days <= 7) return { text: `${days} ${t.daysLeft || 'days left'}`, className: 'bg-yellow-500 text-gray-900' };
  return null;
}

export default function OfferViewClient({ offer: initialOffer, retailer, offerId }: Props) {
  const { lang, t } = useLang();
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
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'like' || stored === 'dislike') setUserFeedback(stored);
    } catch { /* localStorage unavailable */ }
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
          try { localStorage.removeItem(`dn_feedback_${offerId}`); } catch { /* ignore */ }
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
        try { localStorage.setItem(`dn_feedback_${offerId}`, type); } catch { /* ignore */ }
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

  const expiryLabel = getExpiryLabel(offer.validUntil, t);
  const pdfSrc = offer.pdfUrl && offer.pdfUrl !== '#'
    ? (offer.pdfUrl.startsWith('http') ? offer.pdfUrl : `${apiBaseUrl}${offer.pdfUrl}`)
    : null;

  // Auto-open flipbook on mount if PDF exists
  useEffect(() => {
    if (pdfSrc) setIsFlipbookOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Sub-header */}
      <div className="bg-white shadow-sm border-b py-3 px-6 flex justify-between items-center">
        <Link href={`/offers/${offer.retailerId}`} className="text-gray-600 hover:text-gray-900 font-semibold transition flex items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i>
          <span className="hidden sm:inline">{t.backTo} {(lang !== 'en' && retailer?.[`name_${lang}`]) ? retailer[`name_${lang}`] : (retailer?.name || t.retailer)}</span>
          <span className="sm:hidden">{t.backTo}</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition">
            <i className="fa-solid fa-share-nodes"></i>
            <span className="hidden sm:inline">{t.share}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-4 px-4">
        <Breadcrumbs type="offer" id={offerId} />

        {/* Compact offer info bar */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">

            {/* Left: title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {offer.badge && (
                  <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-red-200">
                    {(lang !== 'en' && offer[`badge_${lang}`]) ? offer[`badge_${lang}`] : offer.badge}
                  </span>
                )}
                {expiryLabel && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${expiryLabel.className}`}>{expiryLabel.text}</span>
                )}
              </div>
              <h1 className="text-lg md:text-xl font-extrabold text-gray-900 truncate">
                {(lang !== 'en' && offer[`title_${lang}`]) ? offer[`title_${lang}`] : offer.title}
              </h1>
              {retailer && (
                <Link href={`/offers/${retailer.id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition mt-1">
                  <i className="fa-solid fa-store text-red-400 text-xs"></i>
                  {(lang !== 'en' && retailer?.[`name_${lang}`]) ? retailer[`name_${lang}`] : retailer?.name}
                  <span className="text-gray-300 mx-1">·</span>
                  <i className="fa-regular fa-calendar text-xs"></i>
                  {t.until} {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : '—'}
                </Link>
              )}
            </div>

            {/* Right: engagement actions */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <RatingWidget offerId={offerId} initialRating={offer.rating || 0} initialCount={offer.ratingCount || 0} />
              <button
                onClick={() => handleFeedback('like')}
                disabled={userFeedback === 'dislike'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-bold transition ${userFeedback === 'like' ? 'bg-green-500 text-white border-green-600' : 'text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-40'}`}
              >
                <i className={userFeedback === 'like' ? 'fa-solid fa-thumbs-up' : 'fa-regular fa-thumbs-up'}></i> {offer.likes || 0}
              </button>
              <button
                onClick={() => handleFeedback('dislike')}
                disabled={userFeedback === 'like'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-bold transition ${userFeedback === 'dislike' ? 'bg-red-500 text-white border-red-600' : 'text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-40'}`}
              >
                <i className={userFeedback === 'dislike' ? 'fa-solid fa-thumbs-down' : 'fa-regular fa-thumbs-down'}></i> {offer.dislikes || 0}
              </button>
              <SaveButton offerId={offerId} />
              {offer.couponCode && (
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-bold transition ${copied ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                >
                  <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'}></i>
                  {copied ? t.copied : offer.couponCode}
                </button>
              )}
              {(offer.retailerUrl || offer.couponUrl) && (
                <a
                  href={`${apiBaseUrl}/api/redirect/offer/${offer.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black shadow hover:shadow-md transition"
                >
                  <i className="fa-solid fa-bolt text-yellow-300"></i> {t.goToDeal}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Cover image fallback (shown only when no PDF) */}
        {!pdfSrc && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex justify-center mb-4">
            <div className="relative w-full max-w-2xl" style={{ aspectRatio: '3/4' }}>
              <SafeImage src={offer.image} alt={offer.title} fill sizes="(max-width: 768px) 100vw, 672px" className="rounded-xl object-contain" priority />
            </div>
          </div>
        )}

        {/* Open flipbook button (shown when PDF exists but flipbook was closed) */}
        {pdfSrc && !isFlipbookOpen && (
          <button
            onClick={() => setIsFlipbookOpen(true)}
            className="w-full flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold text-xl py-5 rounded-2xl shadow-md transition mb-4"
          >
            <i className="fa-solid fa-book-open text-2xl"></i> {t.viewCatalog}
          </button>
        )}

        <AdSlot format="horizontal" className="my-4" />

        {/* Share panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t.shareThis}</p>
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(`🔥 ${offer.title}\n${siteUrl}/view/${offerId}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition">
              <i className="fa-brands fa-whatsapp"></i>WhatsApp
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/view/${offerId}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition">
              <i className="fa-brands fa-facebook-f"></i>Facebook
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔥 ${offer.title}`)}&url=${encodeURIComponent(`${siteUrl}/view/${offerId}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-bold transition">
              <i className="fa-brands fa-x-twitter"></i>X
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(`${siteUrl}/view/${offerId}`)}&text=${encodeURIComponent(`🔥 ${offer.title}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition">
              <i className="fa-brands fa-telegram"></i>Telegram
            </a>
            <button onClick={handleShare} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-bold transition">
              <i className="fa-solid fa-link"></i>{t.copy}
            </button>
          </div>
        </div>
      </div>

      {isFlipbookOpen && pdfSrc && (
        <PDFFlipbook
          pdfUrl={pdfSrc}
          onClose={() => setIsFlipbookOpen(false)}
          title={(lang !== 'en' && offer[`title_${lang}`]) ? offer[`title_${lang}`] : offer.title}
          shareUrl={`${siteUrl}/view/${offerId}`}
          retailerUrl={offer.retailerUrl || offer.couponUrl}
          offerId={offer.id}
        />
      )}
    </div>
  );
}
