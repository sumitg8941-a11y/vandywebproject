import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import LangToggle, { LangProvider } from './LangToggle'
import NavLinks from './NavLinks'
import MobileNav from './MobileNav'
import LogoLink from './LogoLink'
import HeaderSearch from './HeaderSearch'
import Tracker from './Tracker'
import FooterClient from './FooterClient'
import SavedLink from './SavedLink'
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
        {(settings?.faviconUrl || settings?.customLogoUrl) && <link rel="icon" href={settings?.faviconUrl || settings?.customLogoUrl} />}
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

        {/* Google AdSense Auto Ads */}
        {settings?.adSenseId && (
          <Script 
            async 
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adSenseId}`} 
            crossOrigin="anonymous" 
            strategy="afterInteractive" 
          />
        )}

        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

            <LogoLink className="flex items-center gap-2 text-red-600 font-black text-2xl tracking-tight hover:opacity-90 transition">
              {settings.customLogoUrl ? (
                <img src={settings.customLogoUrl} alt="DealNamaa Logo" className="h-8 object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-tags"></i>
                  <span>DealNamaa</span>
                </div>
              )}
            </LogoLink>

            <NavLinks />

            <div className="hidden md:flex items-center gap-3">
              <SavedLink />
              <LangToggle />
              <HeaderSearch />
            </div>

            <div className="flex md:hidden items-center gap-4">
              <Link href="/search" className="text-gray-700 hover:text-red-600 transition text-xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </Link>
              <SavedLink />
              <MobileNav />
            </div>
          </div>
        </header>

        <Tracker type="visit" />
        <main className="min-h-screen">
          {children}
        </main>

        <FooterClient settings={settings} footerData={footerData} />
        </LangProvider>
      </body>
    </html>
  )
}
