"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud } from "@/lib/db";
import { 
  Copy, Check, Palette, Type, Image as ImageIcon, Sparkles, 
  Lightbulb, Smartphone, Info, Wand2, Loader2, RefreshCw,
  Download, Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandVisualizer } from "@/components/dashboard/brand-visualizer";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }
};

export default function BrandKitPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  const [copied, setCopied] = useState<string | null>(null);
  
  // AI Generation States
  const [generatingLogo, setGeneratingLogo] = useState<number | null>(null);
  const [generatingColors, setGeneratingColors] = useState(false);
  const [generatingPsychology, setGeneratingPsychology] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  // AI: Generate Logo Image
  const handleGenerateLogo = async (index: number) => {
    if (!plan || !user) return;
    setGeneratingLogo(index);
    setAiError(null);

    try {
      const concept = plan.brandKit.logoConcepts[index];
      const prompt = `Logo design for "${plan.projectName}": ${concept.description}. 
        Brand colors: ${plan.brandKit.primaryColorHex} and ${plan.brandKit.secondaryColorHex}. 
        Style: Modern, professional, minimal, suitable for ${plan.audience}. 
        Persian/Iranian startup branding.`;

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: "logo, vector, minimalist, professional" })
      });

      const data = await response.json();
      
      if (data.success && (data.imageUrl || data.imageBase64)) {
        // Update the logo concept with the new image
        const updatedConcepts = [...plan.brandKit.logoConcepts];
        updatedConcepts[index] = {
          ...updatedConcepts[index],
          imageUrl: data.imageUrl || `data:image/png;base64,${data.imageBase64}`
        };

        const updatedBrandKit = { ...plan.brandKit, logoConcepts: updatedConcepts };
        
        // Save to DB
        await savePlanToCloud(user.uid, { brandKit: updatedBrandKit }, true, plan.id);
        updateActiveProject({ brandKit: updatedBrandKit });
      } else {
        setAiError(data.error || "خطا در تولید تصویر");
      }
    } catch (err) {
      console.error("Logo generation error:", err);
      setAiError("خطا در ارتباط با سرور");
    } finally {
      setGeneratingLogo(null);
    }
  };

  // AI: Regenerate Color Psychology
  const handleRegeneratePsychology = async () => {
    if (!plan || !user) return;
    setGeneratingPsychology(true);
    setAiError(null);

    try {
      const prompt = `Explain the psychology behind these brand colors for a ${plan.audience} audience in Persian:
        Primary: ${plan.brandKit.primaryColorHex}
        Secondary: ${plan.brandKit.secondaryColorHex}
        Business: ${plan.projectName} - ${plan.overview}
        
        Write 2-3 sentences in Persian about why these colors work for this brand.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          systemPrompt: "You are a brand psychology expert. Respond only in Persian (Farsi). Be concise."
        })
      });

      const data = await response.json();
      
      if (data.success && data.content) {
        const updatedBrandKit = { ...plan.brandKit, colorPsychology: data.content };
        await savePlanToCloud(user.uid, { brandKit: updatedBrandKit }, true, plan.id);
        updateActiveProject({ brandKit: updatedBrandKit });
      } else {
        setAiError(data.error || "خطا در تولید متن");
      }
    } catch (err) {
      console.error("Psychology generation error:", err);
      setAiError("خطا در ارتباط با سرور");
    } finally {
      setGeneratingPsychology(false);
    }
  };

  // AI: Suggest New Colors
  const handleSuggestColors = async () => {
    if (!plan || !user) return;
    setGeneratingColors(true);
    setAiError(null);

    try {
      const prompt = `Suggest new brand colors for:
        Business: ${plan.projectName}
        Description: ${plan.overview}
        Audience: ${plan.audience}
        
        Return ONLY valid JSON: {"primaryColorHex": "#XXXXXX", "secondaryColorHex": "#XXXXXX", "psychology": "توضیح فارسی"}`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          systemPrompt: "You are a brand color expert. Return ONLY valid JSON, no markdown."
        })
      });

      const data = await response.json();
      
      if (data.success && data.content) {
        try {
          const colors = JSON.parse(data.content.replace(/```json|```/g, "").trim());
          const updatedBrandKit = { 
            ...plan.brandKit, 
            primaryColorHex: colors.primaryColorHex,
            secondaryColorHex: colors.secondaryColorHex,
            colorPsychology: colors.psychology || plan.brandKit.colorPsychology
          };
          await savePlanToCloud(user.uid, { brandKit: updatedBrandKit }, true, plan.id);
          updateActiveProject({ brandKit: updatedBrandKit });
        } catch (parseErr) {
          setAiError("خطا در پردازش پاسخ هوش مصنوعی");
        }
      } else {
        setAiError(data.error || "خطا در تولید رنگ");
      }
    } catch (err) {
      console.error("Color generation error:", err);
      setAiError("خطا در ارتباط با سرور");
    } finally {
      setGeneratingColors(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary to-pink-500 flex items-center justify-center animate-pulse shadow-xl shadow-secondary/20">
          <Palette size={40} className="text-white" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">در حال استخراج هویت برند...</p>
      </div>
    );
  }

  const primaryHex = plan.brandKit.primaryColorHex;
  const secondaryHex = plan.brandKit.secondaryColorHex;
  const colors = [primaryHex, secondaryHex];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-fade-in-up">
      
      {/* AI Error Toast */}
      {aiError && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-fade-in-up">
          <div className="bg-destructive text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <Info size={20} />
            <span className="flex-1">{aiError}</span>
            <button onClick={() => setAiError(null)} className="hover:opacity-70">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/20 blur-[100px] rounded-full animate-float mix-blend-overlay" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-yellow-300/20 blur-[100px] rounded-full animate-float mix-blend-overlay" style={{ animationDelay: "-2s" }} />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/20 animate-bounce-gentle">
                 <Palette size={32} />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl md:text-5xl font-black tracking-tight">هویت بصری برند</h1>
                   <Badge variant="outline" className="hidden md:flex bg-white/10 backdrop-blur border-white/20 text-white gap-1 px-3">
                    <Sparkles size={12} />
                    هوش مصنوعی
                  </Badge>
                </div>
                <p className="text-white/80 text-lg mt-2 font-medium">
                  طراحی شده برای مخاطب: <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded-lg">{plan.audience}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex -space-x-6 space-x-reverse">
                <div className="w-20 h-20 rounded-full border-[6px] border-white/20 shadow-2xl transform hover:scale-110 transition-transform duration-500 z-10" style={{ backgroundColor: primaryHex }} />
                <div className="w-20 h-20 rounded-full border-[6px] border-white/20 shadow-2xl transform hover:scale-110 transition-transform duration-500 hover:z-20" style={{ backgroundColor: secondaryHex }} />
             </div>
          </div>
        </div>
      </div>

      {/* Live Visualizer */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Smartphone size={24} />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">پیش‌نمایش زنده</h2>
        </div>
        <div className="card-glass p-1 rounded-3xl border-primary/10">
           <BrandVisualizer colors={colors} projectName={plan.projectName} fontName="Vazirmatn" />
        </div>
      </section>

      {/* Colors Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Palette size={24} />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">پالت رنگی</h2>
          </div>
          {/* AI Button */}
          <Button 
            variant="outline" 
            onClick={handleSuggestColors}
            disabled={generatingColors}
            className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            {generatingColors ? (
              <><Loader2 size={16} className="animate-spin" /> در حال تولید...</>
            ) : (
              <><Wand2 size={16} /> پیشنهاد رنگ جدید با AI</>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: "رنگ اصلی", hex: primaryHex, usage: "دکمه‌های اصلی، لوگو، تیترهای مهم" },
            { label: "رنگ مکمل", hex: secondaryHex, usage: "پس‌زمینه‌ها، آیکون‌ها، حاشیه‌ها" }
          ].map((color, idx) => (
            <div key={idx} className="group relative rounded-[2.5rem] p-3 overflow-visible transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2">
               <div className="absolute inset-0 bg-white/50 dark:bg-black/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative bg-card border border-border/50 rounded-[2rem] overflow-hidden p-2 h-full flex flex-col">
                   <div 
                     className="h-56 w-full rounded-[1.5rem] shadow-inner relative overflow-hidden group-hover:scale-[0.98] transition-all duration-500" 
                     style={{ backgroundColor: color.hex }}
                   >
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                     <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl text-black font-mono font-bold shadow-2xl flex items-center gap-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                       <span className="text-lg">{color.hex}</span>
                       <div className="w-px h-6 bg-black/10" />
                       <button onClick={() => copyToClipboard(color.hex)} className="hover:text-primary transition-colors hover:scale-110 active:scale-90">
                         {copied === color.hex ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                       </button>
                     </div>
                   </div>
                   <div className="p-8 pb-6 bg-card">
                     <h3 className="font-extrabold text-2xl text-foreground mb-3 flex items-center justify-between">
                       {color.label}
                       <div className="w-6 h-6 rounded-full border-2 border-background shadow-sm" style={{ backgroundColor: color.hex }} />
                     </h3>
                     <p className="text-muted-foreground text-base flex items-start gap-3 leading-7">
                       <Info size={20} className="text-primary mt-1 shrink-0" />
                       {color.usage}
                     </p>
                   </div>
               </div>
            </div>
          ))}
        </div>

        {/* Psychology Note */}
        <div className="mt-10 card-glass border-l-4 border-l-amber-500 rounded-2xl p-8 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-lg text-foreground flex items-center gap-2">
              <Lightbulb size={24} className="text-amber-500 fill-amber-500/20" />
              فلسفه انتخاب این رنگ‌ها
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRegeneratePsychology}
              disabled={generatingPsychology}
              className="gap-1 text-muted-foreground hover:text-primary"
            >
              {generatingPsychology ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              بازنویسی با AI
            </Button>
          </div>
          <p className="text-muted-foreground leading-8 text-base md:text-lg">
            {plan.brandKit.colorPsychology}
          </p>
        </div>
      </section>

      {/* Typography */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Type size={24} />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">تایپوگرافی</h2>
        </div>
        
        <Card variant="glass" className="overflow-hidden border border-white/10 p-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-10 border-b border-white/10 bg-white/5">
            <div>
              <h3 className="text-4xl font-black text-foreground mb-2">وزیرمتن</h3>
              <p className="text-lg text-muted-foreground">Vazirmatn - فونت استاندارد وب فارسی</p>
            </div>
            <Badge variant="secondary" className="font-mono text-sm px-4 py-2 bg-secondary/10 text-secondary border-none rounded-xl">
              font-family: 'Vazirmatn';
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2">
            <div className="space-y-8 p-10">
               <div className="space-y-3">
                 <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Heading 1 / Black / 48px</span>
                 <h1 className="text-5xl md:text-6xl font-black text-foreground leading-tight">خلاقیت مرز ندارد</h1>
               </div>
               <div className="space-y-3">
                 <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Heading 2 / Bold / 30px</span>
                 <h2 className="text-3xl md:text-4xl font-bold text-foreground">برای آینده طراحی کنید</h2>
               </div>
               <div className="space-y-3">
                 <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Body / Regular / 16px</span>
                 <p className="text-lg text-muted-foreground leading-9 text-justify">
                   لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است.
                 </p>
               </div>
            </div>
            
            <div className="bg-foreground text-background p-12 flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
               <div className="relative z-10 w-full">
                 <span className="text-9xl font-black block mb-8 opacity-90">Aa</span>
                 <div className="flex gap-6 justify-center font-mono text-base opacity-70">
                    <span>Regular</span>
                    <span>Medium</span>
                    <span>Bold</span>
                    <span>Black</span>
                 </div>
                 <div className="mt-12 pt-12 border-t border-white/10 w-full text-center">
                    <span className="text-5xl font-bold tracking-[0.2em] opacity-80">۱۲۳۴۵۶۷۸۹۰</span>
                 </div>
               </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Logo Concepts - AI Enhanced */}
      <section className="pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">ایده‌های لوگو</h2>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Zap size={12} />
            AI تصویرساز فعال
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plan.brandKit.logoConcepts?.map((logo: any, i: number) => (
            <Card 
              key={i} 
              variant="default"
              hover="lift"
              className="group p-6 text-center border-white/5 bg-gradient-to-b from-card to-card/50 overflow-hidden"
            >
              {/* Logo Image or Placeholder */}
              <div className="relative w-full aspect-square rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {logo.imageUrl ? (
                  <>
                    <img 
                      src={logo.imageUrl} 
                      alt={logo.conceptName}
                      className="w-full h-full object-cover"
                    />
                    <a 
                      href={logo.imageUrl} 
                      download={`${plan.projectName}-logo-${i + 1}.png`}
                      className="absolute bottom-3 left-3 bg-white/90 backdrop-blur p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download size={18} className="text-foreground" />
                    </a>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="font-black text-2xl text-primary/50">{i + 1}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">برای تولید لوگو کلیک کنید</p>
                  </div>
                )}
                
                {/* Loading Overlay */}
                {generatingLogo === i && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">در حال تولید با AI...</span>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-foreground mb-2">{logo.conceptName}</h3>
              <p className="text-muted-foreground text-sm leading-7 mb-4 line-clamp-2">
                {logo.description}
              </p>
              
              {/* Generate Button */}
              <Button 
                variant={logo.imageUrl ? "outline" : "gradient"}
                size="sm"
                onClick={() => handleGenerateLogo(i)}
                disabled={generatingLogo !== null}
                className="w-full gap-2"
              >
                {logo.imageUrl ? (
                  <><RefreshCw size={14} /> بازسازی لوگو</>
                ) : (
                  <><Wand2 size={14} /> تولید لوگو با AI</>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
