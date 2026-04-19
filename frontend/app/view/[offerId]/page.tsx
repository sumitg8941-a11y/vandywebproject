"use client";

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';

export default function ViewOfferPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = use(params);
  const offerId = resolvedParams.offerId;
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const startTimeRef = useRef(Date.now());
  const maxPageRef = useRef(1); // Optional: If we want to track scroll depth within PDF later

  const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';

  useEffect(() => {
    // Fetch offer details
    fetch(`${apiBaseUrl}/api/offer/${offerId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOffer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Cleanup: Send time tracking when leaving the page
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Ping the server to save the stat. Use keepalive so it works on unmount
      fetch(`${apiBaseUrl}/api/track/offer-stats/${offerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: durationSeconds, maxPage: maxPageRef.current }),
        keepalive: true
      }).catch(console.error);
    };
  }, [offerId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading Offer Details...</div>;
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4"><i className="fa-solid fa-triangle-exclamation"></i> Offer Not Found</h2>
        <p className="text-gray-600 mb-6">The offer you are looking for does not exist or has expired.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Top Action Bar */}
      <div className="bg-white shadow-sm border-b p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => window.history.back()} 
            className="text-gray-600 hover:text-blue-600 font-semibold flex items-center"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>
          <div className="text-xl font-bold text-gray-800 hidden sm:block truncate mx-4">
            {offer.title}
          </div>
          <div className="flex space-x-4">
            {offer.couponCode && (
              <div className="bg-green-100 text-green-800 border border-green-500 font-bold px-4 py-2 rounded-md shadow flex items-center">
                <i className="fa-solid fa-ticket mr-2"></i> {offer.couponCode}
              </div>
            )}
            <a 
            href={`${apiBaseUrl}/api/redirect/offer/${offer.id || offer._id}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold shadow hover:bg-blue-700 transition flex items-center"
            >
              Shop Now <i className="fa-solid fa-external-link-alt ml-2"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col mb-12">
        {/* Details Area on Top */}
        <div className="p-8 border-b bg-white relative">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              {offer.badge && (
                <span className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm mb-3">{offer.badge}</span>
              )}
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{offer.title}</h1>
              <p className="text-gray-600 font-medium text-lg"><i className="fa-regular fa-calendar mr-2"></i> Valid from: {new Date(offer.date).toLocaleDateString()}</p>
            </div>
            
            <div className="flex-shrink-0">
               <a 
                href={`http://localhost:3000/api/redirect/offer/${offer.id || offer._id}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-md hover:bg-blue-700 hover:scale-105 transition-all w-full md:w-auto justify-center"
              >
                {offer.couponCode ? `Use Code: ${offer.couponCode}` : 'Get Deal'} <i className="fa-solid fa-cart-shopping ml-3"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Massive Document Viewer Area */}
        <div className="w-full h-[85vh] bg-gray-900 relative">
          {offer.pdfUrl && offer.pdfUrl !== '#' ? (
            <iframe 
              src={`${offer.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full border-0" 
              title={offer.title}
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
              <img src={offer.image} alt={offer.title} className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}