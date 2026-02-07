"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { PitchDeckSlide, savePitchDeck } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import {
  Presentation,
  ChevronRight,
  ChevronLeft,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Download,
  Wand2,
  LayoutTemplate,
  Palette,
  Maximize2,
  Minimize2
} from "lucide-react";

// Types
type ThemeType = 'modern' | 'minimal' | 'bold' | 'tech';

// Constants
const A4_WIDTH_PX = 1000;
const A4_HEIGHT_PX = 707; // 1000 / 1.414
const ASPECT_RATIO = A4_WIDTH_PX / A4_HEIGHT_PX;

// Default Slides Structure
const DEFAULT_SLIDES: PitchDeckSlide[] = [
  { id: '1', type: 'title', title: 'عنوان استارتاپ', bullets: ['تگ‌لاین جذاب', 'لوگو', 'نام ارائه دهنده'] },
  { id: '2', type: 'problem', title: 'مشکل موجود', bullets: ['درد مشتری چیست؟', 'چرا راهکارهای فعلی کار نمی‌کنند؟', 'بزرگی مشکل چقدر است؟'] },
  { id: '3', type: 'solution', title: 'راهکار ما', bullets: ['محصول ما چیست؟', 'چگونه مشکل را حل می‌کند؟', 'مزیت رقابتی ما'] },
];

export function PitchDeckBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [theme, setTheme] = useState<ThemeType>('modern');
  const [downloading, setDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Hidden ref for PDF generation
  const printRef = useRef<HTMLDivElement>(null);

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

  const handleAiWizard = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    try {
        const response = await fetch("/api/ai-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate-pitch-deck",
            projectName: activeProject.projectName,
            businessIdea: activeProject.overview || activeProject.description
          })
        });

        const data = await response.json();
        if (data.success && data.slides) {
            // Map AI slides to our format
            const newSlides = data.slides.map((s: any, i: number) => ({
                id: `ai-${Date.now()}-${i}`,
                type: s.type || 'generic',
                title: s.title,
                bullets: s.bullets || [],
                isHidden: false
            }));
            
            setSlides(newSlides);
            handleSave(newSlides);
            toast.success("پیچ دک با موفقیت تولید شد! 🎉");
        } else {
            throw new Error(data.error || "Failed to generate");
        }
    } catch (err) {
        console.error(err);
        toast.error("خطا در تولید هوشمند");
    } finally {
        setIsGenerating(false);
    }
  };

  const updateCurrentSlide = (field: keyof PitchDeckSlide, value: any) => {
    const updated = slides.map((s, i) => i === currentSlideIndex ? { ...s, [field]: value } : s);
    setSlides(updated);
  };

  const updateBullet = (idx: number, value: string) => {
    const newBullets = [...(slides[currentSlideIndex]?.bullets || [])];
    newBullets[idx] = value;
    updateCurrentSlide('bullets', newBullets);
  };

  const addBullet = () => {
    const newBullets = [...(slides[currentSlideIndex]?.bullets || []), ""];
    updateCurrentSlide('bullets', newBullets);
  };

  const removeBullet = (idx: number) => {
    const newBullets = (slides[currentSlideIndex]?.bullets || []).filter((_, i) => i !== idx);
    updateCurrentSlide('bullets', newBullets);
  };

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
        const canvas = await html2canvas(slideEl, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        if (i < totalSlides - 1) pdf.addPage();
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

  // --- Render Helpers ---
  const currentSlide = slides[currentSlideIndex];
  if (!currentSlide) return <div className="p-10 text-center">در حال بارگذاری...</div>;

  const ThemePreview = ({ themeName, active }: { themeName: ThemeType, active: boolean }) => (
    <button 
       onClick={() => setTheme(themeName)}
       className={`w-8 h-8 rounded-full border-2 transition-all ${
           active ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent hover:scale-105'
       }`}
       style={{ background: getThemeGradient(themeName) }}
       title={themeName}
    />
  );

  const getThemeGradient = (t: ThemeType) => {
      switch(t) {
          case 'modern': return 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
          case 'minimal': return 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'; 
          case 'bold': return 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)';
          case 'tech': return 'linear-gradient(135deg, #0f172a 0%, #334155 100%)';
          default: return '#eee';
      }
  };

  /**
   * The Master Slide Component.
   * Renders at exactly A4_WIDTH_PX x A4_HEIGHT_PX (1000x707).
   * It should be scaled via CSS transform by the parent.
   */
  const SlideComponent = ({ slide, index, isPrint = false }: { slide: PitchDeckSlide, index: number, isPrint?: boolean }) => {
      const isDark = theme === 'tech';
      
      // Fixed Reference Dimensions
      const style = {
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        fontSize: '24px' // Base Font Size for 1000px width
      };

      const bgClass = (() => {
          switch(theme) {
              case 'tech': return 'bg-slate-900 text-white';
              case 'bold': return 'bg-rose-500 text-white';
              case 'minimal': return 'bg-white text-slate-900 border border-slate-200';
              default: return 'bg-white text-slate-800'; // Modern
          }
      })();

      return (
        <div 
          style={style}
          className={`${bgClass} relative overflow-hidden flex flex-col p-[60px] shadow-sm shrink-0`}
        >
             {/* Decorations */}
             {theme === 'modern' && (
                 <>
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-bl-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-tr-full blur-3xl" />
                 </>
             )}
             {theme === 'tech' && (
                 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
             )}
              {theme === 'bold' && (
                 <div className="absolute bottom-0 right-0 w-full h-[30%] bg-black/10 -skew-y-3 origin-bottom-right" />
             )}

             {/* Content */}
             <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                     <h2 className="font-black opacity-40 text-[0.8em] tracking-[0.2em] uppercase">
                         {activeProject?.projectName || 'Startup'}
                     </h2>
                     <span className="font-mono opacity-40 text-[0.8em]">{index + 1} / {slides.length}</span>
                 </div>

                 <h1 className="text-[3.5em] font-extrabold mb-8 leading-tight">
                     {slide.title}
                 </h1>

                 <div className="space-y-6 flex-1">
                     {slide.bullets.map((b, i) => (
                         <div key={i} className="flex items-start gap-4 opacity-90">
                             <div className={`mt-[0.5em] w-[0.4em] h-[0.4em] rounded-full shrink-0 ${isDark || theme === 'bold' ? 'bg-white' : 'bg-primary' }`} />
                             <p className="text-[1.8em] font-medium leading-relaxed">{b}</p>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
      );
  };

  /**
   * Scaled Wrapper for Preview
   * Calculates the scale factor to fit the container width.
   */
  const ScaledPreview = ({ full = false }) => {
     const containerRef = useRef<HTMLDivElement>(null);
     const [scale, setScale] = useState(full ? 0.8 : 0.2); 

     useEffect(() => {
         const calculateScale = () => {
             if (full) {
                 // Calculate max available space (90% of window)
                 const maxWidth = window.innerWidth * 0.9;
                 const maxHeight = window.innerHeight * 0.9;
                 // Determine scale to fit BOTH width and height
                 const s = Math.min(maxWidth / A4_WIDTH_PX, maxHeight / A4_HEIGHT_PX);
                 setScale(s);
             } else {
                 // Sidebar mode: fit width only
                 if (containerRef.current) {
                     const w = containerRef.current.offsetWidth;
                     if (w > 0) setScale(w / A4_WIDTH_PX);
                 }
             }
         };

         // Initial calculation
         // For non-full, ResizeObserver will handle it, but for full we need this.
         // Small delay to ensure layout is ready in some cases
         const timer = setTimeout(calculateScale, 0);

         if (full) {
             window.addEventListener('resize', calculateScale);
             return () => {
                 window.removeEventListener('resize', calculateScale);
                 clearTimeout(timer);
             };
         } else {
             const observer = new ResizeObserver(() => calculateScale());
             if (containerRef.current) observer.observe(containerRef.current);
             return () => {
                 observer.disconnect();
                 clearTimeout(timer);
             };
         }
     }, [full]);

     // Style: In full mode, we set specific size to allow centering. 
     // In sidebar, we fill width.
     const containerStyle = full 
        ? { width: scale * A4_WIDTH_PX, height: scale * A4_HEIGHT_PX } 
        : { width: '100%', height: scale * A4_HEIGHT_PX };

     return (
        <div ref={containerRef} className="relative transition-all duration-200 ease-out" style={containerStyle}>
             <div 
                className="origin-top-left absolute top-0 left-0 transition-transform duration-200 ease-out will-change-transform shadow-sm"
                style={{ transform: `scale(${scale})` }}
             >
                <SlideComponent slide={currentSlide} index={currentSlideIndex} />
             </div>
        </div>
     );
  };

  return (
    <>
    {/* Hidden Container for PDF Generation */}
    <div style={{ position: 'fixed', top: 0, left: -99999, zIndex: -1 }} ref={printRef}>
        {slides.map((slide, i) => (
             !slide.isHidden && <SlideComponent key={i} slide={slide} index={i} isPrint={true} />
        ))}
    </div>

    {/* Fullscreen Dialog */}
    <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 bg-transparent border-none shadow-none">
            <DialogTitle className="sr-only">Fullscreen Preview</DialogTitle>
            <div className="flex-1 w-full h-full flex items-center justify-center p-4" onClick={() => setIsFullscreen(false)}>
                 <div className="relative shadow-2xl rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                    <ScaledPreview full={true} />
                     <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute top-4 right-4 z-50 rounded-full"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <Minimize2 size={24} />
                    </Button>
                 </div>
            </div>
        </DialogContent>
    </Dialog>

    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT: Sidebar (Slides & Actions) */}
      <Card className="col-span-12 lg:col-span-3 border-border/50 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
         <div className="p-4 border-b border-border/50 bg-muted/20">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <LayoutTemplate size={16} className="text-primary" />
                ساختار ارائه
            </h3>
            <Button 
                onClick={handleAiWizard} 
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20"
            >
                {isGenerating ? <REFRESH_SPIN /> : <Wand2 size={16} className="mr-2" />}
                ساخت هوشمند با AI
            </Button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {slides.map((slide, i) => (
                <div
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`
                        group relative p-3 rounded-xl cursor-pointer transition-all border border-transparent
                        ${i === currentSlideIndex 
                        ? 'bg-primary/10 border-primary/20 shadow-sm' 
                        : 'hover:bg-muted/50 hover:border-border/50'}
                    `}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground/60 w-5">{(i + 1).toString().padStart(2, '0')}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); setSlides(slides.filter((_, idx) => idx !== i)); }} className="text-rose-500 p-1 hover:bg-rose-50 rounded">
                                 <Trash2 size={12} />
                             </button>
                        </div>
                    </div>
                    <p className={`text-sm font-medium truncate ${i === currentSlideIndex ? 'text-primary' : 'text-foreground'}`}>
                        {slide.title}
                    </p>
                </div>
            ))}
            <Button variant="ghost" className="w-full mt-2 text-muted-foreground dashed border border-dashed border-border" onClick={() => setSlides([...slides, { id: `new-${Date.now()}`, type: 'generic', title: 'اسلاید جدید', bullets: ['نکته اول'] }])}>
                <Plus size={14} className="mr-2" /> اسلاید جدید
            </Button>
         </div>
      </Card>

      {/* CENTER: Editor & Preview */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 overflow-y-auto pr-1">
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card/50 backdrop-blur-sm p-2 rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-3 px-2">
                <Palette size={16} className="text-muted-foreground" />
                <div className="flex gap-2">
                    <ThemePreview themeName="modern" active={theme === 'modern'} />
                    <ThemePreview themeName="tech" active={theme === 'tech'} />
                    <ThemePreview themeName="bold" active={theme === 'bold'} />
                    <ThemePreview themeName="minimal" active={theme === 'minimal'} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Re-sync button removed */}
                <Button variant="default" size="sm" onClick={() => handleSave()} disabled={loading}>
                    <Save size={14} className="mr-1" /> {loading ? '...' : 'ذخیره'}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleExportPDF} disabled={downloading}>
                    <Download size={14} className="mr-1" />
                    {downloading ? 'در حال ساخت...' : 'دانلود PDF'}
                </Button>
            </div>
        </div>

        {/* Workspace */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
             
             {/* EDIT MODE */}
            <Card className="p-6 space-y-6 border-border/50 shadow-sm bg-card/80">
                <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">عنوان اسلاید</label>
                     <span className="text-xs text-muted-foreground font-mono">24pt Bold</span>
                </div>
                <Textarea 
                     value={currentSlide.title}
                     onChange={e => updateCurrentSlide('title', e.target.value)}
                     className="text-2xl font-bold resize-none min-h-[80px] leading-tight"
                     dir="auto"
                 />
                
                <div className="space-y-3">
                     <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">نکات کلیدی</label>
                     {currentSlide.bullets.map((bullet, i) => (
                         <div key={i} className="flex gap-2 group">
                             <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-xs shrink-0 font-mono">
                                 {i + 1}
                             </div>
                             <Textarea 
                                 value={bullet}
                                 onChange={e => updateBullet(i, e.target.value)}
                                 className="flex-1 min-h-[60px] resize-none text-base"
                                 dir="auto"
                             />
                             <button onClick={() => removeBullet(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-all p-2">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                     ))}
                     <Button variant="ghost" size="sm" onClick={addBullet} className="w-full border border-dashed border-border text-muted-foreground">
                         <Plus size={14} className="mr-2" /> افزودن مورد
                     </Button>
                </div>
            </Card>

            {/* PREVIEW MODE */}
            <div className="sticky top-4">
                 <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/10 transition-all hover:ring-primary/20 bg-muted/10 relative group">
                     
                     <ScaledPreview />

                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" onClick={() => setIsFullscreen(true)} className="rounded-full shadow-lg">
                            <Maximize2 size={18} />
                        </Button>
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center mt-4 px-2">
                      <Button variant="ghost" size="sm" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0}>
                          <ChevronRight size={16} /> قبلی
                      </Button>
                      <span className="text-xs font-mono text-muted-foreground">
                          SLIDE {currentSlideIndex + 1} OF {slides.length}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === slides.length - 1}>
                          بعدی <ChevronLeft size={16} />
                      </Button>
                 </div>
            </div>

        </div>
      </div>
    </div>
    </>
  );

  function syncWithPlan() {
      // Re-implement sync based on active project data
      if (!activeProject) return;
      
      let syncedTitle = currentSlide.title;
      let syncedBullets = [...currentSlide.bullets];

      const getText = (content: any): string => {
        if (!content) return "";
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return content.map((c: any) => c.content).join('. ');
        }
        return "";
    };

    if (currentSlide.type === 'title') {
        syncedTitle = activeProject.projectName;
        syncedBullets = [activeProject.tagline];
    } else if (currentSlide.type === 'problem') {
        syncedBullets = [getText(activeProject.leanCanvas?.problem)];
    } else if (currentSlide.type === 'solution') {
        syncedBullets = [getText(activeProject.leanCanvas?.solution), getText(activeProject.leanCanvas?.uniqueValue)];
    }
    
    updateCurrentSlide('title', syncedTitle);
    updateCurrentSlide('bullets', syncedBullets);
    toast.success("Sync complete");
  }
}

const REFRESH_SPIN = () => <RefreshCw className="animate-spin mr-2" size={16} />;
