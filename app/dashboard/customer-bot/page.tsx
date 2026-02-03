"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, MessageSquare, Smartphone, Send, MessagesSquare, CheckCircle2,
  Settings, Power, Zap, Share2, HelpCircle, User,
  Smile, Clock, FileText, ToggleRight, Plus
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

export default function CustomerBotPage() {
  const { activeProject: plan } = useProject();
  const [botActive, setBotActive] = useState(true);
  const [platform, setPlatform] = useState<"whatsapp" | "telegram" | "ig">("whatsapp");

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Bot size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">دستیار مشتری برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">دستیار هوشمند مشتری</h1>
              <p className="text-muted-foreground">بات پاسخگوی خودکار برای واتساپ، تلگرام و اینستاگرام</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-xl">
          <span className="text-sm font-medium">وضعیت ربات:</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${botActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
            <span className={`text-sm ${botActive ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}`}>
              {botActive ? 'فعال و آنلاین' : 'غیرفعال'}
            </span>
          </div>
          <Switch checked={botActive} onCheckedChange={setBotActive} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Platforms & Stats */}
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-bold mb-4">پلتفرم‌های متصل</h3>
            <div className="space-y-2">
              <div 
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${platform === 'whatsapp' ? 'bg-green-500/10 border-green-500/50' : 'hover:bg-muted'}`}
                onClick={() => setPlatform('whatsapp')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">واتساپ بیزینس</h4>
                    <p className="text-[10px] text-muted-foreground">متصل: ۰۹۱۲۳۴۵۶۷۸۹</p>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>

              <div 
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${platform === 'telegram' ? 'bg-blue-500/10 border-blue-500/50' : 'hover:bg-muted'}`}
                onClick={() => setPlatform('telegram')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Send size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">تلگرام بات</h4>
                    <p className="text-[10px] text-muted-foreground">متصل: @my_shop_bot</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
              </div>

              <div 
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${platform === 'ig' ? 'bg-pink-500/10 border-pink-500/50' : 'hover:bg-muted'}`}
                onClick={() => setPlatform('ig')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">دایرکت اینستاگرام</h4>
                    <p className="text-[10px] text-muted-foreground">غیرفعال</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs h-9">
              <Plus size={14} className="mr-1" />
              اتصال شماره جدید
            </Button>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold mb-4">آمار عملکرد (۲۴ ساعت)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-xl text-center">
                <MessagesSquare className="mx-auto mb-2 text-primary" size={20} />
                <p className="text-2xl font-black">۱۵۴</p>
                <p className="text-xs text-muted-foreground">مکالمه خودکار</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl text-center">
                <Clock className="mx-auto mb-2 text-emerald-500" size={20} />
                <p className="text-2xl font-black text-emerald-600">۲ ثانیه</p>
                <p className="text-xs text-muted-foreground">میانگین پاسخ</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl text-center col-span-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <User size={16} className="text-amber-500" />
                  <span className="font-bold text-lg">۵ مورد</span>
                </div>
                <p className="text-xs text-muted-foreground">ارجاع به پشتیبان انسانی</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Center & Right: Chat Flow & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Training Section */}
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Bot className="text-primary" />
                منابع یادگیری ربات
              </h3>
              <Button size="sm" variant="ghost" className="text-primary">
                مدیریت منابع
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-background p-3 rounded-xl border border-border flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-sm">منوی محصولات (با قیمت)</span>
              </div>
              <div className="bg-background p-3 rounded-xl border border-border flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-sm">ساعات کاری و آدرس</span>
              </div>
              <div className="bg-background p-3 rounded-xl border border-border flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-sm">پاسخ به سوالات متداول (FAQ)</span>
              </div>
              <div className="bg-background p-3 rounded-xl border border-border flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">استراتژی‌های فروش (غیرفعال)</span>
              </div>
            </div>

            <div className="bg-background p-3 rounded-xl border border-border">
              <label className="text-sm font-medium mb-2 block">تست دستیار:</label>
              <div className="flex gap-2">
                <input 
                  className="input-premium flex-1 text-sm"
                  placeholder="مثال: هزینه ارسال به تهران چقدره؟"
                />
                <Button size="icon" className="bg-primary text-white shrink-0">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Configuration */}
          <Card className="p-6">
            <h3 className="font-bold mb-4">تنظیمات رفتار ربات</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                <div>
                  <h4 className="font-bold text-sm">ثبت سفارش خودکار</h4>
                  <p className="text-xs text-muted-foreground">ربات سفارش را گرفته و فاکتور صادر کند</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                <div>
                  <h4 className="font-bold text-sm">پاسخدهی در ساعات غیرکاری</h4>
                  <p className="text-xs text-muted-foreground">فقط در زمان بسته بودن مغازه فعال باشد</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                <div>
                  <h4 className="font-bold text-sm">لحن صحبت</h4>
                  <p className="text-xs text-muted-foreground">رسمی، دوستانه، یا محترمانه</p>
                </div>
                <select className="input-premium py-1 px-3 text-sm w-32">
                  <option>دوستانه 😊</option>
                  <option>رسمی 👔</option>
                  <option>محترمانه 🤝</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                <div>
                  <h4 className="font-bold text-sm">پیام خوش‌آمدگویی</h4>
                  <p className="text-xs text-muted-foreground">اولین پیامی که کاربر می‌بیند</p>
                </div>
                <Button variant="outline" size="sm">ویرایش</Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
