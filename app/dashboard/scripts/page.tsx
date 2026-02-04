"use client";

import { useState, useRef, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Video, Mic, Type, FileText, PlayCircle, Copy, 
  Check, Save, Sparkles, Loader2, Youtube, 
  Instagram, Wand2, History, X, MonitorPlay, 
  Maximize2, Settings2, FlipHorizontal, Play, Pause, Trash2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger 
} from "@/components/ui/sheet";

type SavedScript = {
  id: string;
  topic: string;
  content: string;
  template: string;
  date: string;
  duration: string;
};

export default function ScriptsPage() {
  const { activeProject: plan } = useProject();
  const [step, setStep] = useState<1 | 2>(1);
  const [inputs, setInputs] = useState({
    topic: "",
    audience: "",
    duration: "60s",
    template: "viral-hook"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  
  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  
  // Teleprompter State
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(48);
  const [isMirrored, setIsMirrored] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    if (plan?.id) {
      const stored = localStorage.getItem(`scripts_history_${plan.id}`);
      if (stored) {
        try {
          setSavedScripts(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
  }, [plan?.id]);

  // Save to history method
  const saveToHistory = () => {
    if (!generatedScript || !plan?.id) return;
    
    const newScript: SavedScript = {
      id: Date.now().toString(),
      topic: inputs.topic || "Untitled Script",
      content: generatedScript,
      template: inputs.template,
      date: new Date().toISOString(),
      duration: inputs.duration
    };
    
    const updated = [newScript, ...savedScripts];
    setSavedScripts(updated);
    localStorage.setItem(`scripts_history_${plan.id}`, JSON.stringify(updated));
    toast.success("اسکریپت در تاریخچه ذخیره شد");
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!plan?.id) return;
    const updated = savedScripts.filter(s => s.id !== id);
    setSavedScripts(updated);
    localStorage.setItem(`scripts_history_${plan.id}`, JSON.stringify(updated));
    toast.success("حذف شد");
  };

  const loadScript = (script: SavedScript) => {
    setGeneratedScript(script.content);
    setInputs({
      ...inputs,
      topic: script.topic,
      template: script.template,
      duration: script.duration
    });
    setStep(2);
    setHistoryOpen(false);
    toast.info("اسکریپت بارگذاری شد");
  };

  // Check project type (keep existing check)
  if (plan?.projectType !== "creator") {
    // ... existing check code ...
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Video size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت اسکریپت (Director Mode)</h2>
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

  // AI Generation (Keep existing logic)
  const handleGenerate = async () => {
    if (!inputs.topic) {
        toast.error("لطفا موضوع ویدیو را وارد کنید");
        return;
    }
    setIsGenerating(true);
    try {
        const templatePrompt = {
            "viral-hook": "Format: High-energy Hook (0-5s) -> Re-hook -> Value Delivery -> Surprise Twist -> CTA. Focus on retention.",
            "educational": "Format: Problem Statement -> Agitation -> The Solution (Step by Step) -> Common Pitfalls -> CTA.",
            "storytelling": "Format: The 'Before' State -> The Inciting Incident -> The Struggle -> The Realization -> The Transformation.",
            "sales": "Format: Attention -> Interest -> Desire -> Action (AIDA model). Hard sell."
        }[inputs.template];
        
        const prompt = `
            Act as an expert Video Scriptwriter. Write a Persian script for a ${inputs.duration} video.
            Topic: ${inputs.topic}
            Target Audience: ${inputs.audience || "General"}
            Style/Template: ${templatePrompt}

            Output Guidelines:
            1. Write in spoken, natural Persian (محاوره‌ای).
            2. Include Visual Cues in brackets, e.g., [Zoom in], [Show B-Roll].
            3. Structure clearly with timecodes if possible.
            4. Make the hook extremely catchy.
        `;

        const response = await fetch("/api/ai-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt, 
                systemPrompt: "You are a professional YouTuber scriptwriter. Output ONLY the raw script text." 
            })
        });

        const data = await response.json();
        if (data.success && data.content) {
            setGeneratedScript(data.content);
            setStep(2);
            toast.success("سناریو آماده شد! 🎬");
            
            // Auto-save to history on generation? Maybe better manual.
        }
    } catch (error) {
        toast.error("خطا در تولید سناریو");
    } finally {
        setIsGenerating(false);
    }
  };

  // Teleprompter Logic (Keep existing)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTeleprompterOpen && isPlaying && scrollerRef.current) {
      interval = setInterval(() => {
        if (scrollerRef.current) {
          scrollerRef.current.scrollTop += scrollSpeed;
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isTeleprompterOpen, isPlaying, scrollSpeed]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">استودیو اسکریپت (Director Mode)</h1>
              <p className="text-muted-foreground text-lg">نویسنده هوشمند + تله‌پرامپتر حرفه‌ای</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
           <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
             <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <History size={16} /> تاریخچه
                </Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-[400px] sm:w-[540px]">
                <SheetHeader className="mb-6">
                    <SheetTitle>تاریخچه اسکریپت‌ها</SheetTitle>
                    <SheetDescription>
                        تمام اسکریپت‌های ذخیره شده شما در این بخش قابل دسترسی است.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 overflow-y-auto max-h-[80vh] pr-2">
                    {savedScripts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            <History className="mx-auto mb-2 opacity-50" size={32} />
                            <p>هنوز اسکریپتی ذخیره نشده است</p>
                        </div>
                    ) : (
                        savedScripts.map((s) => (
                            <Card 
                                key={s.id} 
                                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors group relative"
                                onClick={() => loadScript(s)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-foreground line-clamp-1">{s.topic}</h4>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-100 -mt-1 -mr-1"
                                        onClick={(e) => deleteFromHistory(s.id, e)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                        {s.template === 'viral-hook' ? 'وایرال' : s.template}
                                    </Badge>
                                    <span>•</span>
                                    <span>{new Date(s.date).toLocaleDateString('fa-IR')}</span>
                                    <span>•</span>
                                    <span>{s.duration}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 font-mono opacity-70">
                                    {s.content}
                                </p>
                            </Card>
                        ))
                    )}
                </div>
             </SheetContent>
           </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input / Editor (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6 border-l-4 border-l-red-500 bg-gradient-to-br from-card to-background">
             <h3 className="font-bold mb-6 flex items-center gap-2 text-lg">
                <Wand2 className="text-red-500" />
                تنظیمات سناریو
             </h3>
             
             <div className="space-y-5">
                <div>
                   <label className="text-sm font-bold mb-2 block">موضوع ویدیو</label>
                   <Textarea 
                      placeholder="مثلاً: ۳ ترفند برای افزایش تمرکز در هنگام کار..." 
                      className="min-h-[80px] bg-background/50 resize-none"
                      value={inputs.topic}
                      onChange={(e) => setInputs({...inputs, topic: e.target.value})}
                   />
                </div>

                <div>
                   <label className="text-sm font-bold mb-2 block">مخاطب هدف (اختیاری)</label>
                   <input 
                      className="input-premium w-full"
                      placeholder="مثلاً: دانشجویان، فریلنسرها..." 
                      value={inputs.audience}
                      onChange={(e) => setInputs({...inputs, audience: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold mb-2 block">مدت زمان</label>
                        <Select value={inputs.duration} onValueChange={(val) => setInputs({...inputs, duration: val})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30s">۳۰ ثانیه (Shorts)</SelectItem>
                                <SelectItem value="60s">۱ دقیقه (Reels)</SelectItem>
                                <SelectItem value="3m">۳ دقیقه (YouTube)</SelectItem>
                                <SelectItem value="10m">۱۰ دقیقه (Long Form)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-bold mb-2 block">قالب (Template)</label>
                        <Select value={inputs.template} onValueChange={(val) => setInputs({...inputs, template: val})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="viral-hook">وایرال و سرگرم‌کننده</SelectItem>
                                <SelectItem value="educational">آموزشی و نکته‌دار</SelectItem>
                                <SelectItem value="storytelling">داستان‌سرایی</SelectItem>
                                <SelectItem value="sales">فروش و تبلیغات</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                   size="lg" 
                   className="w-full text-base gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/20"
                   onClick={handleGenerate}
                   disabled={isGenerating}
                >
                   {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                   {step === 1 ? "نوشتن سناریو" : "بازنویسی سناریو"}
                </Button>
             </div>
           </Card>

           {/* Teleprompter Quick Settings (Visible only when script exists) */}
           {step === 2 && (
             <Card className="p-6 bg-slate-900 text-white border-0">
               <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400">
                 <MonitorPlay size={20} />
                 آماده ضبط؟
               </h3>
               <p className="text-sm text-slate-400 mb-4">
                 سناریو را در حالت تله‌پرامپتر باز کنید و جلوی دوربین قرار بگیرید.
               </p>
               <Button 
                 variant="outline" 
                 className="w-full border-slate-700 hover:bg-slate-800 text-white gap-2 h-12"
                 onClick={() => setIsTeleprompterOpen(true)}
               >
                 <Maximize2 size={18} />
                 باز کردن تله‌پرامپتر
               </Button>
             </Card>
           )}
        </div>

        {/* Right: Script Editor (8 Cols) */}
        <div className="lg:col-span-8">
            <Card className="h-[600px] flex flex-col relative overflow-hidden ring-1 ring-border shadow-sm">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground" size={18} />
                        <span className="font-bold text-sm">متن سناریو</span>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="ghost" size="sm" onClick={() => {
                             navigator.clipboard.writeText(generatedScript);
                             toast.success("کپی شد");
                         }}>
                             <Copy size={16} />
                         </Button>
                         <Button variant="ghost" size="sm" onClick={saveToHistory} disabled={!generatedScript}>
                            <Save size={16} className="mr-2" />
                            ذخیره
                         </Button>
                    </div>
                </div>
                
                <div className="flex-1 relative">
                    {step === 1 && !generatedScript ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground opacity-50 p-8 text-center">
                            <Video size={64} className="mb-4 stroke-1" />
                            <p className="text-lg font-medium">هنوز سناریویی ندارید</p>
                            <p className="text-sm">از پنل سمت راست موضوع را وارد کنید تا هوش مصنوعی برایتان بنویسد.</p>
                        </div>
                    ) : (
                        <Textarea 
                            className="w-full h-full p-8 text-lg leading-relaxed resize-none border-0 focus-visible:ring-0 font-sans"
                            value={generatedScript}
                            onChange={(e) => setGeneratedScript(e.target.value)}
                            placeholder="متن سناریو اینجا قرار می‌گیرد..."
                            dir="rtl"
                        />
                    )}
                </div>
            </Card>
        </div>
      </div>

      {/* Teleprompter Overlay */}
      <AnimatePresence>
        {isTeleprompterOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
          >
            {/* Teleprompter Toolbar */}
            <div className="h-20 shrink-0 flex items-center justify-between px-8 bg-black/80 backdrop-blur border-b border-white/10 z-50">
               <div className="flex items-center gap-6">
                  <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsTeleprompterOpen(false)}>
                      <X size={24} />
                      <span className="mr-2">خروج</span>
                  </Button>
                  
                  <div className="h-8 w-px bg-white/20" />
                  
                  <div className="flex items-center gap-4">
                      <span className="text-xs font-bold uppercase text-white/50 tracking-wider">سرعت</span>
                      <Slider 
                         value={[scrollSpeed]} 
                         onValueChange={(val) => setScrollSpeed(val[0])} 
                         max={10} 
                         step={1} 
                         className="w-32"
                      />
                  </div>

                  <div className="flex items-center gap-4">
                      <span className="text-xs font-bold uppercase text-white/50 tracking-wider">سایز متن</span>
                      <Slider 
                         value={[fontSize]} 
                         onValueChange={(val) => setFontSize(val[0])} 
                         min={24}
                         max={120} 
                         step={4} 
                         className="w-32"
                      />
                  </div>

                  <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-white/50 tracking-wider">آینه</span>
                      <Switch checked={isMirrored} onCheckedChange={setIsMirrored}  />
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <Button 
                    size="lg" 
                    className={cn(
                        "rounded-full w-16 h-16 flex items-center justify-center text-black border-4 ring-2 ring-white/20",
                        isPlaying ? "bg-red-500 border-red-900 hover:bg-red-600" : "bg-emerald-500 border-emerald-900 hover:bg-emerald-600"
                    )}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                     {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </Button>
               </div>
            </div>

            {/* Scrolling Text Area */}
            <div className="flex-1 relative overflow-hidden bg-black cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
                {/* Visual Guide Line */}
                <div className="absolute top-1/2 left-0 right-0 h-20 -translate-y-1/2 border-y-2 border-red-500/30 bg-red-500/5 pointer-events-none z-20 flex items-center px-4">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>

                <div 
                   ref={scrollerRef} 
                   className={cn(
                       "h-full overflow-y-scroll scrollbar-hide px-[20%] py-[40vh]",
                       isMirrored && "scale-x-[-1]"
                   )}
                >
                   <p 
                     className="font-bold leading-relaxed text-center" 
                     style={{ fontSize: `${fontSize}px` }}
                   >
                     {generatedScript.split('\n').map((line, i) => (
                       <span key={i} className={cn(
                           "block mb-8",
                           line.trim().startsWith('[') || line.trim().startsWith('(') ? "text-yellow-400 text-[0.6em] opacity-80" : "text-white"
                       )}>
                         {line}
                       </span>
                     ))}
                   </p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
