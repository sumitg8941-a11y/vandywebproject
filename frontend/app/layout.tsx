import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import LangToggle, { LangProvider } from './LangToggle'
import NavLinks from './NavLinks'
import MobileNav from './MobileNav'
import FindDealsButton from './FindDealsButton'
import Tracker from './Tracker'
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

async function getFooterData() {
  try {
    const apiBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
    const [countries, retailers] = await Promise.all([
      fetch(`${apiBaseUrl}/api/countries`, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : []),
      fetch(`${apiBaseUrl}/api/retailers?limit=8&sort=clicks`, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : []),
    ]);
    return { countries, retailers };
  } catch {
    return { countries: [], retailers: [] };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, footerData] = await Promise.all([getSettings(), getFooterData()]);
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
        <LangProvider>

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
              {settings.customLogoUrl ? (
                <img src={settings.customLogoUrl} alt="DealNamaa Logo" className="h-8 object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-tags"></i>
                  <span>DealNamaa</span>
                </div>
              )}
            </Link>

            <NavLinks />

            <div className="hidden md:flex items-center gap-3">
              <LangToggle />
              <FindDealsButton />
            </div>

            <div className="flex md:hidden items-center gap-4">
              <Link href="/search" className="text-gray-700 hover:text-red-600 transition text-xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </Link>
              <MobileNav />
            </div>
          </div>
        </header>

        <Tracker type="visit" />
        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">DealNamaa</h3>
                <p className="text-sm mb-4">Your trusted source for the best deals, coupons, and flyers across the Middle East.</p>
                <div className="flex space-x-4 text-xl">
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Facebook">
                      <i className="fa-brands fa-facebook"></i>
                    </a>
                  )}
                  {twitterUrl && (
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Twitter / X">
                      <i className="fa-brands fa-twitter"></i>
                    </a>
                  )}
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Instagram">
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                  )}
                </div>
              </div>

              {footerData.countries.length > 0 && (
                <div>
                  <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Browse by Country</h3>
                  <ul className="space-y-2 text-sm">
                    {footerData.countries.slice(0, 6).map((c: any) => (
                      <li key={c.id}>
                        <Link href={`/cities/${c.id}`} className="hover:text-white transition">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {footerData.retailers.length > 0 && (
                <div>
                  <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Popular Retailers</h3>
                  <ul className="space-y-2 text-sm">
                    {footerData.retailers.map((r: any) => (
                      <li key={r.id}>
                        <Link href={`/offers/${r.id}`} className="hover:text-white transition">
                          {r.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                  <li><Link href="/search" className="hover:text-white transition">Search Deals</Link></li>
                  <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                  <li><Link href="/feedback" className="hover:text-white transition">Feedback</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 text-center text-sm">
              <p className="mb-2">&copy; {new Date().getFullYear()} DealNamaa. All rights reserved.</p>
              <p className="text-xs text-gray-600">
                Developed by{' '}
                <a
                  href="https://www.linkedin.com/in/sumit-gupta-4a493837"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Sumit Gupta's LinkedIn profile"
                  className="text-gray-500 hover:text-white transition-colors duration-200 underline underline-offset-2"
                >
                  Sumit Gupta
                </a>
              </p>
            </div>
          </div>
        </footer>
        </LangProvider>
      </body>
    </html>
  )
}
