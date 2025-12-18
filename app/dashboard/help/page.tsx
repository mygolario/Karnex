import { HelpCircle, MessageCircle, FileText, Zap } from "lucide-react";

export default function HelpCenterPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <div className="text-center py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-4">مرکز راهنمای کارنکس</h1>
        <p className="text-slate-500 text-lg">چطور می‌توانیم به رشد کسب‌وکار شما کمک کنیم؟</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">شروع سریع</h3>
          <p className="text-slate-500 text-sm">آموزش کار با ابزارهای هوشمند داشبورد</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-purple-300 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
             <FileText size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">مستندات</h3>
          <p className="text-slate-500 text-sm">راهنمای خوانی بوم کسب‌وکار و نقشه راه</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-emerald-300 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
             <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">پشتیبانی</h3>
          <p className="text-slate-500 text-sm">تماس با تیم فنی کارنکس</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">سوالات متداول</h2>
        
        {[
          { q: "آیا طرح‌های تولید شده واقعا قابل اجرا هستند؟", a: "بله، هوش مصنوعی ما بر اساس واقعیت‌های بازار ایران و ابزارهای موجود (مثل درگاه‌های پرداخت ایرانی و پلتفرم‌های داخلی) برنامه را تدوین می‌کند." },
          { q: "آیا ایده من امن است؟", a: "بله، تمام داده‌های شما رمزنگاری شده و در فضای ابری امن ذخیره می‌شوند. هیچ‌کس جز شما به آن‌ها دسترسی ندارد." },
          { q: "چطور می‌توانم خروجی PDF بگیرم؟", a: "در بخش 'بوم کسب‌وکار'، دکمه سیاه رنگ 'دانلود PDF' را فشار دهید." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-500" />
              {item.q}
            </h3>
            <p className="text-slate-600 text-sm leading-7 pr-7">{item.a}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
