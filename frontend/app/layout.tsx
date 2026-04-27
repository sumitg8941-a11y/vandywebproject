import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import LangToggle from './LangToggle'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700']
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';

export const metadata: Metadata = {
  title: {
    default: 'DealNamaa - Offers, Coupons & Flyers',
    template: '%s | DealNamaa',
  },
  description: 'Explore thousands of flyers, coupons, and discounts from top retailers across the Middle East.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: 'DealNamaa',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

async function getSettings() {
  try {
    const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const res = await fetch(`${apiBaseUrl}/api/settings`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const gaId = settings.gaId || '';
  const facebookUrl = settings.facebookUrl || '';
  const twitterUrl = settings.twitterUrl || '';
  const instagramUrl = settings.instagramUrl || '';
  const feedbackUrl = settings.feedbackUrl || '/feedback';

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${poppins.className} bg-gray-50 text-gray-900`}>

        {/* Google Analytics — only injected when GA ID is set in admin */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}

        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

            <Link href="/" className="flex items-center gap-2 text-red-600 font-black text-2xl tracking-tight hover:opacity-90 transition">
              <i className="fa-solid fa-tags"></i>
              <span>DealNamaa</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-semibold">
              <Link href="/" className="hover:text-red-600 transition">Home</Link>
              <Link href="/#retailers" className="hover:text-red-600 transition">Retailers</Link>
              <Link href="/#coupons" className="hover:text-red-600 transition">Coupons</Link>
              <Link href="/search" className="hover:text-red-600 transition">Search</Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <LangToggle />
              <Link href="/search" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition text-sm">
                <i className="fa-solid fa-magnifying-glass mr-2"></i>Find Deals
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-4">
              <Link href="/search" className="text-gray-700 hover:text-red-600 transition text-xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </Link>
              <label htmlFor="mobile-menu-toggle" className="text-gray-700 hover:text-red-600 transition text-xl cursor-pointer">
                <i className="fa-solid fa-bars"></i>
              </label>
            </div>
          </div>

          <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
          <nav className="hidden peer-checked:block md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            <Link href="/" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
              <i className="fa-solid fa-house mr-3"></i>Home
            </Link>
            <Link href="/#retailers" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
              <i className="fa-solid fa-store mr-3"></i>Retailers
            </Link>
            <Link href="/#coupons" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
              <i className="fa-solid fa-ticket mr-3"></i>Coupons
            </Link>
            <Link href="/search" className="block py-2 px-3 rounded-lg text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 transition">
              <i className="fa-solid fa-magnifying-glass mr-3"></i>Search
            </Link>
          </nav>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-900 text-gray-400 text-center p-8 mt-12">
          <div className="flex justify-center space-x-6 mb-4 text-xl">
            {facebookUrl ? (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Facebook">
                <i className="fa-brands fa-facebook"></i>
              </a>
            ) : (
              <i className="fa-brands fa-facebook opacity-30"></i>
            )}
            {twitterUrl ? (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Twitter / X">
                <i className="fa-brands fa-twitter"></i>
              </a>
            ) : (
              <i className="fa-brands fa-twitter opacity-30"></i>
            )}
            {instagramUrl ? (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
            ) : (
              <i className="fa-brands fa-instagram opacity-30"></i>
            )}
          </div>
          <div className="mb-4 flex justify-center space-x-4 text-sm">
            <a href="/about" className="hover:text-white transition">About</a>
            <a href="/contact" className="hover:text-white transition">Contact</a>
            <a href="/terms" className="hover:text-white transition">Terms</a>
            <a href="/privacy" className="hover:text-white transition">Privacy</a>
            <a href="/feedback" className="hover:text-white transition">Feedback</a>
          </div>
          <p>&copy; {new Date().getFullYear()} DealNamaa. All rights reserved.</p>
        </footer>

      </body>
    </html>
  )
}
