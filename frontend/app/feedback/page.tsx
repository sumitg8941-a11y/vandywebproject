'use client';

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { useLang } from '../LangToggle';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export default function FeedbackPage() {
    const { t } = useLang();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const recaptchaRef = useRef<HTMLDivElement>(null);

    const validateEmail = (val: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!val) { setEmailError(''); return false; }
        if (!regex.test(val)) { setEmailError('Please enter a valid email (e.g. you@example.com)'); return false; }
        setEmailError('');
        return true;
    };

    useEffect(() => {
        if (RECAPTCHA_SITE_KEY && typeof window !== 'undefined' && (window as any).grecaptcha && recaptchaRef.current) {
            try {
                (window as any).grecaptcha.render(recaptchaRef.current, {
                    sitekey: RECAPTCHA_SITE_KEY,
                    callback: (token: string) => setRecaptchaToken(token),
                    'expired-callback': () => setRecaptchaToken(''),
                });
            } catch {}
        }
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg('');
        if (!validateEmail(email)) return;
        if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
            setErrorMsg('Please complete the verification.');
            return;
        }
        setStatus('sending');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message, recaptchaToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            setStatus('done');
            setName(''); setEmail(''); setMessage(''); setRecaptchaToken('');
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || 'Something went wrong. Please try again.');
        }
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-16">
            {RECAPTCHA_SITE_KEY && (
                <Script
                    src="https://www.google.com/recaptcha/api.js"
                    strategy="lazyOnload"
                    onLoad={() => {
                        if (recaptchaRef.current && (window as any).grecaptcha) {
                            try {
                                (window as any).grecaptcha.render(recaptchaRef.current, {
                                    sitekey: RECAPTCHA_SITE_KEY,
                                    callback: (token: string) => setRecaptchaToken(token),
                                    'expired-callback': () => setRecaptchaToken(''),
                                });
                            } catch {}
                        }
                    }}
                />
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-black text-gray-900 mb-1">{t.feedbackTitle || 'Share your feedback'}</h1>
                <p className="text-gray-500 text-sm mb-6">
                    {t.feedbackSub || 'Help us improve DealNamaa. Share your thoughts or report an issue.'}
                </p>

                {status === 'done' ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3">🎉</div>
                        <p className="text-gray-800 font-semibold text-lg">Thank you!</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-red-600 font-semibold text-sm hover:underline"
                        >
                            {t.submit || 'Submit'} another
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.name || 'Name'}</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="..."
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.email || 'Email'}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }}
                                onBlur={() => validateEmail(email)}
                                placeholder="you@example.com"
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${emailError ? 'border-red-400' : 'border-gray-200'}`}
                            />
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.message || 'Message'}</label>
                            <textarea
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="..."
                                rows={4}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {RECAPTCHA_SITE_KEY && (
                            <div className="flex justify-center">
                                <div ref={recaptchaRef}></div>
                            </div>
                        )}

                        {(status === 'error' || errorMsg) && (
                            <p className="text-red-500 text-sm">{errorMsg || 'Error'}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition text-sm disabled:opacity-60"
                        >
                            {status === 'sending' ? '...' : t.submit || 'Submit'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
