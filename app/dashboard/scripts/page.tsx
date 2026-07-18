"use client";

import { PageTourHelp } from "@/components/tour/page-tour-help";
import { useState, useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Video, Mic, FileText, Copy, Check, Save, Sparkles, Loader2, 
  History, MonitorPlay, Maximize2, X, Plus, Search, Folder, 
  Layers, Volume2, ArrowLeft, Edit3, Wand2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import refineTextPrompt from "@/lib/prompts/refine-text.json";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";

// Rework components
import { AudioVideoScript } from "./components/audio-video-script";
import { TeleprompterRecorder } from "./components/teleprompter-recorder";
import { ScriptVault } from "./components/script-vault";

// Server Actions
import { 
  createScriptAction, 
  updateScriptAction, 
  getProjectScriptsAction, 
  deleteScriptAction,
  getUserPreferredToneAction
} from "@/lib/script-actions";

type Script = {
  id: string;
  title: string;
  content: string;
  template: string;
  duration: string;
  audience?: string | null;
  status: string;
  folder: string | null;
  scenes?: any;
  updatedAt: Date | string;
};

type Scene = {
  id: string;
  visual: string;
  audio: string;
};

function parseTextToScenes(text: string): Scene[] {
  if (!text) return [{ id: "1", visual: "نمای عمومی", audio: "" }];
  
  const regex = /(\[[^\]]+\]|\([^)]+\))/g;
  const parts = text.split(regex);
  
  const parsedScenes: Scene[] = [];
  let currentVisual = "";
  
  parts.forEach((part, index) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("(") && trimmed.endsWith(")"))) {
      currentVisual = trimmed.slice(1, -1);
    } else {
      parsedScenes.push({
        id: `${index}-${Date.now()}`,
        visual: currentVisual || "نمای عمومی",
        audio: trimmed
      });
      currentVisual = "";
    }
  });

  if (parsedScenes.length === 0) {
    return [{ id: "1", visual: "نمای عمومی", audio: text }];
  }
  
  return parsedScenes;
}

function parseScenesToText(scenes: Scene[]): string {
  return scenes.map(s => `[${s.visual || 'نمای عمومی'}]\n${s.audio}`).join('\n\n');
}

export default function ScriptsPage() {
  const { activeProject: plan } = useProject();
  
  // Navigation & View States
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [scriptsList, setScriptsList] = useState<Script[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(false);
  const [editorMode, setEditorMode] = useState<"text" | "av">("text");
  
  // Script Input States
  const [inputs, setInputs] = useState({
    title: "",
    audience: "",
    duration: "60s",
    template: "viral-hook",
    folder: "General"
  });
  
  // Editor States
  const [editorText, setEditorText] = useState("");
  const [avScenes, setAvScenes] = useState<Scene[]>([]);
  const [speakingPace, setSpeakingPace] = useState<"slow" | "medium" | "fast">("medium");
  const [userPreferredTone, setUserPreferredTone] = useState("balanced");
  
  // Action & Modal States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load scripts list
  const fetchScripts = async () => {
    if (!plan?.id) return;
    setIsLoadingScripts(true);
    const res = await getProjectScriptsAction(plan.id);
    if (res.success && res.scripts) {
      // Cast scenes json correctly
      const formatted = res.scripts.map((s: any) => ({
        ...s,
        updatedAt: s.updatedAt.toString()
      })) as Script[];
      setScriptsList(formatted);
    } else {
      toast.error("خطا در بارگذاری لیست سناریوها");
    }
    setIsLoadingScripts(false);
  };

  useEffect(() => {
    fetchScripts();
    // Fetch brand voice tone
    getUserPreferredToneAction().then(res => {
      if (res.success && res.preferredTone) {
        setUserPreferredTone(res.preferredTone);
      }
    });
  }, [plan?.id]);

  // Sync editor mode with content format changes
  const handleEditorModeChange = (mode: "text" | "av") => {
    if (mode === "av" && editorMode === "text") {
      // Convert standard text to A/V scenes
      const scenes = parseTextToScenes(editorText);
      setAvScenes(scenes);
    } else if (mode === "text" && editorMode === "av") {
      // Convert A/V scenes back to standard text
      const text = parseScenesToText(avScenes);
      setEditorText(text);
    }
    setEditorMode(mode);
  };

  // Keyboard shortcut Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveScript();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeScript, inputs, editorText, avScenes, editorMode]);

  // Load Script
  const handleSelectScript = (script: Script) => {
    setActiveScript(script);
    setInputs({
      title: script.title,
      audience: script.audience || "",
      duration: script.duration,
      template: script.template,
      folder: script.folder || "General"
    });
    setEditorText(script.content);
    
    // Parse scenes
    if (script.scenes) {
      try {
        setAvScenes(script.scenes as Scene[]);
        setEditorMode("av");
      } catch (e) {
        setAvScenes(parseTextToScenes(script.content));
        setEditorMode("text");
      }
    } else {
      setAvScenes(parseTextToScenes(script.content));
      setEditorMode("text");
    }
    toast.info(`سناریو «${script.title}» بارگذاری شد`);
  };

  // Create New Empty Script
  const handleCreateNew = () => {
    setActiveScript(null);
    setInputs({
      title: "سناریو جدید",
      audience: "",
      duration: "60s",
      template: "viral-hook",
      folder: "General"
    });
    setEditorText("");
    setAvScenes([{ id: "1", visual: "نمای عمومی", audio: "" }]);
    setEditorMode("text");
  };

  // Save Script to Database
  const handleSaveScript = async () => {
    if (!plan?.id) return;
    if (!inputs.title.trim()) {
      toast.error("لطفا عنوان سناریو را وارد کنید");
      return;
    }

    setIsSaving(true);
    
    // Get latest script text depending on mode
    const content = editorMode === "text" ? editorText : parseScenesToText(avScenes);
    const scenesData = editorMode === "av" ? avScenes : parseTextToScenes(editorText);

    if (activeScript) {
      // Update
      const res = await updateScriptAction(activeScript.id, {
        title: inputs.title,
        content,
        template: inputs.template,
        duration: inputs.duration,
        audience: inputs.audience,
        scenes: scenesData,
        folder: inputs.folder
      });

      if (res.success && res.script) {
        toast.success("تغییرات با موفقیت ذخیره شد");
        fetchScripts();
        setActiveScript(res.script as unknown as Script);
      } else {
        toast.error(res.error || "خطا در ذخیره تغییرات");
      }
    } else {
      // Create
      const res = await createScriptAction({
        projectId: plan.id,
        title: inputs.title,
        content,
        template: inputs.template,
        duration: inputs.duration,
        audience: inputs.audience,
        scenes: scenesData,
        folder: inputs.folder
      });

      if (res.success && res.script) {
        toast.success("سناریو جدید با موفقیت ایجاد و ذخیره شد");
        fetchScripts();
        setActiveScript(res.script as unknown as Script);
      } else {
        toast.error(res.error || "خطا در ذخیره سناریو");
      }
    }
    setIsSaving(false);
  };

  // Delete Script
  const handleDeleteScript = async (id: string) => {
    if (confirm("آیا از حذف این سناریو مطمئن هستید؟")) {
      const res = await deleteScriptAction(id);
      if (res.success) {
        toast.success("سناریو با موفقیت حذف شد");
        if (activeScript?.id === id) {
          handleCreateNew();
        }
        fetchScripts();
      } else {
        toast.error(res.error || "خطا در حذف سناریو");
      }
    }
  };

  // Generate Script via AI (using client-side custom prompt matching personalization)
  const handleGenerateAI = async () => {
    if (!inputs.title) {
      toast.error("لطفا عنوان یا موضوع ویدیو را وارد کنید");
      return;
    }
    if (!plan?.id) return;

    setIsGenerating(true);
    try {
      const toneMapping: Record<string, string> = {
        formal: "رسمی و کتابی",
        casual: "دوستانه، صمیمی و محاوره‌ای",
        balanced: "نیمه‌رسمی و محاوره‌ای محترمانه",
      };

      const preferredTone = toneMapping[userPreferredTone] || "محاوره‌ای و دوستانه";

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "script-writer",
          title: inputs.title,
          audience: inputs.audience || "عمومی",
          duration: inputs.duration,
          tone: preferredTone,
          template: inputs.template,
          activeProject: plan,
        }),
      });

      if (response.status === 429) {
        setShowLimitModal(true);
        return;
      }

      const data = await response.json();
      if (data.success && data.script) {
        const script = data.script as { content?: string; executionGuide?: string; reasoning?: string };
        const text = script.content
          ? `${script.content}${script.executionGuide ? `\n\n---\nراهنمای اجرا:\n${script.executionGuide}` : ""}`
          : String(data.content || "");
        setEditorText(text);
        setAvScenes(parseTextToScenes(text));
        toast.success("سناریو با موفقیت توسط هوش مصنوعی تولید شد! 🪄");
      } else if (data.success && data.content) {
        setEditorText(data.content);
        setAvScenes(parseTextToScenes(data.content));
        toast.success("سناریو با موفقیت توسط هوش مصنوعی تولید شد! 🪄");
      } else {
        toast.error("خطا در پاسخ هوش مصنوعی");
      }
    } catch (error) {
      toast.error("خطا در تولید سناریو");
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine specific section with AI shortcut
  const handleRefineText = async (instruction: string) => {
    if (!editorText) {
      toast.error("ابتدا سناریو را بنویسید یا تولید کنید");
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `
        متن زیر را بر اساس این دستورالعمل بازنویسی کن: "${instruction}"
        متن اصلی:
        ${editorText}
        
        فقط متن بازنویسی شده را به زبان فارسی خروجی بده.
      `;
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemPrompt: refineTextPrompt.system,
          activeProject: plan
        })
      });
      if (response.status === 429) {
        setShowLimitModal(true);
        return;
      }
      const data = await response.json();
      if (data.success && data.content) {
        setEditorText(data.content);
        setAvScenes(parseTextToScenes(data.content));
        toast.success("متن بازنویسی شد!");
      }
    } catch (e) {
      toast.error("خطا در بازنویسی متن");
    } finally {
      setIsGenerating(false);
    }
  };

  // Word count & Speaking duration calculations
  const textForStats = editorMode === "text" ? editorText : parseScenesToText(avScenes);
  const wordCount = textForStats.trim().split(/\s+/).filter(Boolean).length;
  const wpm = speakingPace === "slow" ? 120 : speakingPace === "medium" ? 145 : 170;
  const estSeconds = Math.round((wordCount / wpm) * 60);
  const durationStr = estSeconds < 60 ? `${estSeconds} ثانیه` : `${Math.floor(estSeconds / 60)} دقیقه و ${estSeconds % 60} ثانیه`;

  // Protect route
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md border border-slate-200">
          <Video size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت اسکریپت (Director Mode)</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های Creator فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button className="bg-red-600 hover:bg-red-700 text-white">بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b pb-6" data-tour-id="scripts-header">
        <div className="flex items-center gap-3">
          <PageTourHelp tourId="scripts" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">استودیو اسکریپت ۲.۰ (Director Mode)</h1>
            <p className="text-muted-foreground text-sm">کارگاه پیشرفته تولید سناریو، دوقابله‌نویسی و تله‌پرامپتر هوشمند</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeScript && (
            <Badge variant="secondary" className="font-normal text-xs bg-slate-100 py-1.5 px-3">
              در حال ویرایش: {activeScript.title}
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex gap-1.5"
          >
            <History size={16} />
            {sidebarOpen ? "بستن مخزن" : "باز کردن مخزن"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Folders & Saved Scripts Sidebar (3 Cols) */}
        {sidebarOpen && (
          <div className="lg:col-span-3 bg-card border rounded-2xl p-4 shadow-sm h-[650px]">
            <ScriptVault 
              scripts={scriptsList}
              onSelect={handleSelectScript}
              onDelete={handleDeleteScript}
              activeScriptId={activeScript?.id}
              onCreateNew={handleCreateNew}
            />
          </div>
        )}

        {/* Center Column: Workspace (Editor & Options) (9/12 Cols depending on Sidebar) */}
        <div className={cn(
          "space-y-6",
          sidebarOpen ? "lg:col-span-9" : "lg:col-span-12"
        )}>
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Editor (8 Cols of Center Panel) */}
            <div className="xl:col-span-8 space-y-4">
              <Card className="flex flex-col border shadow-sm overflow-hidden h-[600px] relative bg-card">
                
                {/* Editor Header / Toolbars */}
                <div className="p-3 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                  {/* Mode Toggles */}
                  <div className="flex bg-muted p-0.5 rounded-lg border">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn("text-xs h-7 px-3", editorMode === "text" && "bg-card text-foreground font-bold shadow-sm")}
                      onClick={() => handleEditorModeChange("text")}
                    >
                      <FileText size={14} className="ml-1" />
                      متن خام
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn("text-xs h-7 px-3", editorMode === "av" && "bg-card text-foreground font-bold shadow-sm")}
                      onClick={() => handleEditorModeChange("av")}
                    >
                      <Layers size={14} className="ml-1" />
                      دوقاب کارگردانی
                    </Button>
                  </div>

                  {/* Calculations summary bar */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/40 py-1 px-3 rounded-md border border-slate-100">
                    <div className="flex items-center gap-1">
                      <Volume2 size={12} className="text-red-500" />
                      <span>سرعت خوانش:</span>
                      <select 
                        value={speakingPace} 
                        onChange={(e) => setSpeakingPace(e.target.value as any)}
                        className="bg-transparent border-0 font-bold focus:ring-0 cursor-pointer pr-1"
                      >
                        <option value="slow">شمرده</option>
                        <option value="medium">معمولی</option>
                        <option value="fast">سریع</option>
                      </select>
                    </div>
                    <span className="text-slate-200">|</span>
                    <div>کلمات: <strong className="text-foreground">{wordCount}</strong></div>
                    <span className="text-slate-200">|</span>
                    <div>زمان تقریبی: <strong className="text-red-600 font-mono">{durationStr}</strong></div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        const contentToCopy = editorMode === "text" ? editorText : parseScenesToText(avScenes);
                        navigator.clipboard.writeText(contentToCopy);
                        toast.success("کل سناریو در حافظه کپی شد");
                      }}
                      className="h-8 w-8 text-zinc-500"
                    >
                      <Copy size={15} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleSaveScript}
                      disabled={isSaving}
                      className="gap-1 h-8 text-xs font-bold border-red-200 hover:bg-red-50"
                    >
                      {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      ذخیره سناریو
                    </Button>
                    {editorText && (
                      <Button 
                        size="sm"
                        className="bg-zinc-950 text-white hover:bg-zinc-800 gap-1 h-8 text-xs font-bold"
                        onClick={() => setIsTeleprompterOpen(true)}
                      >
                        <MonitorPlay size={13} />
                        تله‌پرامپتر و ضبط
                      </Button>
                    )}
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 overflow-y-auto p-4">
                  {editorMode === "text" ? (
                    <div className="h-full flex flex-col">
                      <Textarea 
                        className="w-full flex-1 p-4 text-base leading-relaxed resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-sans"
                        value={editorText}
                        onChange={(e) => setEditorText(e.target.value)}
                        placeholder="در کادر سمت راست موضوع را بنویسید تا هوش مصنوعی سناریو را بنویسد، یا اینکه خودتان نوشتن را شروع کنید..."
                        dir="rtl"
                      />
                    </div>
                  ) : (
                    <AudioVideoScript 
                      scenes={avScenes} 
                      onChange={setAvScenes} 
                    />
                  )}
                </div>

                {/* Inline Refiner Floating Toolbar */}
                {editorText && editorMode === "text" && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 p-1.5 rounded-full shadow-2xl flex items-center gap-1 text-white z-10">
                    <span className="text-[10px] text-zinc-400 font-bold px-2.5">بهینه‌سازی سریع:</span>
                    <Button 
                      variant="ghost" 
                      className="h-7 text-xs rounded-full py-0 px-2.5 text-zinc-200 hover:bg-white/10 hover:text-white"
                      onClick={() => handleRefineText("قلاب اولیه ویدیو را جذاب‌تر و پرانرژی‌تر کن.")}
                      disabled={isGenerating}
                    >
                      قلاب جذاب‌تر
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-7 text-xs rounded-full py-0 px-2.5 text-zinc-200 hover:bg-white/10 hover:text-white"
                      onClick={() => handleRefineText("متن را محاوره‌ای‌تر و دوستانه‌تر کن.")}
                      disabled={isGenerating}
                    >
                      محاوره‌ای‌تر
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-7 text-xs rounded-full py-0 px-2.5 text-zinc-200 hover:bg-white/10 hover:text-white"
                      onClick={() => handleRefineText("متن سناریو را کوتاه‌تر و خلاصه‌تر کن تا ریتم ویدیو تندتر شود.")}
                      disabled={isGenerating}
                    >
                      خلاصه‌سازی
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Input Config & AI controls (4 Cols of Center Panel) */}
            <div className="xl:col-span-4 space-y-6">
              <Card className="p-5 border-l-4 border-l-red-500 bg-gradient-to-br from-card to-background shadow-sm space-y-5">
                <h3 className="font-bold flex items-center gap-2 text-md text-foreground">
                  <Wand2 className="text-red-500 w-5 h-5" />
                  تنظیمات سناریونویسی
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs font-bold mb-1.5 block">موضوع یا عنوان ویدیو</label>
                    <Input 
                      placeholder="مثال: ۵ راز پنهان برنامه نویسی..." 
                      className="bg-background/50 border-slate-200 focus-visible:ring-red-500"
                      value={inputs.title}
                      onChange={(e) => setInputs({...inputs, title: e.target.value})}
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-1.5 block">مخاطب هدف (اختیاری)</label>
                    <Input 
                      placeholder="مثال: طراحان، دانشجویان..." 
                      className="bg-background/50 border-slate-200 focus-visible:ring-red-500"
                      value={inputs.audience}
                      onChange={(e) => setInputs({...inputs, audience: e.target.value})}
                      dir="rtl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold mb-1.5 block">مدت زمان</label>
                      <Select value={inputs.duration} onValueChange={(val) => setInputs({...inputs, duration: val})}>
                        <SelectTrigger className="bg-background/50 border-slate-200 focus:ring-red-500">
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
                      <label className="text-xs font-bold mb-1.5 block">دسته‌بندی (پوشه)</label>
                      <Input 
                        placeholder="مانند: یوتیوب، رییلز" 
                        className="bg-background/50 border-slate-200 focus-visible:ring-red-500 h-10"
                        value={inputs.folder}
                        onChange={(e) => setInputs({...inputs, folder: e.target.value})}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-1.5 block">قالب و ساختار هوشمند</label>
                    <Select value={inputs.template} onValueChange={(val) => setInputs({...inputs, template: val})}>
                      <SelectTrigger className="bg-background/50 border-slate-200 focus:ring-red-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viral-hook">وایرال و سرگرم‌کننده</SelectItem>
                        <SelectItem value="educational">آموزشی و تفصیلی</SelectItem>
                        <SelectItem value="storytelling">داستان‌سرایی تعاملی</SelectItem>
                        <SelectItem value="sales">تبلیغاتی و فروش محصول</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border text-xs text-muted-foreground flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1 text-slate-700">
                      <Sparkles size={12} className="text-red-500" />
                      شخصی‌سازی لحن فعال:
                    </span>
                    <span>
                      لحن کلی بر اساس نمایه شما روی <strong>{userPreferredTone === 'formal' ? 'رسمی' : userPreferredTone === 'casual' ? 'صمیمی و دوستانه' : 'متعادل'}</strong> تنظیم شده است.
                    </span>
                  </div>

                  <Button 
                    className="w-full text-sm font-bold gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-6 shadow-md shadow-red-500/10"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    {editorText ? "بازنویسی کل سناریو" : "نوشتن سناریو با هوش مصنوعی"}
                  </Button>
                </div>
              </Card>

              {/* Tips Banner */}
              <Card className="p-5 border bg-zinc-900 text-zinc-300 space-y-2">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wide block">💡 راهنمای حرفه‌ای‌ها</span>
                <p className="text-xs leading-relaxed">
                  می‌توانید با انتخاب گزینه <strong>«دوقاب کارگردانی»</strong> در نوار بالای ویرایشگر، کات‌های ویدیویی و فیلم‌برداری را به صورت کاملاً مجزا از صحبت‌های خود برنامه‌ریزی کنید. این ساختار در زمان فیلم‌برداری کار را برایتان بسیار ساده‌تر می‌کند.
                </p>
              </Card>
            </div>
            
          </div>

        </div>

      </div>

      {/* Teleprompter Recorder Overlay */}
      <TeleprompterRecorder 
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        scriptTitle={inputs.title}
        scriptText={editorMode === "text" ? editorText : parseScenesToText(avScenes)}
      />

      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
