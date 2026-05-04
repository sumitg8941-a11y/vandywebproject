'use client';

import Link from 'next/link';
import { useLang } from './LangToggle';

export default function FooterClient({
  settings,
  footerData,
}: {
  settings: any;
  footerData: { countries: any[]; retailers: any[] };
}) {
  const { t } = useLang();
  
  const facebookUrl = settings.facebookUrl || '';
  const twitterUrl = settings.twitterUrl || '';
  const instagramUrl = settings.instagramUrl || '';

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">DealNamaa</h3>
            <p className="text-sm mb-4">{t.heroSub}</p>
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
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{t.browseByLocation}</h3>
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
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{t.popularStores}</h3>
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
              <li><Link href="/" className="hover:text-white transition">{t.home}</Link></li>
              <li><Link href="/search" className="hover:text-white transition">{t.search}</Link></li>
              <li><Link href="/feedback" className="hover:text-white transition">Feedback</Link></li>
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
  );
}
