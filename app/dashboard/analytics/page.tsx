"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart2, TrendingUp, Users, Youtube, Instagram, 
  ArrowUpRight, ArrowDownRight, Activity, Clock,
  Eye, ThumbsUp, MessageCircle, Share2, Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const { activeProject: plan } = useProject();

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <BarChart2 size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تحلیل کانال برای تولیدکنندگان محتوا</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های Creator فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Mock Data
  const stats = {
    overview: [
      { label: "کل بازدیدها", value: "۱.۲M", change: "+۱۵٪", trend: "up", icon: Eye, color: "text-blue-500" },
      { label: "دنبال‌کنندگان", value: "۴۵K", change: "+۵٪", trend: "up", icon: Users, color: "text-emerald-500" },
      { label: "نرخ تعامل", value: "۸.۵٪", change: "-۲٪", trend: "down", icon: Activity, color: "text-amber-500" },
      { label: "درآمد تخمینی", value: "۵۲M", unit: "تومان", change: "+۲۰٪", trend: "up", icon: TrendingUp, color: "text-purple-500" },
    ],
    topContent: [
      { title: "بررسی آیفون ۱۵ پرو مکس", platform: "youtube", views: "150K", engagement: "12%", score: 95 },
      { title: "ولاگ سفر به شمال", platform: "youtube", views: "85K", engagement: "8%", score: 88 },
      { title: "۵ ترفند مخفی اینستاگرام", platform: "instagram", views: "500K", engagement: "15%", score: 92 },
    ]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تحلیلگر هوشمند کانال</h1>
              <p className="text-muted-foreground">آنالیز عمیق عملکرد و پیشنهادات بهبود با AI</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="bg-card border border-border rounded-xl p-1 flex">
             <Button variant="ghost" size="sm" className="bg-muted text-foreground">۷ روز</Button>
             <Button variant="ghost" size="sm">۲۸ روز</Button>
             <Button variant="ghost" size="sm">۹۰ روز</Button>
           </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.overview.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4 bg-card hover:bg-muted/10 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <Badge variant="outline" className={`gap-1 ${stat.trend === 'up' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-end gap-1">
                  {stat.value}
                  {stat.unit && <span className="text-xs font-normal text-muted-foreground mb-1">{stat.unit}</span>}
                </h3>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-6">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold flex items-center gap-2">
                 <Activity className="text-primary" size={20} />
                 روند رشد بازدیدها
               </h3>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /> یوتیوب</span>
                 <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-pink-500" /> اینستاگرام</span>
               </div>
             </div>
             
             {/* Simple Chart Placeholder */}
             <div className="h-[300px] w-full bg-muted/10 rounded-xl relative flex items-end justify-between px-2 pb-2 gap-1 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => {
                  const h1 = Math.random() * 80 + 10;
                  const h2 = Math.random() * 60 + 5;
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full">
                       <div className="w-full bg-pink-500/80 rounded-sm hover:opacity-80 transition-opacity" style={{ height: `${h2}%` }} />
                       <div className="w-full bg-primary/80 rounded-sm hover:opacity-80 transition-opacity" style={{ height: `${h1}%` }} />
                    </div>
                  );
                })}
             </div>
           </Card>

           <Card className="p-6">
             <h3 className="font-bold mb-4">ویدیوهای برتر این ماه</h3>
             <div className="space-y-4">
               {stats.topContent.map((content, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="font-bold text-lg text-muted-foreground w-6 text-center">#{i + 1}</div>
                     <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        {content.platform === 'youtube' ? <Youtube size={24} className="text-red-500" /> : <Instagram size={24} className="text-pink-500" />}
                     </div>
                     <div>
                       <h4 className="font-bold text-sm line-clamp-1">{content.title}</h4>
                       <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Eye size={12} /> {content.views}</span>
                          <span className="flex items-center gap-1"><ThumbsUp size={12} /> {content.engagement}</span>
                       </div>
                     </div>
                   </div>
                   <div className="text-right">
                      <div className="text-xl font-bold text-emerald-500">{content.score}</div>
                      <div className="text-[10px] text-muted-foreground">امتیاز کیفیت</div>
                   </div>
                 </div>
               ))}
             </div>
           </Card>
        </div>

        {/* AI Insights & Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="text-primary fill-primary" size={20} />
              تحلیل هوشمند
            </h3>
            <div className="space-y-4">
               <div className="bg-background/80 backdrop-blur rounded-xl p-3 border border-border shadow-sm">
                 <h4 className="font-bold text-sm mb-1 text-emerald-600">نقطه قوت شما</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   ویدیوهای آموزشی کوتاه (زیر ۵ دقیقه) شما ۳ برابر بیشتر از ولاگ‌ها تعامل می‌گیرند. تمرکزتان را روی این فرمت بگذارید.
                 </p>
               </div>
               <div className="bg-background/80 backdrop-blur rounded-xl p-3 border border-border shadow-sm">
                 <h4 className="font-bold text-sm mb-1 text-amber-600">هشدار الگوریتم</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   ثبات انتشار شما در یوتیوب کم شده است. الگوریتم کانال‌هایی را که نظم هفتگی ندارند کمتر پیشنهاد می‌دهد.
                 </p>
               </div>
               <div className="bg-background/80 backdrop-blur rounded-xl p-3 border border-border shadow-sm">
                 <h4 className="font-bold text-sm mb-1 text-blue-600">بهترین زمان انتشار</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   مخاطبان شما بیشتر در ساعت ۱۸:۳۰ تا ۲۰:۰۰ فعال هستند.
                 </p>
               </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-500" />
              دموگرافیک مخاطب
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>آقایان</span>
                  <span>۷۰٪</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[70%]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>خانم‌ها</span>
                  <span>۳۰٪</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 w-[30%]" />
                </div>
              </div>

              <div className="pt-4 border-t border-border grid grid-cols-2 gap-2 text-center">
                 <div className="bg-muted/30 p-2 rounded-lg">
                   <div className="text-xs text-muted-foreground">سن غالب</div>
                   <div className="font-bold">۱۸-۲۴</div>
                 </div>
                 <div className="bg-muted/30 p-2 rounded-lg">
                   <div className="text-xs text-muted-foreground">شهر برتر</div>
                   <div className="font-bold">تهران</div>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
