import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about DealNamaa - your central hub for coupons and offers across the Middle East.',
  openGraph: {
    title: 'About Us | DealNamaa',
    description: 'Learn more about DealNamaa - your central hub for coupons and offers across the Middle East.',
  },
};

export default async function AboutPage() {
  const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
  let settings: any = {};
  try {
    const res = await fetch(`${apiBaseUrl}/api/settings`, { next: { revalidate: 300 } });
    if (res.ok) settings = await res.json();
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-16 px-4 rounded-xl mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">About DealNamaa</h1>
        <p className="text-xl opacity-95">Your Central Hub for Savings</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        {settings.aboutUs ? (
          <div dangerouslySetInnerHTML={{ __html: settings.aboutUs }} className="prose max-w-none text-gray-600" />
        ) : (
          <div className="content-fallback">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Who We Are</h2>
            <p className="text-gray-600 mb-6">
              DealNamaa is a centralized platform that brings together the best coupons, offers, and discounts 
              from various shopping platforms in one place.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Our mission is to make shopping more affordable by providing easy access to the latest deals, 
              flyers, and promotional offers from top retailers in Dubai and the Middle East region.
            </p>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Curated coupons and promo codes from top retailers</li>
              <li>Latest promotional flyers and catalogs</li>
              <li>Exclusive deals and sponsored offers</li>
              <li>Easy search across multiple categories</li>
            </ul>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/">
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition">
              Start Saving Now
            </button>
          </Link>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-red-600 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}