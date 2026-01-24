import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.yachts": "Yachts",
    "nav.activities": "Activities",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.profile": "Profile",
    "nav.bookings": "My Bookings",
    "nav.logout": "Logout",
    
    // Hero
    "hero.title": "Book Yachts & Water Adventures",
    "hero.subtitle": "Across Egypt",
    "hero.description": "Experience the Mediterranean luxury on Egypt's most beautiful coastlines. From private yachts to thrilling water activities.",
    "hero.cta.yacht": "Book a Yacht",
    "hero.cta.activities": "Explore Activities",
    
    // Locations
    "locations.title": "Explore Our Destinations",
    "locations.subtitle": "Choose from Egypt's finest coastal locations",
    
    // How it works
    "how.title": "How It Works",
    "how.step1.title": "Browse & Select",
    "how.step1.desc": "Explore our curated selection of yachts and water activities",
    "how.step2.title": "Book Instantly",
    "how.step2.desc": "Choose your date, time, and payment method",
    "how.step3.title": "Enjoy the Sea",
    "how.step3.desc": "Receive your QR confirmation and set sail",
    
    // Listings
    "listings.title": "Available Yachts & Activities",
    "listings.filter.location": "Location",
    "listings.filter.type": "Type",
    "listings.filter.capacity": "Capacity",
    "listings.filter.price": "Max Price",
    "listings.filter.all": "All",
    "listings.perPerson": "per person",
    "listings.perHour": "per hour",
    "listings.capacity": "guests",
    "listings.viewDetails": "View Details",
    "listings.noResults": "No yachts found matching your filters",
    
    // Details
    "details.included": "What's Included",
    "details.amenities": "Amenities",
    "details.reviews": "reviews",
    "details.reserve": "Reserve Now",
    "details.availability": "Select Date & Time",
    
    // Booking
    "booking.title": "Complete Your Booking",
    "booking.date": "Select Date",
    "booking.time": "Select Time",
    "booking.guests": "Number of Guests",
    "booking.payment": "Payment Method",
    "booking.online": "Pay Online",
    "booking.cash": "Pay Cash on Arrival",
    "booking.summary": "Booking Summary",
    "booking.subtotal": "Subtotal",
    "booking.fee": "Platform Fee",
    "booking.total": "Total",
    "booking.confirm": "Confirm Booking",
    "booking.success": "Booking Confirmed!",
    "booking.reference": "Your booking reference",
    
    // Profile
    "profile.title": "My Profile",
    "profile.bookings": "My Bookings",
    "profile.noBookings": "No bookings yet",
    "profile.upcoming": "Upcoming",
    "profile.past": "Past",
    "profile.cancel": "Cancel Booking",
    
    // Auth
    "auth.login": "Welcome Back",
    "auth.signup": "Create Account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.name": "Full Name",
    "auth.phone": "Phone Number",
    "auth.submit.login": "Sign In",
    "auth.submit.signup": "Create Account",
    "auth.switchTo.signup": "Don't have an account?",
    "auth.switchTo.login": "Already have an account?",
    
    // Footer
    "footer.tagline": "Your gateway to luxury water experiences in Egypt",
    "footer.links": "Quick Links",
    "footer.contact": "Contact Us",
    "footer.follow": "Follow Us",
    "footer.rights": "All rights reserved.",
    
    // Trust badges
    "trust.verified": "Verified Yachts",
    "trust.secure": "Secure Booking",
    "trust.support": "24/7 Support",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.back": "Back",
    "common.next": "Next",
    "common.save": "Save",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.yachts": "اليخوت",
    "nav.activities": "الأنشطة",
    "nav.login": "تسجيل الدخول",
    "nav.signup": "إنشاء حساب",
    "nav.profile": "الملف الشخصي",
    "nav.bookings": "حجوزاتي",
    "nav.logout": "تسجيل الخروج",
    
    // Hero
    "hero.title": "احجز يخوت ومغامرات مائية",
    "hero.subtitle": "في جميع أنحاء مصر",
    "hero.description": "عش تجربة الفخامة المتوسطية على أجمل سواحل مصر. من اليخوت الخاصة إلى الأنشطة المائية المثيرة.",
    "hero.cta.yacht": "احجز يخت",
    "hero.cta.activities": "استكشف الأنشطة",
    
    // Locations
    "locations.title": "استكشف وجهاتنا",
    "locations.subtitle": "اختر من أفضل المواقع الساحلية في مصر",
    
    // How it works
    "how.title": "كيف يعمل",
    "how.step1.title": "تصفح واختر",
    "how.step1.desc": "استكشف مجموعتنا المختارة من اليخوت والأنشطة المائية",
    "how.step2.title": "احجز فوراً",
    "how.step2.desc": "اختر التاريخ والوقت وطريقة الدفع",
    "how.step3.title": "استمتع بالبحر",
    "how.step3.desc": "احصل على تأكيد QR وابدأ رحلتك",
    
    // Listings
    "listings.title": "اليخوت والأنشطة المتاحة",
    "listings.filter.location": "الموقع",
    "listings.filter.type": "النوع",
    "listings.filter.capacity": "السعة",
    "listings.filter.price": "الحد الأقصى للسعر",
    "listings.filter.all": "الكل",
    "listings.perPerson": "للشخص",
    "listings.perHour": "للساعة",
    "listings.capacity": "ضيوف",
    "listings.viewDetails": "عرض التفاصيل",
    "listings.noResults": "لا توجد يخوت مطابقة لفلاترك",
    
    // Details
    "details.included": "ما هو مشمول",
    "details.amenities": "المرافق",
    "details.reviews": "تقييم",
    "details.reserve": "احجز الآن",
    "details.availability": "اختر التاريخ والوقت",
    
    // Booking
    "booking.title": "أكمل حجزك",
    "booking.date": "اختر التاريخ",
    "booking.time": "اختر الوقت",
    "booking.guests": "عدد الضيوف",
    "booking.payment": "طريقة الدفع",
    "booking.online": "الدفع أونلاين",
    "booking.cash": "الدفع نقداً عند الوصول",
    "booking.summary": "ملخص الحجز",
    "booking.subtotal": "المجموع الفرعي",
    "booking.fee": "رسوم المنصة",
    "booking.total": "الإجمالي",
    "booking.confirm": "تأكيد الحجز",
    "booking.success": "تم تأكيد الحجز!",
    "booking.reference": "رقم مرجع حجزك",
    
    // Profile
    "profile.title": "ملفي الشخصي",
    "profile.bookings": "حجوزاتي",
    "profile.noBookings": "لا توجد حجوزات بعد",
    "profile.upcoming": "القادمة",
    "profile.past": "السابقة",
    "profile.cancel": "إلغاء الحجز",
    
    // Auth
    "auth.login": "مرحباً بعودتك",
    "auth.signup": "إنشاء حساب",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.name": "الاسم الكامل",
    "auth.phone": "رقم الهاتف",
    "auth.submit.login": "تسجيل الدخول",
    "auth.submit.signup": "إنشاء الحساب",
    "auth.switchTo.signup": "ليس لديك حساب؟",
    "auth.switchTo.login": "لديك حساب بالفعل؟",
    
    // Footer
    "footer.tagline": "بوابتك لتجارب مائية فاخرة في مصر",
    "footer.links": "روابط سريعة",
    "footer.contact": "اتصل بنا",
    "footer.follow": "تابعنا",
    "footer.rights": "جميع الحقوق محفوظة.",
    
    // Trust badges
    "trust.verified": "يخوت موثقة",
    "trust.secure": "حجز آمن",
    "trust.support": "دعم 24/7",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ ما",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.save": "حفظ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("seascape-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("seascape-language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
