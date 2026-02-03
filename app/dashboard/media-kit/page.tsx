"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, Download, Share2, Eye, Instagram, 
  Youtube, Twitter, Mail, Globe, MapPin, 
  BarChart3, CheckCircle2, TrendingUp, Sparkles,
  LayoutTemplate, Palette
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function MediaKitPage() {
  const { activeProject: plan } = useProject();
  const [isEditing, setIsEditing] = useState(false);
  const [template, setTemplate] = useState("modern"); // modern, minimal, bold

  // Mock Profile Data
  const profile = {
    name: "آریو",
    handle: "@ariovibes",
    bio: "تولیدکننده محتوی تکنولوژی و برنامه‌نویسی | علاقه‌مند به هوش مصنوعی",
    avatar: "/avatars/default.png", // In real app, use real user avatar
    location: "تهران، ایران",
    email: "contact@ariovibe.com",
    website: "ariovibe.com",
    stats: {
      followers: 125000,
      engagement: 4.8,
      avgViews: 45000,
      monthlyReach: 1200000
    },
    audience: {
      male: 65,
      female: 35,
      topAge: "18-34",
      topLocations: ["تهران", "اصفهان", "مشهد"]
    },
    partners: ["Samsung", "Logitech", "Sony", "Digikala"]
  };

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <UserCheck size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیاکیت ساز برای تولیدکنندگان محتوا</h2>
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

  const handleExport = () => {
    toast.success("مدیاکیت شما بصورت PDF دانلود شد");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">مدیاکیت ساز حرفه‌ای</h1>
              <p className="text-muted-foreground">ساخت پورتفولیو و رزومه برای جذب اسپانسر</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditing(!isEditing)}>
            <Palette size={18} />
            شخصی‌سازی
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={18} />
            اشتراک‌گذاری
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-secondary" onClick={handleExport}>
            <Download size={18} />
            دانلود PDF
          </Button>
        </div>
      </div>

      {/* Editor / Preview Toggle Area */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <h3 className="font-bold mb-4">تنظیمات قالب</h3>
          <div className="flex gap-4">
            {["modern", "minimal", "bold"].map(t => (
              <div 
                key={t}
                onClick={() => setTemplate(t)}
                className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${template === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
              >
                {t === "modern" && "مدرن"}
                {t === "minimal" && "مینیمال"}
                {t === "bold" && "جسورانه"}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Media Kit Preview (The "Paper" View) */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-none shadow-2xl overflow-hidden min-h-[1000px] relative">
        {/* Header Banner */}
        <div className="h-48 bg-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90" />
          <div className="absolute -bottom-16 left-12 w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl z-10 flex items-center justify-center">
             <UserCheck size={64} className="text-slate-400" />
          </div>
          <div className="absolute top-12 left-12 right-12 text-white flex justify-between items-start">
            <div className="ml-36 pt-4">
              <h2 className="text-4xl font-black mb-1">{profile.name}</h2>
              <p className="text-white/80 text-lg font-medium tracking-wide">{profile.handle}</p>
            </div>
            <div className="text-right hidden md:block">
              <div className="flex flex-col gap-2 text-white/90 text-sm">
                <div className="flex items-center justify-end gap-2">
                  <span>{profile.website}</span>
                  <Globe size={16} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span>{profile.email}</span>
                  <Mail size={16} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span>{profile.location}</span>
                  <MapPin size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-20 px-12 pb-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Main Column */}
          <div className="md:col-span-2 space-y-10">
            {/* Bio */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <div className="w-8 h-1 bg-violet-600 rounded-full" />
                درباره من
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {profile.bio}
                <br className="mb-2"/>
                من با ساخت ویدیوهای باکیفیت و آموزشی، به مخاطبانم کمک می‌کنم تا با جدیدترین تکنولوژی‌های روز آشنا شوند و مهارت‌های برنامه‌نویسی خود را ارتقا دهند. تمرکز من بر ارائه محتوای صادقانه، کاربردی و جذاب است.
              </p>
            </section>

            {/* Audience Demographics */}
            <section>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <div className="w-8 h-1 bg-violet-600 rounded-full" />
                مخاطبان من
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-4">جنسیت</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>آقا</span>
                        <span className="font-bold">{profile.audience.male}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${profile.audience.male}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>خانم</span>
                        <span className="font-bold">{profile.audience.female}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${profile.audience.female}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-2">رده سنی</h4>
                  <div className="text-3xl font-black text-violet-600 mb-1">{profile.audience.topAge}</div>
                  <p className="text-sm text-slate-500">عمده مخاطبان جوان و فعال</p>
                  
                  <h4 className="font-bold text-slate-700 mt-4 mb-2">شهرها</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.audience.topLocations.map(city => (
                      <span key={city} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Previous Partners */}
            <section>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <div className="w-8 h-1 bg-violet-600 rounded-full" />
                همکاری‌های قبلی
              </h3>
              <div className="flex flex-wrap gap-4">
                {profile.partners.map(partner => (
                  <div key={partner} className="px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 grayscale opacity-70">
                    {partner}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Key Stats */}
            <section className="space-y-4">
               <div className="bg-violet-600 text-white p-6 rounded-3xl shadow-lg shadow-violet-200">
                 <div className="mb-1 opacity-80 text-sm">Followers</div>
                 <div className="text-4xl font-black">{profile.stats.followers.toLocaleString()}</div>
                 <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm">
                   <TrendingUp size={16} />
                   <span>+۱۲٪ رشد ماهانه</span>
                 </div>
               </div>

               <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg shadow-slate-200">
                 <div className="mb-1 opacity-80 text-sm">Engagement Rate</div>
                 <div className="text-4xl font-black text-emerald-400">{profile.stats.engagement}%</div>
                 <div className="mt-4 text-xs opacity-60">
                   میانگین تعامل نسبت به بازدید
                 </div>
               </div>

               <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl">
                 <div className="mb-1 text-slate-500 text-sm">Monthly Reach</div>
                 <div className="text-3xl font-black text-slate-800">{ (profile.stats.monthlyReach / 1000000).toFixed(1) }M+</div>
               </div>
            </section>

            {/* Socials */}
            <section>
              <h3 className="font-bold text-slate-800 mb-4">پلتفرم‌های فعال</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Instagram className="text-pink-600" />
                  <span className="font-bold text-slate-700 font-sans tracking-wide">@ariovibes</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Youtube className="text-red-600" />
                  <span className="font-bold text-slate-700 font-sans tracking-wide">Ario Vibe</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Twitter className="text-blue-400" />
                  <span className="font-bold text-slate-700 font-sans tracking-wide">@ario_temp</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 py-6 text-center text-slate-400 text-sm">
          Powered by Karnex Media Kit Generator
        </div>
      </div>
    </div>
  );
}
