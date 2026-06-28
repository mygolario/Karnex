"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Share2, RefreshCw, Layers, Youtube, Twitter, Instagram, 
  Linkedin, ArrowRight, Loader2, CheckCircle2, FileText, Video,
  UploadCloud, Sparkles, Copy, Wand2, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GeneratedContent = {
  twitterThread: string;
  linkedinPost: string;
  instagramCaption: string;
  videoScript: string;
};

export default function RepurposePage() {
  const { activeProject: plan } = useProject();
  const [step, setStep] = useState<1 | 2>(1);
  const [inputs, setInputs] = useState({
    url: "",
    topic: "",
    tone: "professional"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedContent | null>(null);

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

  const handleGenerate = async () => {
    if (!inputs.url || !inputs.topic) {
      toast.error("لطفا لینک و موضوع ویدیو را وارد کنید");
      return;
    }

    setIsGenerating(true);
    setResults(null);

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "repurpose-content",
          topic: inputs.topic,
          url: inputs.url,
          tone: inputs.tone,
          activeProject: plan,
        }),
      });

      const data = await response.json();

      if (data.success && data.content) {
        const parsed: GeneratedContent = typeof data.content === "string"
          ? JSON.parse(data.content.replace(/```json/g, '').replace(/```/g, '').trim())
          : data.content;
        setResults(parsed);
        setStep(2);
        toast.success("محتوای شما با موفقیت تولید شد! 🎉");
      } else {
        toast.error("خطا در ارتباط با کارنکس");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطای سیستمی رخ داد");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("کپی شد!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <RefreshCw className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">توزیع محتوا (Repurpose AI)</h1>
          <p className="text-muted-foreground text-lg">تبدیل هوشمند یک محتوا به ۴ فرمت پولساز برای شبکه‌های اجتماعی</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="input-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left: Input Form */}
            <Card className="lg:col-span-2 p-8 border-primary/20 bg-gradient-to-b from-card to-background/50">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">۱. لینک محتوای اصلی</label>
                  <div className="relative">
                    <Youtube className="absolute right-3 top-3 text-red-500" size={20} />
                    <input 
                      className="input-premium w-full pr-10 pl-4 py-3"
                      placeholder="https://youtube.com/watch?v=..."
                      value={inputs.url}
                      onChange={(e) => setInputs({...inputs, url: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold mb-2">۲. موضوع و نکات کلیدی (Context)</label>
                   <p className="text-xs text-muted-foreground mb-2">
                     برای بهترین نتیجه، خلاصه‌ای از محتوا یا نکاتی که حتما باید ذکر شوند را بنویسید.
                   </p>
                   <Textarea 
                      className="min-h-[120px] resize-none bg-background/50"
                      placeholder="مثلا: در این ویدیو ۳ روش برای افزایش فروش اینستاگرام توضیح دادم: ۱. استوری تعاملی ۲. ریلز ترند ۳. کپشن‌نویسی صحیح..."
                      value={inputs.topic}
                      onChange={(e) => setInputs({...inputs, topic: e.target.value})}
                   />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">۳. لحن محتوا (Tone)</label>
                  <Select 
                    value={inputs.tone} 
                    onValueChange={(val) => setInputs({...inputs, tone: val})}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="انتخاب لحن" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">رسمی و تخصصی (مناسب لینکدین)</SelectItem>
                      <SelectItem value="friendly">دوستانه و صمیمی (مناسب اینستاگرام)</SelectItem>
                      <SelectItem value="controversial">چالشی و بحث‌برانگیز (وایرال)</SelectItem>
                      <SelectItem value="educational">آموزشی و نکته‌محور</SelectItem>
                      <SelectItem value="humorous">طنز و سرگرم‌کننده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  size="xl" 
                  className="w-full text-lg gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/20"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" />
                      در حال عصاره‌گیری از محتوا...
                    </>
                  ) : (
                    <>
                      <Sparkles className="animate-pulse" />
                      تولید محتوای هوشمند
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Right: Info Column */}
            <div className="space-y-4">
              <Card className="p-6 bg-indigo-500/5 border-indigo-500/20">
                <h3 className="font-bold flex items-center gap-2 mb-4 text-indigo-600">
                  <Wand2 size={20} />
                  خروجی‌های شما
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                        <Twitter className="text-blue-400" size={20} />
                        <div className="text-sm font-medium">رشته توییت (Thread)</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                        <Linkedin className="text-blue-700" size={20} />
                        <div className="text-sm font-medium">پست لینکدین</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                        <Instagram className="text-pink-500" size={20} />
                        <div className="text-sm font-medium">کپشن اینستاگرام</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                        <Video className="text-red-500" size={20} />
                        <div className="text-sm font-medium">اسکریپت Shorts/Reels</div>
                    </div>
                </div>
              </Card>

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 text-sm leading-relaxed">
                💡 <strong>نکته حرفه‌ای:</strong> هر چقدر توضیحات بخش "Context" دقیق‌تر باشد، خروجی کارنکس کاربردی‌تر و شخصی‌سازی‌شده‌تر خواهد بود.
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" />
                    نتیجه پردازش
                </h2>
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <ArrowRight size={16} />
                    تولید مجدد / تغییر ورودی
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Twitter Thread */}
                <Card className="overflow-hidden border-t-4 border-t-blue-400">
                    <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-blue-500">
                            <Twitter size={18} /> رشته توییت
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(results?.twitterThread || "")}>
                            <Copy size={14} />
                        </Button>
                    </div>
                    <div className="p-4">
                        <Textarea 
                            className="min-h-[300px] border-0 focus-visible:ring-0 resize-none leading-relaxed" 
                            defaultValue={results?.twitterThread} 
                        />
                    </div>
                </Card>

                {/* LinkedIn Post */}
                <Card className="overflow-hidden border-t-4 border-t-blue-700">
                    <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-blue-700">
                            <Linkedin size={18} /> پست لینکدین
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(results?.linkedinPost || "")}>
                            <Copy size={14} />
                        </Button>
                    </div>
                    <div className="p-4">
                        <Textarea 
                            className="min-h-[300px] border-0 focus-visible:ring-0 resize-none leading-relaxed" 
                            defaultValue={results?.linkedinPost} 
                        />
                    </div>
                </Card>

                {/* Instagram Caption */}
                <Card className="overflow-hidden border-t-4 border-t-pink-500">
                    <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-pink-500">
                            <Instagram size={18} /> کپشن اینستاگرام
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(results?.instagramCaption || "")}>
                            <Copy size={14} />
                        </Button>
                    </div>
                    <div className="p-4">
                        <Textarea 
                            className="min-h-[300px] border-0 focus-visible:ring-0 resize-none leading-relaxed" 
                            defaultValue={results?.instagramCaption} 
                        />
                    </div>
                </Card>

                {/* Video Script */}
                <Card className="overflow-hidden border-t-4 border-t-red-500">
                    <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-red-500">
                            <Video size={18} /> سناریو ویدیو کوتاه
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(results?.videoScript || "")}>
                            <Copy size={14} />
                        </Button>
                    </div>
                    <div className="p-4">
                        <Textarea 
                            className="min-h-[300px] border-0 focus-visible:ring-0 resize-none leading-relaxed font-mono text-sm bg-slate-50 dark:bg-slate-900/50" 
                            defaultValue={results?.videoScript} 
                        />
                    </div>
                </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
