import { HelpCircle, MessageCircle, FileText, Zap, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HelpCenterPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 text-white mb-6 shadow-xl shadow-primary/20">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4">مرکز راهنمای کارنکس</h1>
        <p className="text-muted-foreground text-lg">چطور می‌توانیم به رشد کسب‌وکار شما کمک کنیم؟</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" hover="lift" className="text-center cursor-pointer group">
          <CardIcon variant="primary" className="mx-auto mb-4 w-14 h-14 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </CardIcon>
          <h3 className="font-bold text-foreground mb-2">شروع سریع</h3>
          <p className="text-muted-foreground text-sm">آموزش کار با ابزارهای هوشمند داشبورد</p>
        </Card>
        
        <Card variant="glass" hover="lift" className="text-center cursor-pointer group">
          <CardIcon variant="accent" className="mx-auto mb-4 w-14 h-14 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </CardIcon>
          <h3 className="font-bold text-foreground mb-2">مستندات</h3>
          <p className="text-muted-foreground text-sm">راهنمای خوانی بوم کسب‌وکار و نقشه راه</p>
        </Card>

        <Card variant="glass" hover="lift" className="text-center cursor-pointer group">
          <CardIcon variant="secondary" className="mx-auto mb-4 w-14 h-14 group-hover:scale-110 transition-transform">
            <MessageCircle size={24} />
          </CardIcon>
          <h3 className="font-bold text-foreground mb-2">پشتیبانی</h3>
          <p className="text-muted-foreground text-sm">تماس با تیم فنی کارنکس</p>
        </Card>
      </div>

      {/* FAQ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-foreground">سوالات متداول</h2>
          <Badge variant="info" size="sm">
            <Sparkles size={10} />
            3 سوال
          </Badge>
        </div>
        
        {[
          { 
            q: "آیا طرح‌های تولید شده واقعا قابل اجرا هستند؟", 
            a: "بله، هوش مصنوعی ما بر اساس واقعیت‌های بازار ایران و ابزارهای موجود (مثل درگاه‌های پرداخت ایرانی و پلتفرم‌های داخلی) برنامه را تدوین می‌کند." 
          },
          { 
            q: "آیا ایده من امن است؟", 
            a: "بله، تمام داده‌های شما رمزنگاری شده و در فضای ابری امن ذخیره می‌شوند. هیچ‌کس جز شما به آن‌ها دسترسی ندارد." 
          },
          { 
            q: "چطور می‌توانم خروجی PDF بگیرم؟", 
            a: "در بخش 'بوم کسب‌وکار'، دکمه سیاه رنگ 'دانلود PDF' را فشار دهید." 
          }
        ].map((item, i) => (
          <Card key={i} variant="default" hover="glow" className="cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                <HelpCircle size={16} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2 flex items-center justify-between">
                  {item.q}
                  <ChevronDown size={16} className="text-muted-foreground" />
                </h3>
                <p className="text-muted-foreground text-sm leading-7">{item.a}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

    </div>
  );
}
