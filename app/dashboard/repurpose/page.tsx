"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, RefreshCw, Layers, Youtube, Twitter, Instagram, 
  Linkedin, ArrowRight, Loader2, CheckCircle2, FileText, Video,
  UploadCloud, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RepurposePage() {
  const { activeProject: plan } = useProject();
  const [activeStep, setActiveStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Share2 size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">بازیافت محتوا (Repurpose)</h2>
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

  const handleProcess = () => {
    if (!videoUrl) {
      toast.error("لینک ویدیو را وارد کنید");
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
      toast.success("محتوای شما تبدیل شد!");
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تولید محتوای چندگانه (Repurpose)</h1>
              <p className="text-muted-foreground">تبدیل یک ویدیو به پست وبلاگ، رشته‌توییت و شورت ویدیو</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
              <h3 className="font-bold">لینک محتوای اصلی را وارد کنید</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-2 min-h-[150px] cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud size={40} className="text-muted-foreground" />
                <p className="font-medium">آپلود فایل ویدیو</p>
                <p className="text-xs text-muted-foreground">MP4, MOV تا ۵۰۰ مگابایت</p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-50 px-2 pointer-events-none">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs">یا لینک یوتیوب</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              </div>

              <div className="pt-4">
                <input 
                  className="input-premium w-full"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              <Button 
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-lg gap-2"
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isProcessing ? "در حال پردازش هوشمند..." : "شروع جادو"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Layers className="text-primary" size={20} />
              خروجی‌های مورد نظر
            </h3>
            <div className="space-y-3">
              {[
                { icon: Twitter, label: "رشته توییت (Thread)", time: "۵ توییت" },
                { icon: Instagram, label: "کپشن اینستاگرام", time: "با هشتگ" },
                { icon: FileText, label: "پست وبلاگ کامل", time: "۱۵۰۰ کلمه" },
                { icon: Linkedin, label: "پست لینکدین حرفه‌ای", time: "متن کوتاه" },
                { icon: Video, label: "۳ کلیپ کوتاه (Shorts)", time: "زیر ۶۰ ثانیه", badge: "PRO" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-muted-foreground" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{item.badge}</Badge>}
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                    <CheckCircle2 size={16} className="text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results Preview */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
             <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
             <h3 className="font-bold opacity-80">پیش‌نمایش خروجی‌ها</h3>
          </div>

          <div className="relative min-h-[400px]">
             {isProcessing && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm rounded-3xl border border-border">
                  <div className="w-20 h-20 relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
                  </div>
                  <p className="mt-4 font-bold text-lg">دستیار کارنکس در حال نوشتن...</p>
                  <p className="text-xs text-muted-foreground">تحلیل ویدیو • استخراج نکات • تولید محتوا</p>
               </div>
             )}

             {showResults ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-4"
               >
                 <Card className="p-4 border-l-4 border-l-blue-400">
                   <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold text-sm">
                     <Twitter size={16} />
                     رشته توییت پیشنهادی
                   </div>
                   <p className="text-sm leading-relaxed">
                     ۱/۵ 🧵<br/>
                     آیا می‌دونستید برای شروع برنامه‌نویسی نیازی به لپ‌تاپ ۵۰ میلیونی ندارید؟ 💻❌<br/>
                     
                     خیلی‌ها فکر می‌کنن باید مک‌بوک داشته باشن، اما... 👇<br/>
                     #برنامه_نویسی #تکنولوژی
                   </p>
                 </Card>

                 <Card className="p-4 border-l-4 border-l-pink-500">
                   <div className="flex items-center gap-2 mb-2 text-pink-500 font-bold text-sm">
                     <Instagram size={16} />
                     کپشن اینستاگرام
                   </div>
                   <p className="text-sm leading-relaxed">
                     شروع برنامه‌نویسی با سیستم ضعیف؟ 🤔<br/><br/>
                     
                     خیلی از شما دایرکت دادید که سیستمم قدیمیه...<br/>
                     توی این ویدیو ۴ تا راهکار بهت گفتم که با همین لپ‌تاپ قدیمی هم بتونی کد بزنی! 🔥<br/><br/>
                     
                     اگه میخوای بدونی چطوری، اسلاید آخر رو ببین! 👈<br/><br/>
                     
                     .
                     .
                     #کدنویسی #لپتاپ_دانشجویی #ترفند_تکنولوژی
                   </p>
                 </Card>

                 <Card className="p-4 border-l-4 border-l-red-500">
                   <div className="flex items-center gap-2 mb-2 text-red-500 font-bold text-sm">
                     <Video size={16} />
                     ایده Shorts / Reels
                   </div>
                   <div className="bg-muted p-3 rounded-lg text-xs font-mono">
                     [00:00] هوک: نشون دادن لپ‌تاپ قدیمی و کند<br/>
                     [00:05] متن روی تصویر: "فکر میکنی نمیشه با این کد زد؟"<br/>
                     [00:15] نشون دادن VS Code که روان اجرا میشه (با Cloud Space)<br/>
                     [00:45] نتیجه نهایی یک پروژه وب
                   </div>
                 </Card>
                 
               </motion.div>
             ) : (
               !isProcessing && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-3xl opacity-50">
                    <Layers size={48} className="mb-4 text-muted-foreground" />
                    <p className="font-medium">منتظر ورودی شما...</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                      لینک ویدیو را وارد کنید تا هوش مصنوعی آن را به ۵ نوع محتوا تبدیل کند.
                    </p>
                  </div>
               )
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
