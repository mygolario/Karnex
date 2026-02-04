"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud, CanvasCard, CanvasSectionContent, LeanCanvas } from "@/lib/db";
import {
  Lightbulb, Gem, Banknote, Users, Activity,
  Package, Handshake, PiggyBank, LayoutGrid, Sparkles, Loader2, 
  Plus, Download, Search, Eye, ArrowRight, Heart, Megaphone,
  AlertTriangle, Target, AlertCircle, Star, Share2
} from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
import { AnalyzerButton } from "@/components/dashboard/analyzer-button";
import { BMCBlock } from "@/components/dashboard/canvas/bmc-block";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ID generator
const generateId = () => `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// --- Block Definitions ---

const BMC_BLOCKS = {
  keyPartners: {
    title: "شرکای کلیدی",
    subtitle: "شبکه تأمین‌کنندگان و شرکای بیرون سازمان",
    icon: Handshake,
    bgColor: "from-cyan-500/20 to-cyan-600/10",
    iconBg: "bg-cyan-500",
    borderColor: "border-cyan-500/30",
    description: "چه کسانی به شما در انجام فعالیت‌ها کمک می‌کنند؟ (تأمین‌کنندگان، شرکا، مشاوران)"
  },
  keyActivities: {
    title: "فعالیت‌های کلیدی",
    subtitle: "مهم‌ترین اقدامات برای عملکرد مدل کسب‌وکار",
    icon: Activity,
    bgColor: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-500/30",
    description: "چه کارهایی باید انجام دهید تا ارزش پیشنهادی خود را خلق و ارائه کنید؟"
  },
  keyResources: {
    title: "منابع کلیدی",
    subtitle: "دارایی‌های حیاتی برای خلق ارزش",
    icon: Package,
    bgColor: "from-indigo-500/20 to-indigo-600/10",
    iconBg: "bg-indigo-500",
    borderColor: "border-indigo-500/30",
    description: "به چه منابعی (فیزیکی، مالی، انسانی، معنوی) برای اجرای مدل کسب‌وکار نیاز دارید؟"
  },
  uniqueValue: {
    title: "ارزش پیشنهادی",
    subtitle: "چه مشکلی را حل می‌کنید؟",
    icon: Gem,
    bgColor: "from-pink-500/20 to-pink-600/10",
    iconBg: "bg-pink-500",
    borderColor: "border-pink-500/30",
    description: "چه ارزشی به مشتری ارائه می‌دهید؟ چرا باید شما را انتخاب کنند؟"
  },
  customerRelations: {
    title: "روابط مشتری",
    subtitle: "نحوه جذب و حفظ مشتری",
    icon: Heart,
    bgColor: "from-rose-500/20 to-rose-600/10",
    iconBg: "bg-rose-500",
    borderColor: "border-rose-500/30",
    description: "چگونه با مشتریان خود ارتباط برقرار می‌کنید و آن‌ها را حفظ می‌کنید؟"
  },
  channels: {
    title: "کانال‌ها",
    subtitle: "چطور به مشتری می‌رسید؟",
    icon: Megaphone,
    bgColor: "from-orange-500/20 to-orange-600/10",
    iconBg: "bg-orange-500",
    borderColor: "border-orange-500/30",
    description: "از چه طریقی محصولات یا خدمات خود را به دست مشتری می‌رسانید؟"
  },
  customerSegments: {
    title: "بخش‌های مشتری",
    subtitle: "مخاطبان هدف شما",
    icon: Users,
    bgColor: "from-purple-500/20 to-purple-600/10",
    iconBg: "bg-purple-500",
    borderColor: "border-purple-500/30",
    description: "مشتریان شما چه کسانی هستند؟ برای چه کسانی ارزش خلق می‌کنید؟"
  },
  costStructure: {
    title: "ساختار هزینه",
    subtitle: "هزینه‌های اصلی چیست؟",
    icon: PiggyBank,
    bgColor: "from-red-500/20 to-red-600/10",
    iconBg: "bg-red-500",
    borderColor: "border-red-500/30",
    description: "مهم‌ترین هزینه‌های کسب‌وکار شما چیست؟ (ثابت، متغیر)"
  },
  revenueStream: {
    title: "جریان درآمد",
    subtitle: "روش‌های درآمدزایی",
    icon: Banknote,
    bgColor: "from-emerald-500/20 to-emerald-600/10",
    iconBg: "bg-emerald-500",
    borderColor: "border-emerald-500/30",
    description: "مشتریان برای چه چیزی پول می‌دهند و چگونه؟ (فروش، اشتراک، تبلیغات)"
  }
};

const BRAND_CANVAS_BLOCKS = {
  identity: {
    title: "هویت و ارزش‌ها (Identity)",
    subtitle: "شما کی هستید؟ (ارزش‌ها، شخصیت، داستان)",
    icon: Gem,
    bgColor: "from-indigo-500/20 to-indigo-600/10",
    iconBg: "bg-indigo-500",
    borderColor: "border-indigo-500/30"
  },
  promise: {
    title: "وعده برند (Brand Promise)",
    subtitle: "چه قولی به مخاطب می‌دهید؟ (USP)",
    icon: Star,
    bgColor: "from-amber-500/20 to-amber-600/10",
    iconBg: "bg-amber-500",
    borderColor: "border-amber-500/30"
  },
  audience: {
    title: "مخاطب هدف (Tribe)",
    subtitle: "برای چه کسانی محتوا می‌سازید؟",
    icon: Users,
    bgColor: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-500/30"
  },
  contentStrategy: {
    title: "استراتژی محتوا",
    subtitle: "چه موضوعاتی؟ (Content Pillars)",
    icon: LayoutGrid,
    bgColor: "from-pink-500/20 to-pink-600/10",
    iconBg: "bg-pink-500",
    borderColor: "border-pink-500/30"
  },
  channels: {
    title: "کانال‌های انتشار",
    subtitle: "کجا حضور دارید؟ (IG, YT, X)",
    icon: Share2,
    bgColor: "from-violet-500/20 to-violet-600/10",
    iconBg: "bg-violet-500",
    borderColor: "border-violet-500/30"
  },
  monetization: {
    title: "مدل درآمدی",
    subtitle: "چگونه درآمد کسب می‌کنید؟",
    icon: Banknote,
    bgColor: "from-emerald-500/20 to-emerald-600/10",
    iconBg: "bg-emerald-500",
    borderColor: "border-emerald-500/30"
  },
  resources: {
    title: "منابع و ابزارها",
    subtitle: "تجهیزات، تیم و مهارت‌های کلیدی",
    icon: Package,
    bgColor: "from-cyan-500/20 to-cyan-600/10",
    iconBg: "bg-cyan-500",
    borderColor: "border-cyan-500/30"
  },
  collaborators: {
    title: "شرکا و کامیونیتی",
    subtitle: "چه کسانی به شما کمک می‌کنند؟",
    icon: Handshake,
    bgColor: "from-rose-500/20 to-rose-600/10",
    iconBg: "bg-rose-500",
    borderColor: "border-rose-500/30"
  },
  investment: {
    title: "سرمایه‌گذاری",
    subtitle: "هزینه زمان، پول و انرژی",
    icon: PiggyBank,
    bgColor: "from-red-500/20 to-red-600/10",
    iconBg: "bg-red-500",
    borderColor: "border-red-500/30"
  }
};

const SWOT_BLOCKS = {
  strengths: {
    title: "نقاط قوت (Strengths)",
    subtitle: "مزیت‌های داخلی کسب‌وکار شما",
    icon: Sparkles,
    bgColor: "from-emerald-500/20 to-emerald-600/10",
    iconBg: "bg-emerald-500",
    borderColor: "border-emerald-500/30"
  },
  weaknesses: {
    title: "نقاط ضعف (Weaknesses)",
    subtitle: "چالش‌های داخلی که باید رفع شوند",
    icon: AlertCircle,
    bgColor: "from-red-500/20 to-red-600/10",
    iconBg: "bg-red-500",
    borderColor: "border-red-500/30"
  },
  opportunities: {
    title: "فرصت‌ها (Opportunities)",
    subtitle: "پتانسیل‌های بیرونی برای رشد",
    icon: Lightbulb,
    bgColor: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500",
    borderColor: "border-blue-500/30"
  },
  threats: {
    title: "تهدیدها (Threats)",
    subtitle: "ریسک‌های بیرونی که باید مراقب باشید",
    icon: AlertTriangle,
    bgColor: "from-orange-500/20 to-orange-600/10",
    iconBg: "bg-orange-500",
    borderColor: "border-orange-500/30"
  }
};

type CanvasState = Record<string, CanvasCard[]>;

const sectionColors: Record<string, CanvasCard['color']> = {
  keyPartners: 'cyan', keyActivities: 'blue', keyResources: 'purple',
  uniqueValue: 'pink', customerRelations: 'yellow', channels: 'orange',
  customerSegments: 'purple', revenueStream: 'green', costStructure: 'pink',
  // Brand Canvas
  identity: 'purple', audience: 'blue',
  contentStrategy: 'pink', monetization: 'green',
  resources: 'cyan', collaborators: 'pink', investment: 'red', promise: 'orange',
  // SWOT
  strengths: 'green', weaknesses: 'red',
  opportunities: 'blue', threats: 'orange'
};

export default function CanvasPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  const [canvasState, setCanvasState] = useState<CanvasState>({});

  // AI & Analysis State
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [showCompetitor, setShowCompetitor] = useState(false);
  const [competitorCanvas, setCompetitorCanvas] = useState<Record<string, string[]>>({});
  const [isGeneratingCompetitor, setIsGeneratingCompetitor] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<{section: string, issue: string, suggestion: string}[]>([]);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);

  // Initialize state based on project type
  useEffect(() => {
    if (!plan) return;

    let initialState: CanvasState = {};

    if (plan.projectType === 'creator') {
      // Initialize Brand Canvas
      const brandCanvas = plan.brandCanvas || {
        identity: [], promise: [], audience: [], contentStrategy: [],
        channels: [], monetization: [], resources: [], collaborators: [], investment: []
      };

      Object.entries(BRAND_CANVAS_BLOCKS).forEach(([key]) => {
        const content = (brandCanvas as any)[key];
        initialState[key] = Array.isArray(content) ? content :
                           (typeof content === 'string' && content ? [{ id: generateId(), content, color: sectionColors[key] || 'blue' }] : []);
      });
    } else {
      // Default: BMC (Startup & Traditional)
      const leanCanvas = plan.leanCanvas || {
        keyPartners: [], keyActivities: [], keyResources: [], uniqueValue: [],
        customerRelations: [], channels: [], customerSegments: [],
        costStructure: [], revenueStream: []
      };

      Object.entries(BMC_BLOCKS).forEach(([key]) => {
         const content = (leanCanvas as any)[key];
         initialState[key] = Array.isArray(content) ? content :
                            (typeof content === 'string' && content ? [{ id: generateId(), content, color: sectionColors[key] || 'blue' }] : []);
      });
    }
    setCanvasState(initialState);
  }, [plan?.id, plan?.projectType]);

    const handleSave = async (newState: CanvasState) => {
    if (!plan || !updateActiveProject) return;

    if (plan.projectType === 'creator') {
       // Save Brand Canvas
       const brandCanvasUpdate: any = {};
       Object.keys(BRAND_CANVAS_BLOCKS).forEach(key => {
         brandCanvasUpdate[key] = newState[key] || [];
       });
       await updateActiveProject({ brandCanvas: brandCanvasUpdate });
    } else {
       // Save BMC (for both Startup and Traditional)
       const newLeanCanvas: any = { ...plan.leanCanvas };
       Object.keys(BMC_BLOCKS).forEach(key => {
         newLeanCanvas[key] = newState[key] || [];
       });
       if (user) await savePlanToCloud(user.uid, newLeanCanvas, true, plan.id!);
       // Also update local context if needed
       await updateActiveProject({ leanCanvas: newLeanCanvas });
    }
  };

  const handleAddCard = (sectionKey: string) => {
    const newCard: CanvasCard = {
      id: generateId(),
      content: "",
      color: sectionColors[sectionKey] || 'blue',
    };
    const newState = {
      ...canvasState,
      [sectionKey]: [...(canvasState[sectionKey] || []), newCard]
    };
    setCanvasState(newState);
    handleSave(newState);
  };

  const handleUpdateCard = (sectionKey: string, cardId: string, content: string) => {
    const newState = {
      ...canvasState,
      [sectionKey]: canvasState[sectionKey]?.map(card =>
        card.id === cardId ? { ...card, content } : card
      ) || []
    };
    setCanvasState(newState);
    handleSave(newState);
  };

  const handleDeleteCard = (sectionKey: string, cardId: string) => {
    const newState = {
      ...canvasState,
      [sectionKey]: canvasState[sectionKey]?.filter(card => card.id !== cardId) || []
    };
    setCanvasState(newState);
    handleSave(newState);
  };

  // --- Features ---

  const autoFillCanvas = async () => {
    if (!plan) return;
    setIsAutoFilling(true);

    try {
      // Use specialized action for BMC (Startup & Traditional) which guarantees structure
      if (plan.projectType !== 'creator') {
         const response = await fetch("/api/ai-generate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
             action: 'generate-full-canvas',
             businessIdea: plan.overview || plan.description,
             projectName: plan.projectName
          }),
        });

        const data = await response.json();
        
        if (data.success && data.canvas) {
          const newState = { ...canvasState };
          const parsed = data.canvas; // dedicated endpoint returns parsed object directly
          
          Object.keys(BMC_BLOCKS).forEach(key => {
            // Ensure we handle both string (legacy) and array (new) formats from AI
            let content = parsed[key];
            if (typeof content === 'string') {
               // Split by bullets if it's a single string
               content = content.split('\n').filter((l: string) => l.trim().length > 0).map((l: string) => l.replace(/^[•-]\s*/, ''));
            }
            
            const items = Array.isArray(content) ? content : [content];
            
            // Only update if we have items
            if (items.length > 0) {
                 newState[key] = items.filter(Boolean).map((text: string) => ({
                    id: generateId(), content: text, color: sectionColors[key] || 'blue'
                 }));
            }
          });

          setCanvasState(newState);
          handleSave(newState);
        }
      } else {
         // Fallback for Creator (Brand Canvas) - keep existing generic prompt for now
         const prompt = `Generate personal brand canvas content for creator "${plan.projectName}" (${plan.overview}). 
         Return JSON object matching these keys: identity, promise, audience, contentStrategy, channels, monetization, resources, collaborators, investment.`;
         
         const response = await fetch("/api/ai-generate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON." }),
          });

          const data = await response.json();
          if (data.success && data.content) {
            const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
            const newState = { ...canvasState } as CanvasState;

            Object.keys(BRAND_CANVAS_BLOCKS).forEach(key => {
              const items = Array.isArray(parsed[key]) ? parsed[key] : [parsed[key]];
              newState[key] = items.filter(Boolean).map((text: string) => ({
                id: generateId(), content: text, color: sectionColors[key] || 'purple'
              }));
            });

            setCanvasState(newState);
            handleSave(newState);
          }
      }
    } catch (err) { console.error(err); }
    finally { setIsAutoFilling(false); }
  };

  // Generate Competitor Canvas
  const generateCompetitorCanvas = async () => {
    if (!plan) return;
    setIsGeneratingCompetitor(true);

    try {
      const prompt = `Analyze competitors for this business:

Project: ${plan.projectName}
Description: ${plan.overview}

Return ONLY valid JSON (in Persian):
{
  "competitorName": "نام رقیب اصلی",
  "keyPartners": ["شریک ۱"],
  "keyActivities": ["فعالیت ۱"],
  "uniqueValue": ["ارزش پیشنهادی"],
  "customerSegments": ["مخاطب ۱"],
  "channels": ["کانال ۱"],
  "revenueStream": ["درآمد ۱"]
}`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON." }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        setCompetitorCanvas(parsed);
        setShowCompetitor(true);
      }
    } catch (err) { console.error(err); }
    finally { setIsGeneratingCompetitor(false); }
  };

  // Gap Analysis
  const analyzeGaps = async () => {
    if (!plan || Object.keys(canvasState).length === 0) return;
    setIsAnalyzingGaps(true);

    try {
      const currentCanvas = Object.keys(canvasState).reduce((acc, key) => {
        acc[key] = canvasState[key]?.map(c => c.content).join(", ") || "خالی";
        return acc;
      }, {} as Record<string, string>);

      const prompt = `Analyze this Business Model Canvas and identify gaps:

Canvas: ${JSON.stringify(currentCanvas)}
Project: ${plan.projectName}

Return ONLY valid JSON array (in Persian):
[{"section": "keyPartners", "issue": "مشکل", "suggestion": "پیشنهاد"}]
Max 3 items.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON array." }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed)) setGapAnalysis(parsed);
      }
    } catch (err) { console.error(err); }
    finally { setIsAnalyzingGaps(false); }
  };

  const exportAsPng = async () => {
    const element = document.getElementById('bmc-canvas');
    if (!element) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f0f0f' });
      const link = document.createElement('a');
      link.download = `${plan?.projectName || 'canvas'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error('PNG export failed:', err); }
  };

  // Determine active blocks based on project type
  // User requested Standard BMC for everyone (except keeping Brand Canvas for creators optionally, 
  // but let's make BMC standard for Traditional too).
  const activeBlocks: Record<string, any> =
    plan?.projectType === 'creator' ? BRAND_CANVAS_BLOCKS :
    BMC_BLOCKS; // Default to BMC for Traditional & Startup

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Count filled sections
  const totalSections = Object.keys(activeBlocks).length;
  const filledSections = Object.keys(activeBlocks).filter(k => (canvasState[k] || []).length > 0).length;
  const completionPercent = Math.round((filledSections / totalSections) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              {plan.projectType === 'creator' ? 'بوم برند شخصی' :
               'بوم مدل کسب‌وکار'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {plan.projectType === 'creator' ? 'استراتژی برند و مخاطب' :
               'طراحی و اعتبارسنجی مدل کسب‌وکار (استاندارد ۹ بلوک)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-3 py-1.5">
            {completionPercent}% تکمیل ({filledSections}/{totalSections})
          </Badge>
          <Button onClick={autoFillCanvas} disabled={isAutoFilling} variant="shimmer" size="sm">
            {isAutoFilling ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            پر کردن خودکار
          </Button>
          {(plan.projectType === 'startup' || plan.projectType === 'traditional') && (
            <>
              <Button onClick={generateCompetitorCanvas} disabled={isGeneratingCompetitor} variant="outline" size="sm">
                {isGeneratingCompetitor ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                بوم رقیب
              </Button>
              <Button onClick={analyzeGaps} disabled={isAnalyzingGaps} variant="outline" size="sm">
                {isAnalyzingGaps ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                تحلیل شکاف
              </Button>
            </>
          )}
          <Button onClick={exportAsPng} variant="outline" size="sm">
            <Download size={16} /> PNG
          </Button>
          <PdfExportButton plan={plan} />
        </div>
      </div>

      {/* Gap Analysis Alert */}
      <AnimatePresence>
        {gapAnalysis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-foreground flex items-center gap-2">
                <Eye size={18} className="text-amber-500" /> تحلیل شکاف
              </span>
              <Button variant="ghost" size="sm" onClick={() => setGapAnalysis([])}>بستن</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {gapAnalysis.map((gap, i) => (
                <div key={i} className="bg-card rounded-xl p-3 text-sm">
                  <Badge variant="secondary" className="mb-2">{BMC_BLOCKS[gap.section as keyof typeof BMC_BLOCKS]?.title}</Badge>
                  <p className="text-muted-foreground mb-1">{gap.issue}</p>
                  <p className="text-primary">{gap.suggestion}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitor Canvas */}
      <AnimatePresence>
        {showCompetitor && Object.keys(competitorCanvas).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-foreground flex items-center gap-2">
                <Search size={18} className="text-purple-500" /> بوم رقیب: {competitorCanvas.competitorName}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowCompetitor(false)}>بستن</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(competitorCanvas).filter(([key]) => key !== 'competitorName').map(([key, values]) => (
                <div key={key} className="bg-card rounded-xl p-3 text-sm">
                  <span className="font-semibold text-foreground">{BMC_BLOCKS[key as keyof typeof BMC_BLOCKS]?.title || key}</span>
                  <ul className="text-foreground mt-1">
                    {Array.isArray(values) ? values.slice(0, 2).map((v, i) => <li key={i}>• {v}</li>) : <li>• {values}</li>}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <div id="bmc-canvas" className="bg-card border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
        
        {/* Creator Canvas (3-Col Grid) */}
        {plan.projectType === 'creator' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
            {Object.entries(activeBlocks).map(([key, config]: [string, any]) => (
              <BMCBlock
                key={key}
                field={key}
                config={config}
                cards={canvasState[key] || []}
                onAdd={() => handleAddCard(key)}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteCard}
              />
            ))}
           </div>
        )}

        {/* Standard BMC Layout (CSS Grid Areas) */}
        {(plan.projectType !== 'creator') && (
          <div 
            dir="ltr" // Force LTR for layout structure (Partners Left, Segments Right)
            className="grid gap-3 md:gap-4 min-h-[800px]"
            style={{
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr) 0.5fr',
              gridTemplateAreas: `
                "partners activities value relations segments"
                "partners resources  value channels  segments"
                "cost     cost       cost  revenue   revenue"
              `
            }}
          >
             <BMCBlock field="keyPartners" config={BMC_BLOCKS.keyPartners} cards={canvasState.keyPartners || []}
               onAdd={() => handleAddCard('keyPartners')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'partners' }} />
             
             <BMCBlock field="keyActivities" config={BMC_BLOCKS.keyActivities} cards={canvasState.keyActivities || []}
               onAdd={() => handleAddCard('keyActivities')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'activities' }} />
             
             <BMCBlock field="keyResources" config={BMC_BLOCKS.keyResources} cards={canvasState.keyResources || []}
               onAdd={() => handleAddCard('keyResources')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'resources' }} />
             
             <BMCBlock field="uniqueValue" config={BMC_BLOCKS.uniqueValue} cards={canvasState.uniqueValue || []}
               onAdd={() => handleAddCard('uniqueValue')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'value' }} />
             
             <BMCBlock field="customerRelations" config={BMC_BLOCKS.customerRelations} cards={canvasState.customerRelations || []}
               onAdd={() => handleAddCard('customerRelations')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'relations' }} />
             
             <BMCBlock field="channels" config={BMC_BLOCKS.channels} cards={canvasState.channels || []}
               onAdd={() => handleAddCard('channels')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'channels' }} />
             
             <BMCBlock field="customerSegments" config={BMC_BLOCKS.customerSegments} cards={canvasState.customerSegments || []}
               onAdd={() => handleAddCard('customerSegments')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'segments' }} />
             
             <BMCBlock field="costStructure" config={BMC_BLOCKS.costStructure} cards={canvasState.costStructure || []}
               onAdd={() => handleAddCard('costStructure')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'cost' }} />
             
             <BMCBlock field="revenueStream" config={BMC_BLOCKS.revenueStream} cards={canvasState.revenueStream || []}
               onAdd={() => handleAddCard('revenueStream')} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} 
               style={{ gridArea: 'revenue' }} />
          </div>
        )}
      </div>
    </div>
  );
}


