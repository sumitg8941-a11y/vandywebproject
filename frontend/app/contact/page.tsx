import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the DealNamaa team.',
  openGraph: {
    title: 'Contact Us | DealNamaa',
    description: 'Get in touch with the DealNamaa team.',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-16 px-4 rounded-xl mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Contact Us</h1>
        <p className="text-xl opacity-95">We'd Love to Hear From You</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <i className="fa-solid fa-envelope text-3xl text-red-600 mb-4"></i>
            <h3 className="font-bold text-gray-800 mb-2">Email</h3>
            <p className="text-gray-600">hello@dealnamaa.com</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <i className="fa-solid fa-phone text-3xl text-red-600 mb-4"></i>
            <h3 className="font-bold text-gray-800 mb-2">Phone</h3>
            <p className="text-gray-600">+971 4 123 4567</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="text-red-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}