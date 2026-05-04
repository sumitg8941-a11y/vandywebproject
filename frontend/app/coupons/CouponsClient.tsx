'use client';

import Link from 'next/link';
import SafeImage from '../SafeImage';
import CouponReveal from '../CouponReveal';
import AdSlot from '../AdSlot';
import { useLang } from '../LangToggle';

export default function CouponsClient({ coupons, latest }: { coupons: any[], latest: any[] }) {
  const { lang, t } = useLang();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
      <div className="text-center mb-10">
        <span className="inline-block bg-green-100 text-green-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
          {lang === 'en' ? 'Save More' : (lang === 'ar' ? 'وفر أكثر' : (lang === 'ur' ? 'مزید بچائیں' : 'अधिक बचत करें'))}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          {lang === 'en' ? 'Coupons & Promo Codes' : (lang === 'ar' ? 'الكوبونات وأكواد الخصم' : (lang === 'ur' ? 'کوپن اور پرومو کوڈز' : 'कूपन और प्रोमो कोड'))}
        </h1>
        <p className="text-gray-600">
          {lang === 'en' ? 'Tap to reveal exclusive coupon codes from top retailers.' : (lang === 'ar' ? 'اضغط للكشف عن أكواد الخصم الحصرية من أفضل المتاجر.' : (lang === 'ur' ? 'ٹاپ ریٹیلرز سے خصوصی کوپن کوڈز ظاہر کرنے کے لیے تھپتھپائیں۔' : 'शीर्ष खुदरा विक्रेताओं से विशेष कूपन कोड प्रकट करने के लिए टैप करें।'))}
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Coupon Cards */}
      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {coupons.map((o: any) => (
            <div key={o.id || o._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                {o.retailer?.logo || o.retailer?.image ? (
                  <div className="relative w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <SafeImage src={o.retailer.logo || o.retailer.image} alt={o.retailer.name} fill sizes="40px" className="object-contain p-1" />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0 text-start">
                  <h3 className="text-sm font-bold text-gray-800 truncate">
                    {(lang !== 'en' && o[`title_${lang}`]) ? o[`title_${lang}`] : o.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {(lang !== 'en' && o.retailer?.[`name_${lang}`]) ? o.retailer[`name_${lang}`] : o.retailer?.name || o.retailerId}
                  </p>
                </div>
              </div>
              {(o.badge || o[`badge_${lang}`]) && (
                <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                  {(lang !== 'en' && o[`badge_${lang}`]) ? o[`badge_${lang}`] : o.badge}
                </span>
              )}
              <CouponReveal code={o.couponCode} />
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>
                  <i className="fa-regular fa-calendar mr-1"></i>
                  {lang === 'en' ? 'Until' : (lang === 'ar' ? 'حتى' : (lang === 'ur' ? 'تک' : 'तक'))} {new Date(o.validUntil).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}
                </span>
                <Link href={`/view/${o.id || o._id}`} className="text-red-600 font-bold hover:underline">
                  {lang === 'en' ? 'View Deal →' : (lang === 'ar' ? 'عرض الصفقة ←' : (lang === 'ur' ? 'ڈیل دیکھیں ←' : 'डील देखें →'))}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-yellow-50 rounded-xl border border-yellow-200 mt-6">
          <i className="fa-solid fa-ticket text-4xl text-yellow-400 mb-3"></i>
          <h2 className="text-xl font-bold text-gray-800">
            {lang === 'en' ? 'No Coupons Yet' : (lang === 'ar' ? 'لا يوجد كوبونات بعد' : (lang === 'ur' ? 'ابھی تک کوئی کوپن نہیں' : 'अभी तक कोई कूपन नहीं'))}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {lang === 'en' ? 'Check back soon for exclusive promo codes!' : (lang === 'ar' ? 'تحقق مرة أخرى قريبا لأكواد الخصم الحصرية!' : (lang === 'ur' ? 'خصوصی پرومو کوڈز کے لیے جلد ہی دوبارہ چیک کریں!' : 'विशेष प्रोमो कोड के लिए जल्द ही दोबारा देखें!'))}
          </p>
        </div>
      )}

      <AdSlot format="horizontal" className="mt-8" />

      {/* Latest Offers */}
      <div className="mt-12">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          {lang === 'en' ? 'Latest Offers' : (lang === 'ar' ? 'أحدث العروض' : (lang === 'ur' ? 'تازہ ترین پیشکشیں' : 'नवीनतम ऑफ़र'))}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {latest.map((o: any) => (
            <Link href={`/view/${o.id || o._id}`} key={o.id || o._id}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group">
                <div className="overflow-hidden aspect-[3/4] bg-gray-50 relative">
                  <SafeImage src={o.image} alt={o.title} fill sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-3 border-t border-gray-100 text-start">
                  <h3 className="text-xs font-bold text-gray-800 truncate">
                    {(lang !== 'en' && o[`title_${lang}`]) ? o[`title_${lang}`] : o.title}
                  </h3>
                  {o.retailerName && (
                    <p className="text-xs text-gray-500 truncate">
                      <i className="fa-solid fa-store mr-1 text-red-400"></i>
                      {(lang !== 'en' && o[`retailerName_${lang}`]) ? o[`retailerName_${lang}`] : o.retailerName}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
