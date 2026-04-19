"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const apiBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:3000` : 'http://127.0.0.1:3000';

    try {
      const res = await fetch(`${apiBaseUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit feedback');
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div>
      <div className="bg-green-600 text-white text-center py-12 px-4 shadow-inner">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">We Value Your Feedback</h1>
        <p className="text-lg opacity-90">Help us improve DealNamaa by sharing your thoughts.</p>
      </div>

      <div className="max-w-2xl mx-auto p-6 mt-8 mb-12">
        {status === 'success' ? (
          <div className="bg-green-100 text-green-800 p-8 rounded-lg text-center shadow-md border border-green-200">
            <i className="fa-solid fa-circle-check text-4xl mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="mb-6">Your feedback has been successfully submitted and will be reviewed by our team.</p>
            <Link href="/">
              <button className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition">
                Return to Home
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            {status === 'error' && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 text-sm font-semibold">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i> There was an error submitting your feedback. Please try again.
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Your Name</label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="John Doe" />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
              <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="john@example.com" />
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Your Message</label>
              <textarea id="message" name="message" required value={formData.message} onChange={handleChange} rows={5} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Tell us what you love or what we can improve..."></textarea>
            </div>
            
            <button type="submit" disabled={status === 'submitting'} className={`w-full bg-gray-900 text-white font-bold py-3 rounded-md transition ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'}`}>
              {status === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}