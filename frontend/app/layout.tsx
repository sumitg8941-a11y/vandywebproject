import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import Head from 'next/head';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300', '400', '600', '700'] 
})

export const metadata: Metadata = {
  title: 'DealNamaa - Dubai Offers & Discounts',
  description: 'Explore thousands of flyers, coupons, and discounts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <title>DealNamaa</title>
        <meta name="description" content="Find the best deals, coupons, and offers on DealNamaa." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="DealNamaa - Best Deals and Offers" />
        <meta property="og:description" content="Discover amazing deals and offers on DealNamaa." />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:type" content="website" />
      </Head>
      <html lang="en">
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </head>
        <body className={`${poppins.className} bg-gray-50 text-gray-900`}>
          
          <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
            <div className="text-3xl font-black text-red-600 tracking-tight">
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="hover:text-red-600 font-bold transition">Home</a>
                <a href="/#retailers" className="hover:text-red-600 font-bold transition">Retailers</a>
                <a href="/#coupons" className="hover:text-red-600 font-bold transition">Coupons</a>
              </nav>
            </div>
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
    </>
  )
}