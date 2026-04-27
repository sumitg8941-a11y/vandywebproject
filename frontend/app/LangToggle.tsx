'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'dn_lang';

export const translations = {
  ar: {
    home: 'الرئيسية',
    retailers: 'المتاجر',
    coupons: 'الكوبونات',
    search: 'بحث',
    findDeals: 'ابحث عن عروض',
    heroTitle: 'اكتشف أفضل\nالعروض بالقرب منك',
    heroSub: 'تصفح آلاف المنشورات والكوبونات والعروض الحصرية من كبرى المتاجر — كل شيء في مكان واحد.',
    newDeals: '🔥 عروض جديدة كل أسبوع',
    selectCountry: 'اختر دولة',
    topRetailers: 'أبرز المتاجر',
    viewAll: 'عرض الكل',
    expiringWeek: 'تنتهي هذا الأسبوع',
    dontMiss: 'لا تفوّت الفرصة!',
    latestOffers: 'أحدث الكوبونات والعروض',
    noRetailers: 'لا توجد متاجر بعد.',
    noOffers: 'لا توجد عروض بعد.',
    noCountries: 'لا توجد دول بعد. أضف بعضها عبر لوحة الإدارة.',
    backendError: 'تعذّر الاتصال بالخادم. هل الخادم يعمل على المنفذ 3000؟',
    offer: 'عرض',
    offers: 'عروض',
    noActiveOffers: 'لا توجد عروض نشطة',
    until: 'حتى',
    coveringCities: 'يغطي متاجر في مدن ومناطق متعددة',
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
    selectCountry: 'Select a Country',
    topRetailers: 'Top Retailers',
    viewAll: 'View All',
    expiringWeek: 'Expiring This Week',
    dontMiss: "Don't miss out!",
    latestOffers: 'Latest Coupons & Offers',
    noRetailers: 'No retailers available yet.',
    noOffers: 'No offers available yet.',
    noCountries: 'No countries yet. Add some via the Admin Panel.',
    backendError: 'Could not connect to the backend. Is your server running on port 3000?',
    offer: 'offer',
    offers: 'offers',
    noActiveOffers: 'No active offers',
    until: 'Until',
    coveringCities: 'Covering retailers across multiple cities & regions',
  },
} as const;

type Lang = 'en' | 'ar';
type T = Record<string, string>;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) || 'en') as Lang;
    setLangState(saved);
    applyLang(saved);
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
    applyLang(l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

function applyLang(lang: Lang) {
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
