"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { PitchDeckSlide, savePitchDeck } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Presentation, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  LayoutTemplate
} from "lucide-react";
// Duplicate removed

// Default Slides Structure
const DEFAULT_SLIDES: PitchDeckSlide[] = [
  { id: '1', type: 'title', title: 'عنوان استارتاپ', bullets: ['تگ‌لاین جذاب', 'لوگو', 'نام ارائه دهنده'] },
  { id: '2', type: 'problem', title: 'مشکل موجود', bullets: ['درد مشتری چیست؟', 'چرا راهکارهای فعلی کار نمی‌کنند؟', 'بزرگی مشکل چقدر است؟'] },
  { id: '3', type: 'solution', title: 'راهکار ما', bullets: ['محصول ما چیست؟', 'چگونه مشکل را حل می‌کند؟', 'مزیت رقابتی ما'] },
  { id: '4', type: 'market', title: 'اندازه بازار', bullets: ['TAM, SAM, SOM', 'روند بازار', 'مشتریان هدف'] },
  { id: '5', type: 'business_model', title: 'مدل درآمدی', bullets: ['چگونه پول در می‌آوریم؟', 'قیمت‌گذاری', 'حاشیه سود'] },
  { id: '6', type: 'team', title: 'تیم ما', bullets: ['موسسین', 'مشاوران', 'چرا ما بهترین تیم هستیم؟'] },
  { id: '7', type: 'ask', title: 'درخواست سرمایه', bullets: ['چه مقدار سرمایه نیاز داریم؟', 'برای چه کاری؟', 'چه سهمی میدهیم؟'] },
];

export function PitchDeckBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Load Info or Set Defaults
  useEffect(() => {
    if (activeProject?.pitchDeck && activeProject.pitchDeck.length > 0) {
      setSlides(activeProject.pitchDeck);
    } else {
      setSlides(DEFAULT_SLIDES);
    }
  }, [activeProject]);

  const handleSave = async (updatedSlides: PitchDeckSlide[] = slides) => {
    if (!user || !activeProject?.id) return;
    setLoading(true);
    try {
      await savePitchDeck(user.uid, updatedSlides, activeProject.id);
      updateActiveProject({ pitchDeck: updatedSlides });
      toast.success("پیچ دک ذخیره شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ذخیره سازی");
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = slides[currentSlideIndex];

  const updateCurrentSlide = (field: keyof PitchDeckSlide, value: any) => {
    const updated = slides.map((s, i) => i === currentSlideIndex ? { ...s, [field]: value } : s);
    setSlides(updated);
  };

  const updateBullet = (idx: number, value: string) => {
    const newBullets = [...(currentSlide?.bullets || [])];
    newBullets[idx] = value;
    updateCurrentSlide('bullets', newBullets);
  };

  const addBullet = () => {
    const newBullets = [...(currentSlide?.bullets || []), ""];
    updateCurrentSlide('bullets', newBullets);
  };

  const removeBullet = (idx: number) => {
    const newBullets = (currentSlide?.bullets || []).filter((_, i) => i !== idx);
    updateCurrentSlide('bullets', newBullets);
  };

  const syncWithPlan = () => {
    if (!activeProject) return;
    
    // Helper to extract text from Canvas content (string or cards)
    const getText = (content: any): string => {
        if (!content) return "";
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return content.map((c: any) => c.content).join('. ');
        }
        return "";
    };

    // Simple logic to pull data from plan into current slide if relevat
    let syncedBullets = [...(currentSlide?.bullets || [])];
    let syncedTitle = currentSlide?.title;

    if (currentSlide?.type === 'title') {
        syncedTitle = activeProject.projectName;
        syncedBullets = [activeProject.tagline];
    } else if (currentSlide?.type === 'problem') {
        syncedBullets = [getText(activeProject.leanCanvas.problem)];
    } else if (currentSlide?.type === 'solution') {
        syncedBullets = [getText(activeProject.leanCanvas.solution), getText(activeProject.leanCanvas.uniqueValue)];
    } else if (currentSlide?.type === 'business_model') {
        syncedBullets = [getText(activeProject.leanCanvas.revenueStream)];
    }

    const updated = slides.map((s, i) => i === currentSlideIndex ? { ...s, title: syncedTitle, bullets: syncedBullets } : s);
    setSlides(updated);
    toast.success("اطلاعات از بیزینس پلن بارگذاری شد");
  };

  // ... inside PitchDeckBuilder
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const slidesElements = printRef.current.children;
      const totalSlides = slidesElements.length;

      for (let i = 0; i < totalSlides; i++) {
        const slideEl = slidesElements[i] as HTMLElement;
        
        // Capture slide
        const canvas = await html2canvas(slideEl, {
            scale: 2,
            useCORS: true, 
            backgroundColor: "#ffffff"
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Add new page if not last slide
        if (i < totalSlides - 1) {
            pdf.addPage();
        }
      }

      pdf.save(`${activeProject?.projectName || 'PitchDeck'}.pdf`);
      toast.success("دانلود PDF کامل شد");

    } catch (err) {
      console.error(err);
      toast.error("خطا در ساخت PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (!currentSlide) return null;

  return (
    <>
    {/* Hidden Print Container */}
    <div style={{ position: 'fixed', top: 0, left: -99999, width: '297mm', zIndex: -1 }} ref={printRef}>
        {slides.map((slide, i) => (
             !slide.isHidden && (
                <div key={i} className="w-[297mm] h-[210mm] bg-white text-slate-900 flex flex-col p-16 relative overflow-hidden border border-black mb-10">
                     {/* Decoration */}
                    <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 rounded-br-full" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/10 rounded-tl-full" />
                    
                    <h1 className="text-6xl font-black mb-12 relative z-10">{slide.title}</h1>
                    
                    <div className="space-y-6 relative z-10 pl-4">
                        {slide.bullets.map((bullet, b) => (
                            <div key={b} className="flex items-start gap-4 text-3xl leading-relaxed">
                                <div className="w-4 h-4 rounded-full bg-primary mt-4 shrink-0" />
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex justify-between items-center text-slate-400 text-xl border-t border-slate-200 pt-6">
                         <span>{activeProject?.projectName}</span>
                         <span>{i + 1} / {slides.length}</span>
                    </div>
                </div>
             )
        ))}
    </div>

    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT: Outline */}
      <Card className="col-span-1 border-r border-border overflow-y-auto">
         {/* ... existing header ... */}
         <div className="p-4 border-b border-border bg-muted/20 font-bold flex items-center gap-2 sticky top-0 backdrop-blur-md justify-between">
            <div className="flex items-center gap-2">
                <LayoutTemplate size={18} />
                فهرست
            </div>
            <Button variant="ghost" size="icon" onClick={handleExportPDF} title="دانلود کل دک" disabled={downloading}>
                <Save size={18} className={downloading ? "animate-spin" : ""} />
            </Button>
         </div>
         {/* ... existing list ... */}
         <div className="p-2 space-y-1">
            {slides.map((slide, i) => (
                <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-full text-right p-3 rounded-lg text-sm transition-all flex items-center justify-between group ${
                        i === currentSlideIndex 
                        ? 'bg-primary/10 text-primary font-bold active-slide-indicator' 
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                >
                    <span className="truncate">
                        {i + 1}. {slide.title}
                    </span>
                    {slide.isHidden && <EyeOff size={14} className="opacity-50" />}
                </button>
            ))}
         </div>
      </Card>

      {/* CENTER: Editor & Preview */}
      <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        
        {/* Editor Toolbar */}
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">{currentSlide.title}</h2>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={downloading}>
                    {downloading ? 'در حال ساخت PDF...' : 'دانلود PDF کامل'}
                </Button>
                <Button variant="outline" size="sm" onClick={syncWithPlan} title="بروزرسانی از پلن">
                    <RefreshCw size={16} className="mr-1" />
                    سینک
                </Button>
                <Button variant="default" size="sm" onClick={() => handleSave()} disabled={loading}>
                    <Save size={16} className="mr-1" />
                    {loading ? '...' : 'ذخیره'}
                </Button>
            </div>
        </div>

        {/* Slide Visual (Preview/Editor Hybrid) */}
        {/* ... existing slide visual ... */}
        <div className="aspect-video bg-white text-slate-900 rounded-xl shadow-2xl border-4 border-slate-900 overflow-hidden relative flex flex-col p-12 transition-all hover:scale-[1.01]">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-tl-full" />
            
            {/* Title Input */}
            <input 
                value={currentSlide.title}
                onChange={e => updateCurrentSlide('title', e.target.value)}
                className="text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-300 w-full mb-8 z-10"
                placeholder="عنوان اسلاید"
            />

            {/* Bullets Input */}
            <div className="flex-1 space-y-4 z-10 overflow-y-auto">
                {currentSlide.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                        <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0" />
                        <Textarea 
                            value={bullet}
                            onChange={e => updateBullet(i, e.target.value)}
                            className="bg-transparent border-none resize-none text-xl text-slate-700 min-h-[3rem] focus:bg-slate-50 rounded-lg"
                            placeholder="نکته کلیدی..."
                            rows={1}
                        />
                        <button 
                            onClick={() => removeBullet(i)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <button 
                    onClick={addBullet}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-sm font-medium px-4"
                >
                    <Plus size={16} />
                    افزودن مورد
                </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm">
                <span>{activeProject?.projectName || 'نام استارتاپ'}</span>
                <span>Cofidential - {currentSlideIndex + 1} / {slides.length}</span>
            </div>
        </div>

        {/* ... existing navigation ... */}
        <div className="flex justify-between items-center mt-4">
             <Button 
                variant="outline" 
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
             >
                <ChevronRight size={16} className="ml-2" />
                اسلاید قبل
             </Button>

             <span className="text-muted-foreground text-sm">
                ویرایشگر اسلاید {currentSlideIndex + 1}
             </span>

             <Button 
                variant="outline" 
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
             >
                اسلاید بعد
                <ChevronLeft size={16} className="mr-2" />
             </Button>
        </div>

      </div>
    </div>
    </>
  );
}
