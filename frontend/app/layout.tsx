import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

// Automatically optimizes and loads the Poppins font!
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
    <html lang="en">
      <head>
        {/* Load FontAwesome Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${poppins.className} bg-gray-50 text-gray-900`}>
        
        {/* Global Navigation Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
          <div className="text-2xl font-bold text-green-600">
            <i className="fa-solid fa-tags"></i> DealNamaa
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-green-600 font-semibold transition">Home</a>
            <a href="#" className="hover:text-green-600 font-semibold transition">Retailers</a>
            <a href="#" className="hover:text-green-600 font-semibold transition">Coupons</a>
          </nav>
        </header>
        
        {/* Dynamic Page Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-gray-900 text-gray-400 text-center p-8 mt-12">
          <div className="flex justify-center space-x-6 mb-4 text-xl">
            <i className="fa-brands fa-facebook hover:text-white cursor-pointer transition"></i>
            <i className="fa-brands fa-twitter hover:text-white cursor-pointer transition"></i>
            <i className="fa-brands fa-instagram hover:text-white cursor-pointer transition"></i>
          </div>
          <div className="mb-4">
            <a href="/feedback" className="text-sm hover:text-white transition underline">Share Feedback</a>
          </div>
          <p>&copy; 2026 DealNamaa. All rights reserved.</p>
        </footer>
        <GoogleAnalytics gaId="G-YOUR_TRACKING_ID" />
      </body>
    </html>
  )
}
