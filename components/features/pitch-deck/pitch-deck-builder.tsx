"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { PitchDeckSlide, savePitchDeck } from "@/lib/db";
import { StoryWizard } from "./story-wizard";
import { DeckPreview } from "./deck-preview";
import { SlideVisualizer } from "./slide-templates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Play, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Download, 
  Clock, 
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generatePitchDeckAction } from "@/lib/ai-actions";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type MobileEditPanel = "slides" | "editor" | "preview";

export function PitchDeckBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const router = useRouter();
  const isMobile = useIsMobile();

  // View/Edit states
  const [mode, setMode] = useState<'wizard' | 'preview' | 'edit'>('preview');
  const [mobileEditPanel, setMobileEditPanel] = useState<MobileEditPanel>("editor");
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Presenter View State
  const [isPlaying, setIsPlaying] = useState(false);
  const [presenterSlideIndex, setPresenterSlideIndex] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  const initialized = useRef(false);

  useEffect(() => {
    if (!activeProject || initialized.current) return;

    if (activeProject.pitchDeck && activeProject.pitchDeck.length > 0) {
      setSlides(activeProject.pitchDeck);
      setMode('preview');
    } else {
      // Auto-sync & generate using project context
      handleGenerateAI();
    }
    initialized.current = true;
  }, [activeProject]);

  // Presenter Timer
  useEffect(() => {
    if (isPlaying) {
      setPlayTime(0);
      timerRef.current = setInterval(() => {
        setPlayTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Keyboard navigation in Presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowLeft") {
        setPresenterSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === "ArrowRight") {
        setPresenterSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === "Space") {
        e.preventDefault();
        setPresenterSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === "Escape") {
        setIsPlaying(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, slides]);

  // Handlers
  const handleWizardComplete = async (answers: any) => {
    await handleGenerateAI(answers);
    setMode('preview');
  };

  const handleGenerateAI = async (wizardAnswers?: any) => {
    if (!activeProject) return;
    setIsGenerating(true);
    toast.info("هوش مصنوعی کارنکس در حال تدوین سناریوی اختصاصی پیچ‌دک شماست...");
    
    try {
      const res = await generatePitchDeckAction({
        idea: activeProject.description || activeProject.projectName || "ایده استارتاپی",
        wizardAnswers,
        projectContext: activeProject
      });

      if (res.success && res.data?.slides) {
        const newSlides = res.data.slides;
        setSlides(newSlides);
        await handleSave(newSlides);
        toast.success("پیچ‌دک هوشمند و اختصاصی شما آماده شد! 🚀");
      } else {
        toast.error(res.error || "خطا در تولید محتوای پیچ‌دک");
        if (slides.length === 0) {
          const fallback: PitchDeckSlide[] = [
            { id: '1', type: 'title', title: activeProject?.projectName || 'عنوان پروژه', bullets: ['ارائه استارتاپ ما'], isHidden: false, metadata: {} }
          ];
          setSlides(fallback);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در برقراری ارتباط با موتور هوش مصنوعی");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (updatedSlides: PitchDeckSlide[] = slides) => {
    if (!user || !activeProject?.id) return;
    setLoading(true);
    try {
      await savePitchDeck(user.id!, updatedSlides, activeProject.id);
      updateActiveProject({ pitchDeck: updatedSlides });
      toast.success("تغییرات با موفقیت ذخیره شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ذخیره پیچ‌دک");
    } finally {
      setLoading(false);
    }
  };

  // Local Direct Sync with Project Database
  const handleLocalSync = () => {
    if (!activeProject) return;
    
    const syncedSlides = slides.map(slide => {
      const updated = { ...slide };
      if (!updated.metadata) updated.metadata = {};
      
      switch (slide.type) {
        case "competition":
          if (activeProject.competitors && activeProject.competitors.length > 0) {
            updated.metadata.competitors = activeProject.competitors.map(c => ({
              name: c.name || '',
              strength: c.strength || 'مزیت رقابتی',
              weakness: c.weakness || 'شکاف بازار'
            }));
          }
          break;
        case "roadmap":
          if (activeProject.roadmap && activeProject.roadmap.length > 0) {
            updated.metadata.phases = activeProject.roadmap.map((r, i) => ({
              phase: r.phase || `فاز ${i + 1}`,
              title: r.theme || 'دستاورد فاز',
              date: r.weekNumber ? `هفته ${r.weekNumber}` : 'زمان‌بندی'
            }));
          }
          break;
        case "business_model":
          if (activeProject.leanCanvas?.revenueStream) {
            const streams = typeof activeProject.leanCanvas.revenueStream === 'string' 
              ? activeProject.leanCanvas.revenueStream.split('\n').filter(Boolean)
              : [];
            updated.metadata.models = streams.map(s => ({
              title: s.replace(/^•\s*/, '').slice(0, 30),
              desc: s.replace(/^•\s*/, '')
            }));
          }
          break;
        case "market":
          if (activeProject.leanCanvas?.customerSegments) {
            updated.metadata.samDesc = activeProject.leanCanvas.customerSegments.slice(0, 100);
          }
          break;
      }
      return updated;
    });

    setSlides(syncedSlides);
    toast.success("اطلاعات اسلایدها با بوم ناب و رقبا همگام‌سازی شد 🔄");
  };

  const handleEditSlide = (index: number) => {
    if (index === -1) {
      const newSlide: PitchDeckSlide = {
        id: `slide-${Date.now()}`,
        type: 'generic',
        title: 'اسلاید جدید',
        bullets: ['نکته اول'],
        isHidden: false,
        metadata: {}
      };
      const newSlides = [...slides, newSlide];
      setSlides(newSlides);
      setCurrentSlideIndex(newSlides.length - 1);
      setMode('edit');
    } else {
      setCurrentSlideIndex(index);
      setMode('edit');
    }
  };

  const updateCurrentSlide = (field: keyof PitchDeckSlide, value: any) => {
    const updated = slides.map((s, i) => i === currentSlideIndex ? { ...s, [field]: value } : s);
    setSlides(updated);
  };

  const updateMetadataField = (key: string, value: any) => {
    const slide = slides[currentSlideIndex];
    const updatedMeta = { ...(slide.metadata || {}), [key]: value };
    updateCurrentSlide('metadata', updatedMeta);
  };

  // Reordering & slide operations
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    
    const reordered = [...slides];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;
    
    setSlides(reordered);
    if (currentSlideIndex === index) {
      setCurrentSlideIndex(newIndex);
    } else if (currentSlideIndex === newIndex) {
      setCurrentSlideIndex(index);
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    const newSlide: PitchDeckSlide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      title: `${slideToDuplicate.title} (کپی)`
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
    toast.success("اسلاید تکثیر شد");
  };

  const toggleHideSlide = (index: number) => {
    const reordered = slides.map((s, i) => i === index ? { ...s, isHidden: !s.isHidden } : s);
    setSlides(reordered);
    toast.info(reordered[index].isHidden ? "اسلاید در ارائه پنهان شد" : "اسلاید فعال شد");
  };

  const handleDeleteSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
    }
    toast.success("اسلاید حذف شد");
  };

  // PDF Export Trigger
  const handleExportPDF = () => {
    toast.info("در حال آماده‌سازی نسخه PDF...");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // PPTX Export 
  const handleExportPPTX = async () => {
    setDownloading(true);
    try {
      const pptxgen = (await import("pptxgenjs")).default;
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';
      pres.rtlMode = true;
      
      pres.author = 'Karnex AI';
      pres.company = activeProject?.projectName || 'Startup';
      pres.subject = 'Pitch Deck';
      pres.title = activeProject?.projectName || 'Pitch Deck';

      pres.defineSlideMaster({
        title: "DARK_THEME",
        background: { color: "020617" }, 
        slideNumber: { x: '95%', y: '92%', fontSize: 10, color: '64748B' }
      });

      slides.forEach((slide) => {
        if (slide.isHidden) return;
        const pptxSlide = pres.addSlide({ masterName: "DARK_THEME" });
        
        pptxSlide.addText(slide.title, {
          x: 0.5, y: 0.5, w: '90%', h: 1,
          fontSize: 28,
          bold: true,
          color: '22D3EE', 
          rtlMode: true,
          align: 'right',
          fontFace: 'Arial'
        });

        let textContent = slide.bullets.map(b => ({ 
          text: b, 
          options: { 
            rtlMode: true, 
            fontSize: 16, 
            color: 'CBD5E1', 
            breakLine: true,
            bullet: true
          } 
        }));

        pptxSlide.addText(textContent, {
          x: 0.5, y: 1.8, w: '90%', h: 4,
          align: 'right',
          fontFace: 'Arial'
        });
      });

      await pres.writeFile({ fileName: `${activeProject?.projectName || 'PitchDeck'}.pptx` });
      toast.success("دانلود فایل پاورپوینت انجام شد 🚀");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ساخت فایل پاورپوینت");
    } finally {
      setDownloading(false);
    }
  };

  const addMetadataArrayItem = (arrayName: string, defaultValue: any) => {
    const slide = slides[currentSlideIndex];
    const list = [...(slide.metadata?.[arrayName] || [])];
    list.push(defaultValue);
    updateMetadataField(arrayName, list);
  };

  // --- Views ---

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 bg-slate-950 text-white rounded-3xl p-8 border border-white/5">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/25 blur-3xl rounded-full animate-pulse" />
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-3 relative z-10 max-w-md">
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-violet-300">در حال تولید پیچ‌دک هوشمند...</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            دستیار کارنکس در حال بررسی بوم مدل کسب‌وکار، رقبا و نقشه راه شماست تا ارائه‌ای حرفه‌ای و متناسب با شرایط بازار ایران بنویسد.
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'wizard') {
    return (
      <StoryWizard 
        onComplete={handleWizardComplete} 
        onCancel={() => {
          if (slides.length > 0) setMode('preview');
          else router.push('/dashboard/overview');
        }} 
        isGenerating={isGenerating}
      />
    );
  }

  if (mode === 'preview') {
    return (
      <div className="bg-slate-950 p-1 md:p-4 rounded-3xl min-h-[80vh] border border-white/5">
        <DeckPreview 
          slides={slides} 
          onEditSlide={handleEditSlide} 
          onDeleteSlide={handleDeleteSlide}
          onRegenerate={() => setMode('wizard')} 
          onDownload={handleExportPPTX}
        />
      </div>
    );
  }

  // --- Play Presentation Mode Modal ---
  if (isPlaying) {
    const playSlide = slides[presenterSlideIndex];
    return (
      <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col justify-between p-6 overflow-hidden">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setIsPlaying(false)} className="text-slate-400 hover:text-white">
              <X size={20} className="me-2" /> خروج
            </Button>
            <span className="text-sm font-black text-cyan-400">{activeProject?.projectName} - حالت ارائه</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-sm">
            <span className="flex items-center gap-1.5"><Clock size={16} /> {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}</span>
            <span>اسلاید {presenterSlideIndex + 1} از {slides.length}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl aspect-[1.777] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <SlideVisualizer slide={playSlide} index={presenterSlideIndex} total={slides.length} projectName={activeProject?.projectName || ''} />
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/10 pt-4 px-8">
          <Button 
            variant="outline" 
            className="rounded-xl border-white/10 text-white hover:bg-slate-900"
            onClick={() => setPresenterSlideIndex(prev => Math.max(0, prev - 1))}
            disabled={presenterSlideIndex === 0}
          >
            قبلی
          </Button>
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setPresenterSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === presenterSlideIndex ? 'bg-cyan-400 scale-125' : 'bg-slate-700'}`} 
              />
            ))}
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-white/10 text-white hover:bg-slate-900"
            onClick={() => setPresenterSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
            disabled={presenterSlideIndex === slides.length - 1}
          >
            بعدی
          </Button>
        </div>
      </div>
    );
  }

  // --- REDESIGNED Tech Dark Split Workspace Edit Mode ---
  const currentSlide = slides[currentSlideIndex];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          html, body {
            background-color: #020617 !important;
            color: #ffffff !important;
            width: 297mm !important;
            height: 210mm !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}} />

      <div className="print:hidden h-full flex flex-col gap-4 bg-slate-950 text-slate-100 p-4 md:p-6 rounded-3xl border border-white/5 overflow-hidden animate-in fade-in duration-300">
        
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setMode('preview')} className="text-slate-400 hover:text-white">
              <ArrowLeft size={16} className="me-2" /> بازگشت به نمای کلی
            </Button>
            <span className="text-slate-600 hidden md:block">|</span>
            <h2 className="text-base font-bold text-slate-300 hidden md:block">کارگاه ویرایش پیچ‌دک حرفه‌ای</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLocalSync} className="h-10 border-white/5 bg-slate-900 text-slate-300 hover:text-white rounded-xl">
              <RefreshCw size={14} className="me-2" /> همگام‌سازی از بوم و رقبا
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPlaying(true)} className="h-10 border-white/5 bg-slate-900 text-cyan-400 hover:text-cyan-300 rounded-xl">
              <Play size={14} className="me-2 fill-cyan-400/20" /> اجرای ارائه (پرزنت)
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-10 border-white/5 bg-slate-900 text-slate-300 hover:text-white rounded-xl">
              <Download size={14} className="me-2" /> خروجی PDF
            </Button>
            <Button variant="default" size="sm" onClick={() => handleSave()} disabled={loading} className="h-10 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/10 rounded-xl px-5">
              <Save size={14} className="me-2" /> ذخیره تغییرات
            </Button>
          </div>
        </div>

        {/* Mobile panel switcher */}
        {isMobile && mode === 'edit' && (
          <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/5 overflow-x-auto mobile-scroll-x">
            {([
              { id: "slides" as MobileEditPanel, label: "اسلایدها" },
              { id: "editor" as MobileEditPanel, label: "ویرایش" },
              { id: "preview" as MobileEditPanel, label: "پیش‌نمایش" },
            ]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileEditPanel(tab.id)}
                className={cn(
                  "flex-1 min-w-[80px] py-2 px-3 rounded-lg text-xs font-bold transition-all mobile-touch-target",
                  mobileEditPanel === tab.id ? "bg-cyan-500 text-slate-950" : "text-slate-400"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Split Layout Workspace */}
        <div className="flex-1 grid lg:grid-cols-12 gap-5 overflow-hidden min-h-[500px]">
          
          {/* Left: Thumbnail Strip (3 cols) */}
          <div className={cn(
            "lg:col-span-3 bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex flex-col gap-3 overflow-y-auto max-h-[600px] lg:max-h-none",
            isMobile && mobileEditPanel !== "slides" && "hidden",
            isMobile && mobileEditPanel === "slides" && "col-span-full max-h-none"
          )}>
            <div className="flex justify-between items-center px-1 mb-1">
              <span className="text-xs font-bold text-slate-400">ساختار و ترتیب اسلایدها</span>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-cyan-400 hover:text-cyan-300" onClick={() => handleEditSlide(-1)}>
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {slides.map((s, idx) => (
                <div 
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                    idx === currentSlideIndex 
                      ? 'bg-slate-900 border-cyan-500/40 shadow-md shadow-cyan-500/5' 
                      : 'bg-slate-950/40 border-white/5 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}</span>
                    <div className="flex flex-col text-right overflow-hidden">
                      <span className="text-xs font-bold text-slate-200 truncate">{s.title || 'بدون عنوان'}</span>
                      <span className="text-[9px] text-cyan-400 font-semibold">{s.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 'up'); }} className="p-1 text-slate-500 hover:text-white rounded" disabled={idx === 0}>
                      <ChevronUp size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 'down'); }} className="p-1 text-slate-500 hover:text-white rounded" disabled={idx === slides.length - 1}>
                      <ChevronDown size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateSlide(idx); }} className="p-1 text-slate-500 hover:text-cyan-400 rounded">
                      <Copy size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleHideSlide(idx); }} className="p-1 text-slate-500 hover:text-white rounded">
                      {s.isHidden ? <EyeOff size={12} className="text-rose-500" /> : <Eye size={12} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }} className="p-1 text-slate-500 hover:text-rose-500 rounded">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center/Right: Live 16:9 Canvas Stage (9 cols) */}
          <div className={cn(
            "lg:col-span-9 flex flex-col gap-4 overflow-hidden",
            isMobile && mobileEditPanel === "slides" && "hidden"
          )}>
            
            <div className={cn(
              "flex-1 bg-slate-900/20 border border-white/5 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden group min-h-[300px]",
              isMobile && mobileEditPanel !== "preview" && "hidden"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 pointer-events-none" />
              <div className="w-full max-w-3xl aspect-[1.777] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative transform transition-transform group-hover:scale-[1.005] duration-500">
                <SlideVisualizer slide={currentSlide} index={currentSlideIndex} total={slides.length} projectName={activeProject?.projectName || ''} />
              </div>
            </div>

            <div className={cn(
              "grid md:grid-cols-2 gap-4",
              isMobile && mobileEditPanel !== "editor" && "hidden"
            )}>
              
              {/* Content panel */}
              <Card className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl flex flex-col space-y-4">
                <div>
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 block">عنوان اسلاید</label>
                  <Input 
                    value={currentSlide?.title || ''}
                    onChange={e => updateCurrentSlide('title', e.target.value)}
                    className="text-lg font-bold bg-slate-950 border-white/10 text-white rounded-xl focus:border-cyan-500/40"
                    placeholder="عنوان را بنویسید..."
                    dir="auto"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">نکات کلیدی (لیست گلوله‌ای)</label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {currentSlide?.bullets.map((bullet, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs text-slate-500 font-mono w-4">{i + 1}</span>
                        <Input 
                          value={bullet}
                          onChange={e => {
                            const newBullets = [...currentSlide.bullets];
                            newBullets[i] = e.target.value;
                            updateCurrentSlide('bullets', newBullets);
                          }}
                          className="flex-1 bg-slate-950 border-white/10 text-slate-200 rounded-xl focus:border-cyan-500/40 h-9 text-xs"
                          dir="auto"
                        />
                        <button 
                          onClick={() => {
                            const newBullets = currentSlide.bullets.filter((_, idx) => idx !== i);
                            updateCurrentSlide('bullets', newBullets);
                          }} 
                          className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => updateCurrentSlide('bullets', [...currentSlide.bullets, ""])} 
                    className="w-full h-9 border border-dashed border-white/10 rounded-xl hover:bg-white/5 text-xs text-slate-400 hover:text-cyan-400 mt-2"
                  >
                    <Plus size={12} className="me-1" /> افزودن نکته جدید
                  </Button>
                </div>
              </Card>

              {/* Metadata panel */}
              <Card className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl flex flex-col space-y-4">
                <div>
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 block">قالب ساختاری اسلاید</label>
                  <select 
                    value={currentSlide?.type || 'generic'}
                    onChange={e => updateCurrentSlide('type', e.target.value)}
                    className="w-full h-10 px-3 bg-slate-950 border border-white/10 text-white text-xs rounded-xl focus:border-cyan-500/40"
                  >
                    <option value="title">عنوان (Title)</option>
                    <option value="problem">بیان مشکل (Problem)</option>
                    <option value="solution">راهکار پیشنهادی (Solution)</option>
                    <option value="market">اندازه بازار (TAM/SAM/SOM)</option>
                    <option value="business_model">مدل کسب‌وکار (Revenue Model)</option>
                    <option value="competition">موقعیت رقبا (Competition)</option>
                    <option value="roadmap">نقشه راه (Roadmap/Timeline)</option>
                    <option value="team">معرفی تیم (Team)</option>
                    <option value="ask">درخواست سرمایه (Ask)</option>
                    <option value="generic">اسلاید ساده (Generic Bullet)</option>
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3 pr-1 text-xs">
                  {currentSlide?.type === 'market' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">تنظیمات اندازه بازار:</span>
                      <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="TAM" value={currentSlide.metadata?.tam || ''} onChange={e => updateMetadataField('tam', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg" />
                        <Input placeholder="SAM" value={currentSlide.metadata?.sam || ''} onChange={e => updateMetadataField('sam', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg" />
                        <Input placeholder="SOM" value={currentSlide.metadata?.som || ''} onChange={e => updateMetadataField('som', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg" />
                      </div>
                      <Input placeholder="توضیح بازار TAM" value={currentSlide.metadata?.tamDesc || ''} onChange={e => updateMetadataField('tamDesc', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg mt-1" />
                      <Input placeholder="توضیح بازار SAM" value={currentSlide.metadata?.samDesc || ''} onChange={e => updateMetadataField('samDesc', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg mt-1" />
                      <Input placeholder="توضیح بازار SOM" value={currentSlide.metadata?.somDesc || ''} onChange={e => updateMetadataField('somDesc', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg mt-1" />
                    </div>
                  )}

                  {currentSlide?.type === 'ask' && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">تنظیمات تامین سرمایه:</span>
                      <Input placeholder="مبلغ درخواستی" value={currentSlide.metadata?.amount || ''} onChange={e => updateMetadataField('amount', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg" />
                      <Input placeholder="مدت بقای مالی (Runway)" value={currentSlide.metadata?.runway || ''} onChange={e => updateMetadataField('runway', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg" />
                      <Input placeholder="محل مصرف بودجه" value={currentSlide.metadata?.use || ''} onChange={e => updateMetadataField('use', e.target.value)} className="bg-slate-950 border-white/10 text-xs h-8 rounded-lg" />
                    </div>
                  )}

                  {currentSlide?.type === 'business_model' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">جریان‌های درآمدی:</span>
                        <Button variant="ghost" size="icon" className="w-5 h-5 text-cyan-400" onClick={() => addMetadataArrayItem('models', { title: 'مدل جدید', desc: 'نحوه کسب درآمد' })}>
                          <Plus size={12} />
                        </Button>
                      </div>
                      {(currentSlide.metadata?.models || []).map((m: any, idx: number) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <Input placeholder="عنوان" value={m.title || ''} onChange={e => {
                            const models = [...(currentSlide.metadata?.models || [])];
                            models[idx] = { ...models[idx], title: e.target.value };
                            updateMetadataField('models', models);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <Input placeholder="توضیح" value={m.desc || ''} onChange={e => {
                            const models = [...(currentSlide.metadata?.models || [])];
                            models[idx] = { ...models[idx], desc: e.target.value };
                            updateMetadataField('models', models);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-[2]" />
                          <button onClick={() => {
                            const models = (currentSlide.metadata?.models || []).filter((_: any, i: number) => i !== idx);
                            updateMetadataField('models', models);
                          }} className="text-slate-500 hover:text-rose-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSlide?.type === 'competition' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">رقبای کلیدی:</span>
                        <Button variant="ghost" size="icon" className="w-5 h-5 text-cyan-400" onClick={() => addMetadataArrayItem('competitors', { name: 'نام رقیب', strength: 'مزیت', weakness: 'شکاف' })}>
                          <Plus size={12} />
                        </Button>
                      </div>
                      {(currentSlide.metadata?.competitors || []).map((c: any, idx: number) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <Input placeholder="رقیب" value={c.name || ''} onChange={e => {
                            const comps = [...(currentSlide.metadata?.competitors || [])];
                            comps[idx] = { ...comps[idx], name: e.target.value };
                            updateMetadataField('competitors', comps);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <Input placeholder="قوت" value={c.strength || ''} onChange={e => {
                            const comps = [...(currentSlide.metadata?.competitors || [])];
                            comps[idx] = { ...comps[idx], strength: e.target.value };
                            updateMetadataField('competitors', comps);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <Input placeholder="ضعف" value={c.weakness || ''} onChange={e => {
                            const comps = [...(currentSlide.metadata?.competitors || [])];
                            comps[idx] = { ...comps[idx], weakness: e.target.value };
                            updateMetadataField('competitors', comps);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <button onClick={() => {
                            const comps = (currentSlide.metadata?.competitors || []).filter((_: any, i: number) => i !== idx);
                            updateMetadataField('competitors', comps);
                          }} className="text-slate-500 hover:text-rose-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSlide?.type === 'roadmap' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">نقشه راه زمانی:</span>
                        <Button variant="ghost" size="icon" className="w-5 h-5 text-cyan-400" onClick={() => addMetadataArrayItem('phases', { phase: 'فاز جدید', title: 'عنوان دستاورد', date: 'زمان' })}>
                          <Plus size={12} />
                        </Button>
                      </div>
                      {(currentSlide.metadata?.phases || []).map((p: any, idx: number) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <Input placeholder="فاز" value={p.phase || ''} onChange={e => {
                            const phases = [...(currentSlide.metadata?.phases || [])];
                            phases[idx] = { ...phases[idx], phase: e.target.value };
                            updateMetadataField('phases', phases);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <Input placeholder="هدف" value={p.title || ''} onChange={e => {
                            const phases = [...(currentSlide.metadata?.phases || [])];
                            phases[idx] = { ...phases[idx], title: e.target.value };
                            updateMetadataField('phases', phases);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-[2]" />
                          <Input placeholder="تاریخ" value={p.date || ''} onChange={e => {
                            const phases = [...(currentSlide.metadata?.phases || [])];
                            phases[idx] = { ...phases[idx], date: e.target.value };
                            updateMetadataField('phases', phases);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <button onClick={() => {
                            const phases = (currentSlide.metadata?.phases || []).filter((_: any, i: number) => i !== idx);
                            updateMetadataField('phases', phases);
                          }} className="text-slate-500 hover:text-rose-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentSlide?.type === 'team' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">معرفی اعضا:</span>
                        <Button variant="ghost" size="icon" className="w-5 h-5 text-cyan-400" onClick={() => addMetadataArrayItem('members', { name: 'عضو جدید', role: 'نقش او' })}>
                          <Plus size={12} />
                        </Button>
                      </div>
                      {(currentSlide.metadata?.members || []).map((m: any, idx: number) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <Input placeholder="نام فرد" value={m.name || ''} onChange={e => {
                            const members = [...(currentSlide.metadata?.members || [])];
                            members[idx] = { ...members[idx], name: e.target.value };
                            updateMetadataField('members', members);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <Input placeholder="تخصص/سمت" value={m.role || ''} onChange={e => {
                            const members = [...(currentSlide.metadata?.members || [])];
                            members[idx] = { ...members[idx], role: e.target.value };
                            updateMetadataField('members', members);
                          }} className="bg-slate-950 border-white/10 text-[10px] h-7 rounded-lg flex-1" />
                          <button onClick={() => {
                            const members = (currentSlide.metadata?.members || []).filter((_: any, i: number) => i !== idx);
                            updateMetadataField('members', members);
                          }} className="text-slate-500 hover:text-rose-500">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {['title', 'problem', 'solution', 'generic'].includes(currentSlide?.type || '') && (
                    <div className="text-slate-500 text-center py-6">
                      این نوع اسلاید پارامترهای پیشرفته ساختاری ندارد. از ویرایشگر سمت راست برای تغییر نکات متنی استفاده کنید.
                    </div>
                  )}
                </div>
              </Card>

            </div>
          </div>

        </div>

      </div>

      {/* Special Print Render Container */}
      <div className="hidden print:block bg-slate-950 text-white w-full">
        {slides.map((s, idx) => (
          <div 
            key={s.id} 
            className="w-[297mm] h-[210mm] relative overflow-hidden bg-slate-950 flex flex-col justify-between"
            style={{ 
              pageBreakAfter: 'always', 
              pageBreakInside: 'avoid',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}
          >
            <SlideVisualizer slide={s} index={idx} total={slides.length} projectName={activeProject?.projectName || ''} isExport={true} />
          </div>
        ))}
      </div>
    </>
  );
}
