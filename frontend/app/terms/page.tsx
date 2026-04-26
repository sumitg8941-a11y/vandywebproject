import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'DealNamaa Terms of Service - read our usage terms and conditions.',
  openGraph: {
    title: 'Terms of Service | DealNamaa',
    description: 'DealNamaa Terms of Service - read our usage terms and conditions.',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-16 px-4 rounded-xl mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-500 text-sm mb-6">Last updated: April 2026</p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-600 mb-6">By accessing and using DealNamaa, you accept and agree to be bound by the terms.</p>

        <h2 className="text-xl font-bold text-gray-800 mb-4">2. Use License</h2>
        <p className="text-gray-600 mb-6">Permission is granted to temporarily use DealNamaa for personal, non-commercial use only.</p>

        <h2 className="text-xl font-bold text-gray-800 mb-4">3. Disclaimer</h2>
        <p className="text-gray-600 mb-6">The materials on DealNamaa are provided "as is".</p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-red-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}