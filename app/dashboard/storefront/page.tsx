"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Store, Sparkles, Palette, Monitor, Smartphone, 
  ShoppingBag, ArrowRight, CheckCircle2, Loader2, 
  RefreshCw, Image as ImageIcon, Star, Mail, MapPin, 
  Instagram, Twitter, Linkedin
} from "lucide-react";
import { StoreConfig, StoreContent, StoreVibe } from "@/lib/db";

// --- Constants ---

const VIBES: { id: StoreVibe; label: string; desc: string; colors: string[] }[] = [
  { id: 'minimal', label: 'مینیمال', desc: 'ساده، تمیز و تمرکز بر محصول', colors: ['#000000', '#ffffff', '#f5f5f5'] },
  { id: 'luxury', label: 'لوکس', desc: 'الگانس، طلایی و مشکی، با وقار', colors: ['#D4AF37', '#1a1a1a', '#000000'] },
  { id: 'bold', label: 'جسورانه', desc: 'رنگ‌های جیغ، تایپوگرافی بزرگ', colors: ['#FF3B30', '#111111', '#ffffff'] },
  { id: 'playful', label: 'سرگرم‌کننده', desc: 'رنگارنگ، دوستانه و صمیمی', colors: ['#FF9500', '#5AC8FA', '#ffffff'] },
];

export default function StoreBuilderPage() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const [step, setStep] = useState<'onboarding' | 'building' | 'preview'>('onboarding');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const [config, setConfig] = useState<StoreConfig>({
    niche: '',
    vibe: 'minimal',
    colors: { primary: '#000000', secondary: '#ffffff', bg: '#ffffff' },
    font: 'Vazirmatn'
  });

  const [content, setContent] = useState<StoreContent | null>(null);

  // --- Load Persisted Data ---
  useEffect(() => {
    if (plan?.storefront) {
      if (plan.storefront.config) {
        setConfig(plan.storefront.config);
      }
      if (plan.storefront.content) {
        setContent(plan.storefront.content);
        setStep('preview');
      }
    }
  }, [plan?.storefront]); // Only trigger if storefront data specifically changes (or on init)

  const handleSmartGenerate = async () => {
    setLoading(true);
    setStep('building');
    
    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a rich JSON object for a premium online store homepage.
          Project: ${plan?.projectName}
          Niche: ${config.niche}
          Vibe: ${config.vibe}
          
          Return JSON with these exact keys:
          {
            "hero": { "headline": "Short punchy title", "subheadline": "Compelling 2-line description", "cta": "Button Text" },
            "products": [ { "id": "1", "name": "...", "price": 100000, "tag": "New" } (4 items) ],
            "features": [ { "title": "...", "desc": "...", "icon": "truck" } (3 items) ],
            "testimonials": [ { "name": "...", "role": "...", "comment": "...", "stars": 5 } (3 items) ],
            "footer": { "about": "Short brand story", "address": "Fake address Tehrn", "email": "info@example.com" }
          }
          
          Use Persian language. Make copy persuasive and high-end.`,
          systemPrompt: "You are a world-class UI/UX Copywriter. Return ONLY valid JSON."
        })
      });

      const data = await response.json();
      if (data.success && data.content) {
         const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
         setContent(parsed);
         setStep('preview');
         
         // Persist to DB
         updateActiveProject({
            storefront: {
               config: config,
               content: parsed,
               lastGeneratedAt: new Date().toISOString()
            }
         });
         toast.success("فروشگاه شما طراحی و ذخیره شد");

      } else {
         throw new Error("AI Generation failed");
      }

    } catch (err) {
      console.error(err);
      toast.error("خطا در تولید فروشگاه");
      setStep('onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
     updateActiveProject({
        storefront: {
           config,
           content,
           publishedAt: new Date().toISOString(),
           lastGeneratedAt: plan?.storefront?.lastGeneratedAt
        }
     });
     toast.success("فروشگاه با موفقیت منتشر شد! 🚀");
  };

  const isMobile = viewMode === 'mobile';

  return (
     <div className="min-h-screen bg-background text-foreground dir-rtl">
        {step === 'onboarding' && (
            <div className="max-w-2xl mx-auto py-12 px-4">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-purple-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 rotate-3 hover:rotate-6 transition-transform">
                   <Store size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">ساخت فروشگاه جادویی</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  هوش مصنوعی ما با تحلیل برند شما، یک فروشگاه کامل و حرفه‌ای را در چند ثانیه طراحی می‌کند.
                </p>
              </div>

              <Card className="p-8 border-border/60 shadow-xl space-y-8 bg-card/60 backdrop-blur-2xl rounded-[2rem]">
                {/* Niche Input */}
                <div className="space-y-4">
                   <label dir="rtl" className="text-sm font-bold flex items-center gap-2 w-full text-foreground/80">
                      <ShoppingBag size={18} className="text-primary" />
                      حوزه فعالیت فروشگاه
                   </label>
                   <input 
                      type="text"
                      dir="rtl"
                      value={config.niche}
                      onChange={e => setConfig({...config, niche: e.target.value})}
                      placeholder="مثال: پوشاک ورزشی، قهوه تخصصی، گالری هنری..."
                      className="w-full bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-primary/30 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-lg font-medium text-right shadow-sm placeholder:text-muted-foreground/40"
                   />
                </div>

                {/* Vibe Selector */}
                <div className="space-y-4">
                   <label dir="rtl" className="text-sm font-bold flex items-center gap-2 w-full text-foreground/80">
                      <Palette size={18} className="text-primary" />
                      وایب و استایل بصری
                   </label>
                   <div className="grid grid-cols-2 gap-4">
                      {VIBES.map(v => (
                        <div 
                          key={v.id}
                          onClick={() => setConfig({...config, vibe: v.id})}
                          className={`
                            cursor-pointer p-5 rounded-2xl border-2 transition-all relative overflow-hidden group
                            ${config.vibe === v.id 
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                : 'border-border/40 hover:border-primary/30 hover:bg-muted/30'}
                          `}
                        >
                           <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-base">{v.label}</span>
                              <div className="flex -space-x-2 space-x-reverse">
                                 {v.colors.map((c, i) => (
                                   <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" style={{ backgroundColor: c }} />
                                 ))}
                              </div>
                           </div>
                           <p className="text-xs text-muted-foreground leading-relaxed font-medium">{v.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <Button 
                  onClick={handleSmartGenerate}
                  disabled={!config.niche || loading}
                  className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                   {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 fill-white/20" />}
                   شروع طراحی هوشمند
                </Button>
              </Card>
            </div>
        )}

        {step === 'building' && (
           <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative">
                 <div className="w-32 h-32 bg-primary/20 rounded-full animate-ping absolute inset-0 duration-1000" />
                 <div className="w-32 h-32 bg-primary/10 rounded-full animate-ping absolute inset-0 delay-150 duration-1000" />
                 <div className="w-32 h-32 bg-gradient-to-tr from-primary to-purple-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-primary/40">
                    <Sparkles size={48} className="text-white animate-pulse" />
                 </div>
              </div>
              <div className="space-y-2 animate-fade-in-up">
                  <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                      درحال خلق جادو...
                  </h2>
                  <p className="text-muted-foreground text-lg">هوش مصنوعی در حال چیدمان المان‌ها و نوشتن متن‌هاست</p>
              </div>
           </div>
        )}

        {step === 'preview' && (
            <div className="h-[calc(100vh-80px)] flex flex-col">
               {/* Toolbar */}
               <header className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-30 sticky top-0">
                  <div className="flex items-center gap-6">
                     <Button variant="ghost" className="hover:bg-muted/50 rounded-xl gap-2" onClick={() => setStep('onboarding')}>
                        <ArrowRight size={18} className="rotate-180" />
                        بازگشت
                     </Button>
                     <div className="h-8 w-px bg-border/50" />
                     <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border/30">
                        <button 
                          onClick={() => setViewMode('desktop')}
                          className={`p-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'desktop' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                        >
                           <Monitor size={18} />
                           <span className="hidden md:inline">دسکتاپ</span>
                        </button>
                        <button 
                          onClick={() => setViewMode('mobile')}
                          className={`p-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'mobile' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                        >
                           <Smartphone size={18} />
                           <span className="hidden md:inline">موبایل</span>
                        </button>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <Button variant="outline" onClick={handleSmartGenerate} className="rounded-xl h-10 border-border/50 hover:bg-muted/50">
                        <RefreshCw size={16} className="mr-2" />
                        تولید مجدد
                     </Button>
                     <Button onClick={handlePublish} className="rounded-xl h-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 text-white font-bold px-6">
                        <CheckCircle2 size={18} className="mr-2" />
                        تایید و انتشار نهایی
                     </Button>
                  </div>
               </header>

               {/* Canvas Area */}
               <div className="flex-1 bg-muted/10 overflow-hidden flex items-start justify-center p-8 relative isolate">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] -z-10" />
                  
                  {/* Device Frame */}
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring', damping: 20 }}
                    className={`
                       bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden border border-border/50 transition-all duration-500 ease-in-out relative flex flex-col
                       ${isMobile 
                           ? 'w-[375px] h-[812px] rounded-[3rem] border-8 border-zinc-800 ring-1 ring-white/10' 
                           : 'w-full h-full max-w-[1400px] rounded-2xl ring-1 ring-border/20 shadow-[0_0_50px_-12px_rgba(0,0,0,0.2)]'}
                    `}
                    style={{ fontFamily: config.font }}
                  >
                     {/* StatusBar for Mobile */}
                     {isMobile && (
                        <div className="h-7 w-full bg-zinc-800 absolute top-0 left-0 right-0 z-50 flex justify-center items-center">
                           <div className="w-20 h-4 bg-black rounded-b-xl" />
                        </div>
                     )}

                     {/* Scrollable Content */}
                     <div className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth">
                        
                        {/* --- GENERATED STORE CONTENT --- */}
                        
                        {/* 1. Header */}
                        <nav className={`sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-border/5 px-6 flex items-center justify-between ${isMobile ? 'h-14 mt-4' : 'h-20'}`}>
                           <div className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                              {plan?.projectName}
                           </div>
                           <div className={`flex items-center gap-6 text-sm font-medium opacity-70 ${isMobile ? 'hidden' : 'flex'}`}>
                              <span className="hover:text-primary cursor-pointer transition-colors">خانه</span>
                              <span className="hover:text-primary cursor-pointer transition-colors">محصولات</span>
                              <span className="hover:text-primary cursor-pointer transition-colors">درباره ما</span>
                              <span className="hover:text-primary cursor-pointer transition-colors">تماس</span>
                           </div>
                           <div className="flex gap-3">
                              <Button size="icon" variant="ghost" className="rounded-full"><ShoppingBag size={20} /></Button>
                              <Button size={isMobile ? "sm" : "default"} className="rounded-full font-bold">ورود</Button>
                           </div>
                        </nav>

                        {/* 2. Hero Section */}
                        {/* 2. Hero Section */}
                        <header className={`relative text-white overflow-hidden flex flex-col justify-center items-center text-center shrink-0 ${isMobile ? 'py-16 px-6 min-h-[400px]' : 'py-32 px-12 min-h-[600px]'}`}>
                           
                           {/* Dynamic Background Layer */}
                           <div className={`absolute inset-0 w-full h-full
                              ${(!config.vibe || config.vibe === 'minimal') ? 'bg-gradient-to-br from-zinc-900 to-zinc-700' : ''}
                              ${config.vibe === 'luxury' ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#1a1a1a]' : ''}
                              ${config.vibe === 'bold' ? 'bg-gradient-to-br from-rose-600 to-indigo-700' : ''}
                              ${config.vibe === 'playful' ? 'bg-gradient-to-br from-orange-400 to-pink-500' : ''}
                           `} />
                           
                           {/* Pattern Overlay */}
                           <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

                           {/* Content Layer */}
                           <div className="relative z-10 flex flex-col items-center w-full">
                              <Badge className="mb-6 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur px-4 py-1 text-base shadow-sm">
                                 {config.niche || "فروشگاه"}
                              </Badge>
                              <h1 className={`${isMobile ? 'text-4xl' : 'text-7xl'} font-black mb-6 leading-[1.1] tracking-tight max-w-4xl drop-shadow-lg`}>
                                 {content?.hero.headline || "عنوان فروشگاه شما"}
                              </h1>
                              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} mb-10 opacity-90 max-w-2xl leading-relaxed font-light drop-shadow-md`}>
                                 {content?.hero.subheadline || "توضیحات جذاب درباره محصولات شما که مشتری را جذب می‌کند."}
                              </p>
                              <Button size="lg" className={`${isMobile ? 'w-full' : 'px-12'} h-14 text-lg rounded-full bg-white text-black hover:bg-white/90 shadow-2xl hover:scale-105 transition-transform font-bold`}>
                                 {content?.hero.cta || "خرید کنید"} <ArrowRight size={20} className="mr-2" />
                              </Button>
                           </div>
                        </header>

                        {/* 3. Features Grid */}
                        <section className="py-20 bg-muted/5">
                           <div className={`mx-auto px-6 ${isMobile ? 'w-full' : 'max-w-6xl'}`}>
                              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                 {content?.features.map((f, i) => (
                                    <div key={i} className="bg-background p-8 rounded-3xl border border-border/40 hover:border-primary/20 hover:shadow-xl transition-all hover:-translate-y-1 group">
                                       <div className="w-14 h-14 rounded-2xl bg-primary/5 mb-6 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                          <CheckCircle2 size={28} />
                                       </div>
                                       <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                                       <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </section>

                        {/* 4. Products Showcase */}
                        <section className="py-24 px-6 bg-background">
                           <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-7xl'}`}>
                              <div className="text-center mb-16 space-y-4">
                                 <h2 className="text-3xl md:text-5xl font-black">پرفروش‌ترین‌های فصل</h2>
                                 <p className="text-muted-foreground text-lg">محصولاتی که مشتریان عاشق آن شده‌اند</p>
                              </div>
                              
                              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
                                 {content?.products.map((p, i) => (
                                    <div key={i} className="group relative">
                                       <div className="aspect-[4/5] bg-muted/30 rounded-[2rem] mb-5 overflow-hidden relative isolate">
                                           <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-6`}>
                                             <Button className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all font-bold">افزودن به سبد</Button>
                                           </div>
                                           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 bg-muted/50 group-hover:scale-105 transition-transform duration-700">
                                              <ImageIcon size={64} className="opacity-50" />
                                           </div>
                                           {p.tag && (
                                              <Badge className="absolute top-4 right-4 bg-white text-black hover:bg-white text-xs font-bold py-1 px-3 shadow-md z-20">
                                                 {p.tag}
                                              </Badge>
                                           )}
                                       </div>
                                       <div className="space-y-1 px-2">
                                          <h3 className="font-bold text-lg">{p.name}</h3>
                                          <div className="flex items-center justify-between">
                                             <span className="text-muted-foreground/80">{p.price.toLocaleString()} تومان</span>
                                             <div className="flex text-amber-500">
                                                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </section>

                        {/* 5. Testimonials (New) */}
                        <section className="py-24 bg-zinc-900 text-white relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                           <div className={`mx-auto px-6 relative z-10 ${isMobile ? 'w-full' : 'max-w-6xl'}`}>
                              <h2 className="text-3xl md:text-5xl font-black text-center mb-16">نظرات مشتریان ما</h2>
                              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                 {content?.testimonials?.map((t, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                                       <div className="flex text-primary mb-4">
                                          {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                       </div>
                                       <p className="text-lg leading-relaxed opacity-90 mb-6">"{t.comment}"</p>
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                                          <div>
                                             <h4 className="font-bold text-sm">{t.name}</h4>
                                             <p className="text-xs opacity-50">{t.role}</p>
                                          </div>
                                       </div>
                                    </div>
                                 )) || (
                                    <p className="text-center col-span-full opacity-50">در حال بارگذاری نظرات...</p>
                                 )}
                              </div>
                           </div>
                        </section>

                        {/* 6. Newsletter */}
                        <section className="py-20 px-6 bg-primary/5">
                           <div className={`mx-auto text-center space-y-6 ${isMobile ? 'w-full' : 'max-w-2xl'}`}>
                              <Mail size={48} className="mx-auto text-primary" />
                              <h2 className="text-3xl font-bold">عضویت در خبرنامه</h2>
                              <p className="text-muted-foreground">برای دریافت آخرین تخفیف‌ها و محصولات جدید عضو شوید.</p>
                              <div className="flex gap-2 max-w-md mx-auto">
                                 <Input placeholder="ایمیل شما..." className="rounded-xl h-12 bg-background border-border" />
                                 <Button className="h-12 rounded-xl px-8 font-bold">عضویت</Button>
                              </div>
                           </div>
                        </section>

                        {/* 7. Footer */}
                        <footer className="bg-background border-t border-border pt-16 pb-8 px-6">
                           <div className={`mx-auto grid gap-12 mb-12 ${isMobile ? 'grid-cols-1 space-y-8' : 'grid-cols-4 max-w-7xl'}`}>
                              <div className="col-span-1 md:col-span-2 space-y-4">
                                 <h3 className="font-black text-2xl">{plan?.projectName}</h3>
                                 <p className="text-muted-foreground max-w-sm leading-relaxed">
                                    {content?.footer?.about || "ما متعهد به ارائه بهترین محصولات با بالاترین کیفیت به مشتریان عزیزمان هستیم."}
                                 </p>
                              </div>
                              <div className="space-y-4">
                                 <h4 className="font-bold">دسترسی سریع</h4>
                                 <ul className="space-y-2 text-muted-foreground text-sm">
                                    <li className="hover:text-primary cursor-pointer">محصولات جدید</li>
                                    <li className="hover:text-primary cursor-pointer">درباره ما</li>
                                    <li className="hover:text-primary cursor-pointer">تماس با ما</li>
                                    <li className="hover:text-primary cursor-pointer">قوانین و مقررات</li>
                                 </ul>
                              </div>
                              <div className="space-y-4">
                                 <h4 className="font-bold">تماس با ما</h4>
                                 <div className="space-y-3 text-muted-foreground text-sm">
                                    <div className="flex items-center gap-2"><MapPin size={16} /> {content?.footer?.address || "تهران، ایران"}</div>
                                    <div className="flex items-center gap-2"><Mail size={16} /> {content?.footer?.email || "hello@example.com"}</div>
                                    <div className="flex gap-4 mt-4 text-foreground/50">
                                       <Instagram size={20} className="hover:text-primary cursor-pointer" />
                                       <Twitter size={20} className="hover:text-primary cursor-pointer" />
                                       <Linkedin size={20} className="hover:text-primary cursor-pointer" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="text-center pt-8 border-t border-border/40 text-xs text-muted-foreground">
                              © ۲۰۲۴ تمامی حقوق برای {plan?.projectName} محفوظ است.
                           </div>
                        </footer>

                     </div>
                     {/* End Scrollable Content */}

                  </motion.div>
               </div>
            </div>
        )}
     </div>
  );
}
