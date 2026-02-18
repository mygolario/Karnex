import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import pptxgen from "pptxgenjs"; // Import pptxgenjs
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { PitchDeckSlide, savePitchDeck } from "@/lib/db";
import { StoryWizard } from "./story-wizard";
import { DeckPreview } from "./deck-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, Trash2, Maximize2, Minimize2, ChevronLeft, ChevronRight, Palette, Download, LayoutTemplate, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { generatePitchDeckAction } from "@/lib/ai-actions";

// Constants
const A4_WIDTH_PX = 1000;
const A4_HEIGHT_PX = 707; 

export function PitchDeckBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const router = useRouter();
  
  // Mode State
  const [mode, setMode] = useState<'wizard' | 'preview' | 'edit'>('preview');
  
  // Data State
  const [slides, setSlides] = useState<PitchDeckSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // New state for AI generation
  const [theme, setTheme] = useState<'modern'|'minimal'|'bold'|'tech'>('modern');

  // Initialize
  const initialized = useRef(false);

  useEffect(() => {
    if (!activeProject || initialized.current) return;

    if (activeProject.pitchDeck && activeProject.pitchDeck.length > 0) {
      setSlides(activeProject.pitchDeck);
      setMode('preview');
    } else {
      // Auto-generate on first load if empty
      handleGenerateAI({ idea: activeProject.description || activeProject.projectName || "Startup Idea" });
    }
    initialized.current = true;
  }, [activeProject]);

  // Handlers
  const handleWizardComplete = async (answers: any) => {
      // The wizard now returns answers, not slides. We generate slides from answers.
      await handleGenerateAI({ idea: answers.tagline, wizardAnswers: answers });
      setMode('preview');
  };

  const handleGenerateAI = async (data: { idea: string, wizardAnswers?: any }) => {
      setIsGenerating(true);
      if(mode !== 'wizard') toast.info("دستیار کارنکس در حال نوشتن پیچ‌دک شماست...");
      
      try {
          const res = await generatePitchDeckAction(data);
          if (res.success && res.data?.slides) {
              const newSlides = res.data.slides;
              setSlides(newSlides);
              handleSave(newSlides);
              toast.success("پیچ‌دک هوشمند شما آماده شد! 🚀");
          } else {
              toast.error(res.error || "خطا در تولید محتوا");
              // Fallback to basic if AI fails/limits
              if(slides.length === 0) {
                 const fallback: PitchDeckSlide[] = [{ id: '1', type: 'title', title: activeProject?.projectName || 'عنوان', bullets: ['توضیحات خود را بنویسید'], isHidden: false }];
                 setSlides(fallback);
              }
          }
      } catch (err) {
          console.error(err);
          toast.error("خطا در ارتباط با هوش مصنوعی");
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
      // toast.success("ذخیره شد"); // Optional to avoid spamming
    } catch (err) {
      console.error(err);
      toast.error("خطا در ذخیره سازی");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlide = (index: number) => {
      if (index === -1) {
          // Add new
          const newSlide: PitchDeckSlide = {
              id: `new-${Date.now()}`,
              type: 'generic',
              title: 'اسلاید جدید',
              bullets: ['نکته اول'],
              isHidden: false
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

  const handleDeleteSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    handleSave(newSlides);
    toast.success("اسلاید حذف شد");
  };

  const handleExportPPTX = async () => {
    setDownloading(true);
    try {
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';
      pres.rtlMode = true; // Enable RTL mode globally if possible, or per element
      
      // Add Title Slide or Master info
      pres.author = 'Karnex';
      pres.company = activeProject?.projectName || 'Startup';
      pres.subject = 'Pitch Deck';
      pres.title = activeProject?.projectName || 'Pitch Deck';

      // Define a Master Slide with Slide Number
      pres.defineSlideMaster({
        title: "MASTER",
        background: { color: "FFFFFF" },
        slideNumber: { x: '95%', y: '92%', fontSize: 10, color: '999999' }
      });

      slides.forEach((slide) => {
          if (slide.isHidden) return;
          const pptxSlide = pres.addSlide({ masterName: "MASTER" });
          
          // Title
          pptxSlide.addText(slide.title, {
              x: 0.5, y: 0.5, w: '90%', h: 1,
              fontSize: 32,
              bold: true,
              color: '000000',
              rtlMode: true,
              align: 'right',
              fontFace: 'Arial' // Use a standard font for max compatibility
          });

          // Bullets
          const bulletText = slide.bullets.map(b => ({ 
              text: b, 
              options: { 
                  rtlMode: true, 
                  fontSize: 18, 
                  color: '333333',
                  breakLine: true,
                  bullet: true
              } 
          }));

          pptxSlide.addText(bulletText, {
              x: 0.5, y: 1.8, w: '90%', h: 4,
              align: 'right',
              fontFace: 'Arial'
          });
      });

      await pres.writeFile({ fileName: `${activeProject?.projectName || 'PitchDeck'}.pptx` });
      toast.success("دانلود پاورپوینت کامل شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ساخت پاورپوینت");
    } finally {
      setDownloading(false);
    }
  };

  // --- Views ---

  if (isGenerating && mode !== 'wizard') {
       return (
           <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
               <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
               </div>
               <div className="text-center space-y-2 relative z-10">
                   <h3 className="text-2xl font-bold">دستیار هوشمند در حال نوشتن پیچ‌دک است...</h3>
                   <p className="text-muted-foreground">در حال تحلیل ایده، طراحی اسلایدها و نوشتن محتوای حرفه‌ای</p>
               </div>
           </div>
       );
  }

  if (mode === 'wizard') {
      return (
          <StoryWizard 
            onComplete={handleWizardComplete} 
            onCancel={() => {
                if(slides.length > 0) {
                    setMode('preview');
                } else {
                    toast.info("انصراف از ساخت پیچ دک");
                    router.push('/dashboard/overview');
                }
            }} 
            isGenerating={isGenerating}
          />
      );
  }

  if (mode === 'preview') {
      return (
          <>
            <DeckPreview 
                slides={slides} 
                onEditSlide={handleEditSlide} 
                onDeleteSlide={handleDeleteSlide}
                onRegenerate={() => setMode('wizard')} 
                onDownload={handleExportPPTX}
            />
          </>
      );
  }

  // Edit Mode (Simplified Editor)
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* Toolbar */}
       <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setMode('preview')} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft size={16} className="mr-2" /> بازگشت به نمای کلی
            </Button>
            <div className="flex items-center gap-2">
                 <Button variant="default" onClick={() => handleSave()} disabled={loading}>
                     <Save size={16} className="mr-2" /> ذخیره تغییرات
                 </Button>
            </div>
       </div>

       <div className="grid lg:grid-cols-2 gap-8 items-start h-full overflow-hidden">
           
           {/* Editor Panel */}
           <Card className="p-8 space-y-8 h-full overflow-y-auto border-border/50 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl">
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">عنوان اسلاید</label>
                    <Textarea 
                         value={currentSlide?.title || ''}
                         onChange={e => updateCurrentSlide('title', e.target.value)}
                         className="text-3xl font-black resize-none min-h-[100px] leading-tight bg-transparent border-none p-0 focus:ring-0 shadow-none dark:text-white"
                         placeholder="عنوان را اینجا بنویسید..."
                         dir="auto"
                     />
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">نکات کلیدی</label>
                    {currentSlide?.bullets.map((bullet, i) => (
                        <div key={i} className="flex gap-3 group">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-1 shrink-0">
                                {i + 1}
                            </div>
                            <Textarea 
                                value={bullet}
                                onChange={e => {
                                    const newBullets = [...currentSlide.bullets];
                                    newBullets[i] = e.target.value;
                                    updateCurrentSlide('bullets', newBullets);
                                }}
                                className="flex-1 min-h-[60px] resize-none text-lg bg-transparent border-0 border-b border-border/50 rounded-none focus:border-primary px-0 shadow-none focus-visible:ring-0 dark:text-slate-200"
                                dir="auto"
                            />
                            <button 
                                onClick={() => {
                                    const newBullets = currentSlide.bullets.filter((_, idx) => idx !== i);
                                    updateCurrentSlide('bullets', newBullets);
                                }} 
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-all p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <Button 
                        variant="ghost" 
                        onClick={() => updateCurrentSlide('bullets', [...currentSlide.bullets, ""])} 
                        className="w-full h-12 border-2 border-dashed border-border/50 rounded-xl hover:bg-muted/30 text-muted-foreground hover:text-primary"
                    >
                        <Plus size={16} className="mr-2" /> افزودن نکته جدید
                    </Button>
                </div>
           </Card>

           {/* Preview Panel (Sticky) */}
           <div className="sticky top-4">
                <div className="bg-muted/10 rounded-3xl p-8 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden group">
                     {/* Slide Visual */}
                     <div className="w-full aspect-[1.414] bg-white dark:bg-slate-950 shadow-2xl rounded-lg overflow-hidden relative transform transition-transform group-hover:scale-[1.02] duration-500">
                         {/* Render a single visual slide here for immediate feedback */}
                         <SlideVisual slide={currentSlide} index={currentSlideIndex} total={slides.length} theme={theme} projectName={activeProject?.projectName || ''} />
                     </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-center items-center gap-4 mt-6">
                     <Button variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} disabled={currentSlideIndex === 0}>
                         <ChevronRight />
                     </Button>
                     <span className="font-mono text-sm text-muted-foreground">
                         {currentSlideIndex + 1} / {slides.length}
                     </span>
                     <Button variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))} disabled={currentSlideIndex === slides.length - 1}>
                         <ChevronLeft />
                     </Button>
                </div>
           </div>
       </div>
    </div>
  );
}

// --- Visual Components below ---

const SlideVisual = ({ slide, index, total, theme, projectName, isExport = false }: { slide: PitchDeckSlide, index: number, total: number, theme: string, projectName: string, isExport?: boolean }) => {
    if(!slide) return null;
    return (
        <div className={`w-full h-full p-12 flex flex-col relative ${isExport ? 'bg-white text-slate-900' : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100'} transition-colors`}>
            {/* Decorations */}
             <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 rounded-bl-full blur-3xl pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-500/5 rounded-tr-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className={`flex justify-between items-center mb-10 pb-4 ${isExport ? 'border-black/5' : 'border-black/5 dark:border-white/5'} border-b relative z-10`}>
                <span className="text-xs font-black tracking-[0.2em] opacity-30 uppercase">{projectName || 'PROJECT'}</span>
                <span className="text-xs font-mono opacity-30">{index + 1} / {total}</span>
            </div>

            {/* Content */}
            <h1 className="text-4xl font-black mb-8 leading-tight relative z-10 dir-rtl" dir="rtl">{slide.title}</h1>
            <div className="space-y-6 flex-1 relative z-10" dir="rtl">
                {slide.bullets.map((b, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-3 shrink-0" />
                        <p className="text-xl font-medium leading-relaxed opacity-90">{b}</p>
                    </div>
                ))}
            </div>
            
            <div className="absolute bottom-4 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
        </div>
    );
}
