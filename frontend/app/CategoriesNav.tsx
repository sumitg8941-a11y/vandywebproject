'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from './LangToggle';

const CATEGORIES = [
  { key: 'all',          icon: 'fa-solid fa-border-all',       labelEn: 'All Deals',     labelAr: 'كل العروض',       labelUr: 'تمام ڈیلز',       labelHi: 'सभी डील्स' },
  { key: 'supermarket',  icon: 'fa-solid fa-cart-shopping',    labelEn: 'Supermarket',   labelAr: 'سوبرماركت',       labelUr: 'سپر مارکیٹ',      labelHi: 'सुपरमार्केट' },
  { key: 'electronics',  icon: 'fa-solid fa-mobile-screen',    labelEn: 'Electronics',   labelAr: 'إلكترونيات',      labelUr: 'الیکٹرانکس',      labelHi: 'إلكترونيكس' },
  { key: 'fashion',      icon: 'fa-solid fa-shirt',            labelEn: 'Fashion',       labelAr: 'أزياء',           labelUr: 'فیشن',            labelHi: 'फैशन' },
  { key: 'home',         icon: 'fa-solid fa-couch',            labelEn: 'Home & Living', labelAr: 'المنزل',          labelUr: 'گھر',             labelHi: 'होम' },
  { key: 'beauty',       icon: 'fa-solid fa-spa',              labelEn: 'Beauty',        labelAr: 'الجمال',          labelUr: 'بیوٹی',           labelHi: 'ब्यूटी' },
  { key: 'food',         icon: 'fa-solid fa-utensils',         labelEn: 'Food & Dining', labelAr: 'طعام',            labelUr: 'کھانا',           labelHi: 'खाना' },
  { key: 'pharmacy',     icon: 'fa-solid fa-pills',            labelEn: 'Pharmacy',      labelAr: 'صيدلية',          labelUr: 'فارمیسی',         labelHi: 'फार्मेसी' },
  { key: 'sports',       icon: 'fa-solid fa-dumbbell',         labelEn: 'Sports',        labelAr: 'رياضة',           labelUr: 'کھیل',            labelHi: 'स्पोर्ट्स' },
  { key: 'travel',       icon: 'fa-solid fa-plane',            labelEn: 'Travel',        labelAr: 'سفر',             labelUr: 'سفر',             labelHi: 'यात्रा' },
];

function CategoriesNavInner() {
  const { lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const v = parseInt(searchParams.get('minDiscount') || '0', 10);
    setDiscount(isNaN(v) ? 0 : v);
  }, [searchParams]);

  function getLabel(cat: typeof CATEGORIES[0]) {
    if (lang === 'ar') return cat.labelAr;
    if (lang === 'ur') return cat.labelUr;
    if (lang === 'hi') return cat.labelHi;
    return cat.labelEn;
  }

  const handleSlider = (v: number) => {
    setDiscount(v);
    const params = new URLSearchParams(searchParams.toString());
    if (v > 0) params.set('minDiscount', String(v));
    else params.delete('minDiscount');
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 py-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide no-scrollbar flex-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={cat.key === 'all' ? '/search' : `/search?category=${cat.key}`}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-gray-600 transition-all duration-200 group min-w-[72px]"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-200">
                  <i className={`${cat.icon} text-sm group-hover:text-red-600 transition-colors`}></i>
                </div>
                <span className="text-[10px] font-semibold whitespace-nowrap leading-tight text-center">
                  {getLabel(cat)}
                </span>
              </Link>
            ))}
          </div>

          {/* Discount slider */}
          <div className="flex-shrink-0 flex items-center gap-2 pl-3 border-l border-gray-200 ml-2">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
                {discount > 0 ? `${discount}%+ off` : 'Discount'}
              </span>
              <input
                type="range"
                min={0}
                max={90}
                step={10}
                value={discount}
                onChange={e => handleSlider(Number(e.target.value))}
                className="w-24 accent-red-600 cursor-pointer"
                aria-label="Minimum discount percentage"
              />
            </div>
            {discount > 0 && (
              <button
                onClick={() => handleSlider(0)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Clear discount filter"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function CategoriesNav() {
  return (
    <Suspense fallback={null}>
      <CategoriesNavInner />
    </Suspense>
  );
}