import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'DealNamaa Privacy Policy - how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy | DealNamaa',
    description: 'DealNamaa Privacy Policy - how we collect, use, and protect your data.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-16 px-4 rounded-xl mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-gray-500 text-sm mb-6">Last updated: April 2026</p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
        <p className="text-gray-600 mb-6">We collect information you provide directly to us.</p>

        <h2 className="text-xl font-bold text-gray-800 mb-4">2. How We Use Information</h2>
        <p className="text-gray-600 mb-6">We use the information to provide and improve our services.</p>

        <h2 className="text-xl font-bold text-gray-800 mb-4">3. Data Security</h2>
        <p className="text-gray-600 mb-6">We implement appropriate security measures to protect your data.</p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-red-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}