"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Mic, Type, FileText, PlayCircle, Copy, 
  Check, Save, Sparkles, Loader2, Youtube, 
  Instagram, Wand2, History
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Script {
  id: string;
  title: string;
  type: "youtube" | "reel" | "tiktok";
  content: string;
  date: string;
}

export default function ScriptsPage() {
  const { activeProject: plan } = useProject();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"youtube" | "reel">("youtube");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string>("");

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Video size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">اسکریپت‌نویس برای تولیدکنندگان محتوا</h2>
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

  const handleGenerate = () => {
    if (!topic) {
      toast.error("موضوع ویدیو را وارد کنید");
      return;
    }
    
    setIsGenerating(true);
    setTimeout(() => {
      const script = type === "youtube" 
        ? `[HOOK]
(۰:۰۰ - ۰:۳۰)
آیا تا به حال فکر کردید که چرا [مشکل] برای شما پیش میاد؟ در این ویدیو میخوام ۳ راز مخفی درباره ${topic} رو بهتون بگم که هیچکس بهتون نمیگه! تا آخر ویدیو با من همراه باشید چون نکته سوم زندگی شما رو تغییر میده.

[INTRO]
(۰:۳۰ - ۱:۰۰)
سلام رفقا، من [نام] هستم و اینجا کانال [نام کانال] هست. امروز قراره عمیق بشیم تو بحث ${topic}.

[BODY PARAGRAPH 1]
(۱:۰۰ - ۳:۰۰)
اولین نکته‌ای که باید بدونید اینه که...
(توضیحات تکمیلی و مثال ها)

[BODY PARAGRAPH 2]
(۳:۰۰ - ۵:۰۰)
و اما نکته دوم که خیلی مهمه...

[CTA]
(۵:۰۰ - ۵:۳۰)
قبل از اینکه بریم سراغ نکته طلایی سوم، همین الان دکمه سابسکرایب رو بزن تا ویدیوهای بعدی رو از دست ندی!

[BODY PARAGRAPH 3]
(۵:۳۰ - ۷:۰۰)
و اما راز سوم...

[OUTRO]
(۷:۰۰ - ۷:۳۰)
مرسی که تماشا کردید. نظرتون رو توی کامنت‌ها بنویسید. ویدیو بعدی میبینمتون!`
        : `[HOOK] (۳ ثانیه)
توی این ویدیو میخوام یه ترفند عجیب درباره ${topic} بهت یاد بدم! 🤯

[BODY] (۱۵-۴۵ ثانیه)
اگه میخوای [نتیجه] بگیری، باید این کارو بکنی:
۱. قدم اول...
۲. قدم دوم... (نمایش تصویری)
۳. و مهمترین قدم...

[CTA] (۵ ثانیه)
اگه برات مفید بود حتما سیو کن که بعدا گمش نکنی! برای آموزش‌های بیشتر فالو کن 🔥`;

      setGeneratedScript(script);
      setIsGenerating(false);
      toast.success("سناریو ویدیو آماده شد!");
    }, 2500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success("کپی شد");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">نویسنده هوشمند سناریو</h1>
              <p className="text-muted-foreground">تولید اسکریپت حرفه‌ای برای یوتیوب، اینستاگرام و تیک‌تاک</p>
            </div>
          </div>
        </div>
        
        <Button variant="outline" className="gap-2">
          <History size={18} />
          تاریخچه اسکریپت‌ها
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Wand2 className="text-primary" size={20} />
            تنظیمات تولید
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">پلتفرم هدف</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setType("youtube")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === "youtube" ? "bg-red-500/10 border-red-500 text-red-600" : "hover:bg-muted"}`}
                >
                  <Youtube size={24} />
                  <span className="text-sm font-bold">YouTube</span>
                </button>
                <button
                  onClick={() => setType("reel")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === "reel" ? "bg-pink-500/10 border-pink-500 text-pink-600" : "hover:bg-muted"}`}
                >
                  <Instagram size={24} />
                  <span className="text-sm font-bold">Reels / Shorts</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">موضوع ویدیو</label>
              <textarea 
                className="input-premium w-full min-h-[100px]"
                placeholder="مثال: آموزش ساخت قهوه ترک حرفه‌ای در خانه بدون دستگاه"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button 
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-secondary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              تولید سناریو
            </Button>
          </div>
        </Card>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-muted-foreground" />
                <span className="font-bold text-sm">پیش‌نویس سناریو</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!generatedScript}>
                  <Copy size={16} className="mr-2" />
                  کپی
                </Button>
                <Button variant="ghost" size="sm" disabled={!generatedScript}>
                  <Save size={16} className="mr-2" />
                  ذخیره
                </Button>
              </div>
            </div>

            <div className="flex-1 p-6 font-mono text-sm leading-8 whitespace-pre-wrap overflow-y-auto max-h-[600px] bg-[#fdfbf7] dark:bg-[#1a1a1a] text-foreground">
              {generatedScript ? (
                generatedScript
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Type size={48} className="mb-4" />
                  <p>منتظر ورودی شما هستیم...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
