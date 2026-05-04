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
    browseByLocation: 'تصفح العروض حسب الموقع',
    startHere: 'ابدأ من هنا',
    topRetailers: 'أبرز المتاجر',
    popularStores: 'المتاجر الشهيرة',
    shopBrands: 'تسوق من علاماتك التجارية المفضلة',
    viewAll: 'عرض الكل',
    expiringWeek: 'تنتهي هذا الأسبوع',
    dontMiss: 'لا تفوّت الفرصة!',
    latestOffers: 'أحدث الكوبونات والعروض',
    freshDeals: 'عروض طازجة',
    justAdded: 'أضيفت للتو إلى مجموعتنا',
    noRetailers: 'لا توجد متاجر بعد.',
    noOffers: 'لا توجد عروض بعد.',
    noCountries: 'لا توجد دول بعد.',
    backendError: 'تعذّر الاتصال بالخادم.',
    searchPlaceholder: 'ابحث عن الإلكترونيات، البقالة، الأزياء...',
    offer: 'عرض',
    offers: 'عروض',
    noActiveOffers: 'لا توجد عروض نشطة',
    until: 'حتى',
    coveringCities: 'يغطي المتاجر في مدن ومناطق متعددة',
    expiresToday: 'تنتهي اليوم!',
    daysLeft: 'أيام متبقية',
    newThisWeek: 'جديد هذا الأسبوع',
    filters: 'الفلاتر',
    clearAll: 'مسح الكل',
    category: 'الفئة',
    allCategories: 'جميع الفئات',
    city: 'المدينة',
    allCities: 'جميع المدن',
    retailer: 'المتجر',
    allRetailers: 'جميع المتاجر',
    expiry: 'تاريخ الانتهاء',
    anyTime: 'أي وقت',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    activeFilters: 'الفلاتر النشطة',
    foundCount: 'تم العثور على',
    and: 'و',
    noResults: 'لم يتم العثور على نتائج',
    tryAdjusting: 'حاول تعديل البحث أو الفلاتر',
    backHome: 'العودة للرئيسية',
    backTo: 'العودة إلى',
    share: 'مشاركة',
    hotDeal: 'عرض ساخن',
    sponsored: 'برعاية',
    valid: 'صالح',
    couponCode: 'كود الكوبون',
    copied: 'تم النسخ!',
    copy: 'نسخ',
    tapToCopy: 'اضغط للنسخ',
    wasHelpful: 'هل كان هذا مفيداً؟',
    goToDeal: 'اذهب للعرض',
    at: 'في',
    viewCatalog: 'عرض الكتالوج',
    shopNow: 'تسوق الآن',
    visit: 'زيارة',
    shareThis: 'شارك هذا العرض',
    revealCode: 'كشف الكود',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    message: 'الرسالة',
    submit: 'إرسال',
    feedbackTitle: 'ملاحظاتك تهمنا',
    feedbackSub: 'ساعدنا في تحسين DealNamaa. شاركنا أفكارك أو أبلغ عن مشكلة.',
    blogTitle: 'المدونة والنصائح',
    readMore: 'اقرأ المزيد',
    relatedOffers: 'عروض ذات صلة',
    expired: 'منتهي',
    follow: 'متابعة',
    following: 'متابَع',
    save: 'حفظ',
    saved: 'تم الحفظ',
    you: 'أنت',
    rateThis: 'قيم هذا',
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
    browseByLocation: 'Browse deals by location',
    startHere: 'Start Here',
    topRetailers: 'Top Retailers',
    popularStores: 'Popular Stores',
    shopBrands: 'Shop from your favorite brands',
    viewAll: 'View All',
    expiringWeek: 'Expiring This Week',
    dontMiss: "Don't miss out!",
    latestOffers: 'Latest Coupons & Offers',
    freshDeals: 'Fresh Deals',
    justAdded: 'Just added to our collection',
    noRetailers: 'No retailers available yet.',
    noOffers: 'No offers available yet.',
    noCountries: 'No countries yet. Add some via the Admin Panel.',
    backendError: 'Could not connect to the backend.',
    searchPlaceholder: 'Search for electronics, groceries, fashion...',
    offer: 'offer',
    offers: 'offers',
    noActiveOffers: 'No active offers',
    until: 'Until',
    coveringCities: 'Covering retailers across multiple cities & regions',
    expiresToday: 'Expires today!',
    daysLeft: 'days left',
    newThisWeek: 'New this week',
    filters: 'Filters',
    clearAll: 'Clear All',
    category: 'Category',
    allCategories: 'All Categories',
    city: 'City',
    allCities: 'All Cities',
    retailer: 'Retailer',
    allRetailers: 'All Retailers',
    expiry: 'Expiry',
    anyTime: 'Any time',
    today: 'Today',
    thisWeek: 'This week',
    thisMonth: 'This month',
    activeFilters: 'Active Filters',
    foundCount: 'Found',
    and: 'and',
    noResults: 'No results found',
    tryAdjusting: 'Try adjusting your search or filters',
    backHome: 'Back to Home',
    backTo: 'Back to',
    share: 'Share',
    hotDeal: 'HOT DEAL',
    sponsored: 'Sponsored',
    valid: 'Valid',
    couponCode: 'Coupon Code',
    copied: 'Copied!',
    copy: 'Copy',
    tapToCopy: 'Tap to Copy',
    wasHelpful: 'Was this helpful?',
    goToDeal: 'Go to Deal',
    at: 'at',
    viewCatalog: 'View Catalog',
    shopNow: 'Shop Now',
    visit: 'Visit',
    shareThis: 'Share this deal',
    revealCode: 'Reveal Code',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    submit: 'Submit',
    feedbackTitle: 'Your Feedback Matters',
    feedbackSub: 'Help us improve DealNamaa. Share your thoughts or report an issue.',
    blogTitle: 'Blog & Tips',
    readMore: 'Read More',
    relatedOffers: 'Related Offers',
    expired: 'Expired',
    follow: 'Follow',
    following: 'Following',
    save: 'Save',
    saved: 'Saved',
    you: 'You',
    rateThis: 'Rate this',
  },
  ur: {
    home: 'ہوم',
    retailers: 'ریٹیلرز',
    coupons: 'کوپن',
    search: 'تلاش',
    findDeals: 'ڈیلز تلاش کریں',
    heroTitle: 'اپنے قریب بہترین\nڈیلز تلاش کریں',
    heroSub: 'ٹاپ ریٹیلرز سے ہزاروں فلائرز، کوپن اور خصوصی پیشکشیں براؤز کریں — سب ایک جگہ پر۔',
    newDeals: '🔥 ہر ہفتے نئی ڈیلز',
    selectCountry: 'ملک منتخب کریں',
    browseByLocation: 'مقام کے لحاظ سے ڈیلز براؤز کریں',
    startHere: 'یہاں سے شروع کریں',
    topRetailers: 'ٹاپ ریٹیلرز',
    popularStores: 'مشہور اسٹورز',
    shopBrands: 'اپنے پسندیدہ برانڈز سے خریداری کریں',
    viewAll: 'سب دیکھیں',
    expiringWeek: 'اس ہفتے ختم ہو رہا ہے',
    dontMiss: 'موقع ہاتھ سے نہ جانے دیں!',
    latestOffers: 'تازہ ترین کوپن اور پیشکشیں',
    freshDeals: 'تازہ ڈیلز',
    justAdded: 'ابھی ہمارے مجموعہ میں شامل کیا گیا ہے',
    noRetailers: 'ابھی تک کوئی ریٹیلر دستیاب نہیں ہے۔',
    noOffers: 'ابھی تک کوئی پیشکش دستیاب نہیں ہے۔',
    noCountries: 'ابھی تک کوئی ملک نہیں ہے۔',
    backendError: 'سرور سے رابطہ نہیں ہو سکا۔',
    searchPlaceholder: 'الیکٹرانکس، گروسری، فیشن تلاش کریں...',
    offer: 'آفر',
    offers: 'آفرز',
    noActiveOffers: 'کوئی فعال پیشکش نہیں ہے',
    until: 'تک',
    coveringCities: 'متعدد شہروں اور علاقوں میں ریٹیلرز کا احاطہ کرنا',
    expiresToday: 'آج ختم ہو رہا ہے!',
    daysLeft: 'دن باقی',
    newThisWeek: 'اس ہفتے نیا',
    filters: 'فلٹرز',
    clearAll: 'سب صاف کریں',
    category: 'زمرہ',
    allCategories: 'تمام زمرے',
    city: 'شہر',
    allCities: 'تمام شہر',
    retailer: 'ریٹیلر',
    allRetailers: 'تمام ریٹیلرز',
    expiry: 'میعاد ختم',
    anyTime: 'کسی بھی وقت',
    today: 'آج',
    thisWeek: 'اس ہفتے',
    thisMonth: 'اس مہینے',
    activeFilters: 'فعال فلٹرز',
    foundCount: 'مل گیا',
    and: 'اور',
    noResults: 'کوئی نتیجہ نہیں ملا',
    tryAdjusting: 'اپنی تلاش یا فلٹرز کو ایڈجسٹ کرنے کی کوشش کریں',
    backHome: 'ہوم پر واپس جائیں',
    backTo: 'واپس',
    share: 'شیئر کریں',
    hotDeal: 'ہاٹ ڈیل',
    sponsored: 'سپانسر شدہ',
    valid: 'صحیح',
    couponCode: 'کوپن کوڈ',
    copied: 'کاپی ہو گیا!',
    copy: 'کاپی',
    tapToCopy: 'کاپی کرنے کے لیے تھپتھپائیں',
    wasHelpful: 'کیا یہ مددگار تھا؟',
    goToDeal: 'ڈیل پر جائیں',
    at: 'پر',
    viewCatalog: 'کیٹلاگ دیکھیں',
    shopNow: 'ابھی خریداری کریں',
    visit: 'وزٹ کریں',
    shareThis: 'اس ڈیل کو شیئر کریں',
    revealCode: 'کوڈ دکھائیں',
    name: 'نام',
    email: 'ای میل',
    message: 'پیغام',
    submit: 'جمع کرائیں',
    feedbackTitle: 'آپ کی رائے اہم ہے',
    feedbackSub: 'ہمیں DealNamaa کو بہتر بنانے میں مدد کریں۔ اپنے خیالات شیئر کریں یا کسی مسئلے کی اطلاع دیں۔',
    blogTitle: 'بلاگ اور ٹپس',
    readMore: 'مزید پڑھیں',
    relatedOffers: 'متعلقہ پیشکشیں',
    expired: 'ختم ہو چکا ہے',
    follow: 'فالو کریں',
    following: 'فالو کر رہے ہیں',
    save: 'محفوظ کریں',
    saved: 'محفوظ کر لیا گیا',
    you: 'آپ',
    rateThis: 'اس کی درجہ بندی کریں',
  },
  hi: {
    home: 'होम',
    retailers: 'रिटेलर्स',
    coupons: 'कूपन',
    search: 'खोजें',
    findDeals: 'डील्स खोजें',
    heroTitle: 'अपने आस-पास सबसे\nअच्छी डील्स खोजें',
    heroSub: 'शीर्ष खुदरा विक्रेताओं से हजारों फ़्लायर्स, कूपन और विशेष ऑफ़र ब्राउज़ करें — सब एक ही स्थान पर।',
    newDeals: '🔥 हर हफ्ते नए सौदे',
    selectCountry: 'देश चुनें',
    browseByLocation: 'स्थान के आधार पर सौदे ब्राउज़ करें',
    startHere: 'यहाँ से शुरू करें',
    topRetailers: 'शीर्ष खुदरा विक्रेता',
    popularStores: 'लोकप्रिय स्टोर',
    shopBrands: 'अपने पसंदीदा ब्रांड से खरीदारी करें',
    viewAll: 'सभी देखें',
    expiringWeek: 'इस सप्ताह समाप्त हो रहा है',
    dontMiss: 'चूकें नहीं!',
    latestOffers: 'नवीनतम कूपन और ऑफ़र',
    freshDeals: 'ताज़ा डील्स',
    justAdded: 'अभी हमारे संग्रह में जोड़ा गया',
    noRetailers: 'अभी तक कोई रिटेलर उपलब्ध नहीं है।',
    noOffers: 'अभी तक कोई ऑफ़र उपलब्ध नहीं है।',
    noCountries: 'अभी तक कोई देश नहीं है।',
    backendError: 'बैकएंड से कनेक्ट नहीं हो सका।',
    searchPlaceholder: 'इलेक्ट्रॉनिक्स, किराना, फैशन खोजें...',
    offer: 'ऑफर',
    offers: 'ऑफर',
    noActiveOffers: 'कोई सक्रिय ऑफ़र नहीं',
    until: 'तक',
    coveringCities: 'कई शहरों और क्षेत्रों में खुदरा विक्रेताओं को कवर करना',
    expiresToday: 'आज समाप्त हो रहा है!',
    daysLeft: 'दिन बचे हैं',
    newThisWeek: 'इस सप्ताह नया',
    filters: 'फ़िल्टर',
    clearAll: 'सभी साफ करें',
    category: 'श्रेणी',
    allCategories: 'सभी श्रेणियां',
    city: 'शहर',
    allCities: 'सभी शहर',
    retailer: 'रिटेलर',
    allRetailers: 'सभी रिटेलर्स',
    expiry: 'समाप्ति',
    anyTime: 'किसी भी समय',
    today: 'आज',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    activeFilters: 'सक्रिय फ़िल्टर',
    foundCount: 'मिला',
    and: 'और',
    noResults: 'कोई परिणाम नहीं मिला',
    tryAdjusting: 'अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें',
    backHome: 'होम पर वापस जाएं',
    backTo: 'पीछे',
    share: 'शेयर',
    hotDeal: 'हॉट डील',
    sponsored: 'प्रायोजित',
    valid: 'वैध',
    couponCode: 'कूपन कोड',
    copied: 'कॉपी किया गया!',
    copy: 'कॉपी',
    tapToCopy: 'कॉपी करने के लिए टैप करें',
    wasHelpful: 'क्या यह मददगार था?',
    goToDeal: 'डील पर जाएं',
    at: 'पर',
    viewCatalog: 'कैटलॉग देखें',
    shopNow: 'अभी खरीदारी करें',
    visit: 'विजिट करें',
    shareThis: 'इस डील को शेयर करें',
    revealCode: 'कोड दिखाएं',
    name: 'नाम',
    email: 'ईमेल',
    message: 'संदेश',
    submit: 'जमा करें',
    feedbackTitle: 'आपकी प्रतिक्रिया मायने रखती है',
    feedbackSub: 'हमें DealNamaa को बेहतर बनाने में मदद करें। अपने विचार साझा करें या किसी समस्या की रिपोर्ट करें।',
    blogTitle: 'ब्लॉग और टिप्स',
    readMore: 'और पढ़ें',
    relatedOffers: 'संबंधित ऑफ़र',
    expired: 'सत्र समाप्त',
    follow: 'फॉलो करें',
    following: 'फॉलो कर रहे हैं',
    save: 'सेव करें',
    saved: 'सेव किया गया',
    you: 'आप',
    rateThis: 'इसे रेट करें',
  },
} as const;

type Lang = 'en' | 'ar' | 'ur' | 'hi';
type T = typeof translations.en;

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
  const isRTL = lang === 'ar' || lang === 'ur';
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
}

export default function LangToggle() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const languages: { id: Lang; name: string; flag: string }[] = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'ar', name: 'العربية', flag: '🇦🇪' },
    { id: 'ur', name: 'اردو', flag: '🇵🇰' },
    { id: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-600 transition bg-white text-gray-700 shadow-sm"
      >
        <i className="fa-solid fa-language text-base"></i>
        <span>{languages.find(l => l.id === lang)?.name}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLang(l.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
                  lang === l.id ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
                {lang === l.id && <i className="fa-solid fa-check ml-auto text-[10px]"></i>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
