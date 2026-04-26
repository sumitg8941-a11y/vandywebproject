import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Link from 'next/link'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${poppins.className} bg-gray-50 text-gray-900`}>

        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

            {/* Logo - always visible */}
            <Link href="/" className="flex items-center gap-2 text-red-600 font-black text-2xl tracking-tight hover:opacity-90 transition">
              <i className="fa-solid fa-tags"></i>
              <span>DealNamaa</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-semibold">
              <Link href="/" className="hover:text-red-600 transition">Home</Link>
              <Link href="/#retailers" className="hover:text-red-600 transition">Retailers</Link>
              <Link href="/#coupons" className="hover:text-red-600 transition">Coupons</Link>
              <Link href="/search" className="hover:text-red-600 transition">Search</Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center">
              <Link href="/search" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition text-sm">
                <i className="fa-solid fa-magnifying-glass mr-2"></i>Find Deals
              </Link>
            </div>

            {/* Mobile: search icon + hamburger (CSS-only toggle) */}
            <div className="flex md:hidden items-center gap-4">
              <Link href="/search" className="text-gray-700 hover:text-red-600 transition text-xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </Link>
              <label htmlFor="mobile-menu-toggle" className="text-gray-700 hover:text-red-600 transition text-xl cursor-pointer">
                <i className="fa-solid fa-bars"></i>
              </label>
            </div>
          </div>

          {/* CSS-only mobile menu */}
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
            <i className="fa-brands fa-facebook hover:text-white cursor-pointer transition"></i>
            <i className="fa-brands fa-twitter hover:text-white cursor-pointer transition"></i>
            <i className="fa-brands fa-instagram hover:text-white cursor-pointer transition"></i>
          </div>
          <div className="mb-4 flex justify-center space-x-4 text-sm">
            <a href="/about" className="hover:text-white transition">About</a>
            <a href="/contact" className="hover:text-white transition">Contact</a>
            <a href="/terms" className="hover:text-white transition">Terms</a>
            <a href="/privacy" className="hover:text-white transition">Privacy</a>
            <a href="/feedback" className="hover:text-white transition underline">Feedback</a>
          </div>
          <p>&copy; 2026 DealNamaa. All rights reserved.</p>
        </footer>

        <GoogleAnalytics gaId="G-YOUR_TRACKING_ID" />
      </body>
    </html>
  )
}
