'use client';

import { useState } from 'react';

export default function FeedbackPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('sending');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });
            if (!res.ok) throw new Error();
            setStatus('done');
            setName(''); setEmail(''); setMessage('');
        } catch {
            setStatus('error');
        }
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-black text-gray-900 mb-1">Share your feedback</h1>
                <p className="text-gray-500 text-sm mb-6">
                    We read every message and use it to improve DealNamaa.{' '}
                    <span className="text-green-600 font-semibold">We never spam — your email is only used to follow up if needed.</span>
                </p>

                {status === 'done' ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3">🎉</div>
                        <p className="text-gray-800 font-semibold text-lg">Thank you for your feedback!</p>
                        <p className="text-gray-500 text-sm mt-1">We appreciate you taking the time to write to us.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-red-600 font-semibold text-sm hover:underline"
                        >
                            Submit another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Your name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Ahmed"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Tell us what you think, what's missing, or what you love..."
                                rows={4}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition text-sm disabled:opacity-60"
                        >
                            {status === 'sending' ? 'Sending...' : 'Send Feedback'}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                            <i className="fa-solid fa-lock mr-1"></i>
                            Your email is private and will never be shared or used for marketing.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
