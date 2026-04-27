'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dn_lang';

const translations: Record<string, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    retailers: 'المتاجر',
    coupons: 'الكوبونات',
    search: 'بحث',
    findDeals: 'ابحث عن عروض',
    heroTitle: 'اكتشف أفضل\nالعروض بالقرب منك',
    heroSub: 'تصفح آلاف المنشورات والكوبونات والعروض الحصرية من كبرى المتاجر — كل شيء في مكان واحد.',
    newDeals: '🔥 عروض جديدة كل أسبوع',
  },
  en: {
    home: 'Home',
    retailers: 'Retailers',
    coupons: 'Coupons',
    search: 'Search',
    findDeals: 'Find Deals',
    heroTitle: 'Find the Best\nDeals Near You',
    heroSub: 'Browse thousands of flyers, coupons, and exclusive offers from top retailers — all in one place.',
    newDeals: '🔥 New deals every week',
  },
};

export function useLang() {
  const [lang, setLangState] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) || 'en') as 'en' | 'ar';
    setLangState(saved);
    applyLang(saved);
  }, []);

  function setLang(l: 'en' | 'ar') {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
    applyLang(l);
  }

  return { lang, setLang, t: translations[lang] };
}

function applyLang(lang: 'en' | 'ar') {
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
}

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-600 transition bg-white text-gray-700"
      title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <i className="fa-solid fa-language text-base"></i>
      <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
    </button>
  );
}
