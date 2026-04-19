"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function OfferView({ params }: { params: { offerId: string } }) {
  const [offerId, setOfferId] = useState<string>('');

  // Safely grab the ID from the URL parameters
  useEffect(() => {
    Promise.resolve(params).then(p => setOfferId(p.offerId));
  }, [params]);

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const startTimeRef = useRef(Date.now());
  const maxPageRef = useRef(1);

  const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';

  useEffect(() => {
    if (!offerId) return;

    // Fetch offer details
    fetch(`${apiBaseUrl}/api/offer/${offerId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOffer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Track time spent viewing the offer when the user leaves
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      fetch(`${apiBaseUrl}/api/track/offer-stats/${offerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: durationSeconds, maxPage: maxPageRef.current }),
        keepalive: true
      }).catch(err => console.error(err));
    };
  }, [offerId, apiBaseUrl]);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (feedbackGiven || !offer) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/offer/${offerId}/${type}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOffer({ ...offer, likes: data.likes, dislikes: data.dislikes });
        setFeedbackGiven(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback');
    }
  };

  if (!offerId || loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading Offer Details...</div>;
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <i className="fa-solid fa-triangle-exclamation text-6xl text-red-500 mb-4"></i>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Offer Not Found</h1>
        <p className="text-gray-600 mb-6">This offer might have expired or been removed.</p>
        <Link href="/"><button className="bg-gray-900 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition">Return Home</button></Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Top Nav */}
      <div className="bg-white shadow-sm border-b py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <Link href={`/offers/${offer.retailerId}`} className="text-gray-600 hover:text-gray-900 font-semibold transition">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back to Retailer
        </Link>
        <div className="font-black text-red-600 tracking-tight hidden sm:block">HOT DEAL <i className="fa-solid fa-fire text-orange-500"></i></div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-4">
        {/* Offer Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start mb-8 relative overflow-hidden">
          <div className="flex-1 w-full">
            {offer.badge && (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-red-200 shadow-sm">
                {offer.badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{offer.title}</h1>
            <p className="text-gray-600 font-medium text-lg"><i className="fa-regular fa-calendar mr-2"></i> Valid from: {new Date(offer.date).toLocaleDateString()}</p>
            
            {/* Like / Dislike Feedback Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold">
              <span className="text-gray-500">Did this help you?</span>
              <button onClick={() => handleFeedback('like')} disabled={feedbackGiven} className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition ${feedbackGiven ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50 hover:border-green-300'} text-green-600 border-green-200`}>
                <i className="fa-regular fa-thumbs-up"></i> <span>Yes ({offer.likes || 0})</span>
              </button>
              <button onClick={() => handleFeedback('dislike')} disabled={feedbackGiven} className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition ${feedbackGiven ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:border-red-300'} text-red-600 border-red-200`}>
                <i className="fa-regular fa-thumbs-down"></i> <span>No ({offer.dislikes || 0})</span>
              </button>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
             <a 
              href={`${apiBaseUrl}/api/redirect/offer/${offer.id || offer._id}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-extrabold text-lg md:text-xl shadow-lg hover:bg-yellow-500 hover:scale-105 transition-all w-full justify-center border border-yellow-500"
            >
              View Full Catalog <i className="fa-solid fa-arrow-up-right-from-square ml-3"></i>
            </a>
            {offer.couponCode && (
              <div className="mt-4 bg-gray-100 text-gray-800 px-4 py-2 rounded border border-dashed border-gray-400 font-mono text-center w-full text-lg">
                Code: <strong>{offer.couponCode}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Flyer Image Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8 flex justify-center">
          <img src={offer.image} alt={offer.title} className="max-w-full h-auto rounded-xl shadow-sm border border-gray-50" />
        </div>
      </div>
    </div>
  );
}