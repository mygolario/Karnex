"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Users, Store, TrendingUp, Search, 
  Navigation, Map as MapIcon, Loader2, Sparkles,
  Building2, Car, Clock, DollarSign, Target,
  BarChart3, CheckCircle2, AlertTriangle, Info
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LocationAnalyzerPage() {
  const { activeProject: plan } = useProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("tehran");

  /* State for AI Analysis Data */
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <MapPin size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تحلیل منطقه برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }



  const handleAnalyze = async () => {
    if (!address) {
      toast.error("آدرس یا محله را وارد کنید");
      return;
    }

    setIsAnalyzing(true);
    setHasAnalysis(false);

    try {
      const prompt = `
        You are an expert Urban Planner and Real Estate Location Analyst for a "${plan?.projectType || 'store'}" business named "${plan?.projectName}" in Iran.
        
        Analyze this specific location:
        City: ${selectedCity}
        Address/Neighborhood: ${address}
        Business Description: ${plan?.description || plan?.overview || 'A traditional business'}

        Provide a detailed, realistic analysis in valid JSON format.
        
        REQUIRED JSON STRUCTURE:
        {
          "score": number (0-10, e.g. 8.5),
          "scoreReason": "string (short Persian summary)",
          "population": "string (e.g. '45,000 نفر')",
          "populationDesc": "string (Persian description of density/power)",
          "competitorsCount": "number",
          "competitorsDesc": "string (Persian analysis of competition)",
          "nearbyCompetitors": ["string (Real specific competitor name 1)", "string (Real specific competitor name 2)"],
          "rentEstimate": "string (e.g. '۵۰ تا ۷۰ میلیون تومان')",
          "successMatch": { "label": "string (High/Medium/Low - Persian)", "color": "hex" },
          "demographics": [
            { "label": "string (Age group/Type)", "percent": number, "color": "string (hex or tailwind class)" },
            { "label": "string", "percent": number, "color": "string" }
          ],
          "swot": {
            "strengths": ["string", "string"],
            "weaknesses": ["string", "string"],
            "opportunities": ["string", "string"],
            "threats": ["string", "string"]
          },
          "aiInsight": "string (valuable Persian insight about this specific location)",
          "peakHours": "string (e.g. '18:00 تا 21:00')",
          "accessLevel": "string (e.g. 'Excellent', 'Good')",
          "accessPoints": [
            "string (Persian point 1, e.g. near metro)",
            "string (Persian point 2)"
          ],
          "trafficWarning": "string (Persian traffic warning)",
          "recommendations": [
            { "title": "string (e.g. Pricing)", "desc": "string (Persian advice)" },
            { "title": "string (e.g. Marketing)", "desc": "string (Persian advice)" }
          ]
        }

        ENSURE VALID JSON. NO MARKDOWN. NO COMMENTS.
      `;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      console.log("AI Response:", data); // Debug log
      
      let parsedData;
      try {
        // Handle potentialmarkdown wrapping from AI
        const cleanJson = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback or retry logic could go here, for now throw
        throw new Error("Invalid AI response format");
      }

      setAnalysisData(parsedData);
      setHasAnalysis(true);
      toast.success("تحلیل موقعیت مکانی با موفقیت انجام شد");

    } catch (error) {
      console.error(error);
      toast.error("خطا در تحلیل منطقه. لطفا دوباره تلاش کنید.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تحلیلگر منطقه هوشمند</h1>
              <p className="text-muted-foreground">شناسایی بهترین مکان‌ها، تحلیل رقبا و پیش‌بینی مشتریان</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">شهر</label>
            <select 
              className="input-premium w-full"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="tehran">تهران</option>
              <option value="mashhad">مشهد</option>
              <option value="isfahan">اصفهان</option>
              <option value="shiraz">شیراز</option>
              <option value="tabriz">تبریز</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">محله یا آدرس دقیق</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-muted-foreground max-w-[20px]" />
              <input 
                className="input-premium w-full pr-10"
                placeholder="مثال: سعادت‌آباد، خیابان علامه طباطبایی"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <Button 
              className="w-full h-[42px] bg-gradient-to-r from-primary to-secondary gap-2"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search size={18} />}
              تحلیل منطقه
            </Button>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {hasAnalysis && analysisData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Card */}
            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400">امتیاز مکان</h3>
                  <p className="text-xs text-muted-foreground">مناسب برای {plan?.projectName}</p>
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                {analysisData.score}<span className="text-sm font-normal text-muted-foreground">/۱۰</span>
              </div>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 line-clamp-2">
                {analysisData.scoreReason}
              </p>
            </Card>

            {/* Economics Card (New) */}
            <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-violet-700 dark:text-violet-400">برآورد هزینه</h3>
                  <p className="text-xs text-muted-foreground">تخمین اجاره ماهانه</p>
                </div>
              </div>
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mb-1">
                {analysisData.rentEstimate}
              </div>
              <Badge variant="outline" className={`mt-1 border-violet-500/30 text-violet-700 dark:text-violet-400 font-normal`}>
                 احتمال موفقیت: {analysisData.successMatch?.label || 'بالا'}
              </Badge>
            </Card>

            {/* Competitors Card (Enhanced) */}
            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-700 dark:text-amber-400">تحلیل رقبا</h3>
                  <p className="text-xs text-muted-foreground">رقبای اصلی اطراف</p>
                </div>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">
                {analysisData.competitorsCount}<span className="text-sm font-normal text-muted-foreground"> رقیب</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysisData.nearbyCompetitors?.map((comp: string, i: number) => (
                  <span key={i} className="text-[10px] bg-amber-500/10 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-md">
                    {comp}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics & Insight */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="text-primary" size={20} />
                  تحلیل بافت جمعیتی
                </h3>
                <Badge variant="secondary">شعاع ۱ کیلومتری</Badge>
              </div>
              <div className="space-y-4">
                {analysisData.demographics.map((demo: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{demo.label}</span>
                      <span className="font-bold">{demo.percent}٪</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${demo.percent}%`, backgroundColor: demo.color || '#3b82f6' }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  تحلیل هوشمند منطقه:
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  {analysisData.aiInsight}
                </p>
              </div>
            </Card>

            {/* SWOT Aanalysis (New) */}
            <Card className="p-6">
               <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} />
                  تحلیل استراتژیک (SWOT)
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 h-[calc(100%-3rem)]">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                   <h5 className="font-bold text-xs text-emerald-600 mb-2 flex items-center gap-1"><CheckCircle2 size={12}/> نقاط قوت</h5>
                   <ul className="space-y-1">
                     {analysisData.swot?.strengths?.map((s: string, i: number) => (
                       <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                     ))}
                   </ul>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                   <h5 className="font-bold text-xs text-rose-600 mb-2 flex items-center gap-1"><AlertTriangle size={12}/> نقاط ضعف</h5>
                   <ul className="space-y-1">
                     {analysisData.swot?.weaknesses?.map((s: string, i: number) => (
                       <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                     ))}
                   </ul>
                </div>
                 <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                   <h5 className="font-bold text-xs text-blue-600 mb-2 flex items-center gap-1"><Target size={12}/> فرصت‌ها</h5>
                   <ul className="space-y-1">
                     {analysisData.swot?.opportunities?.map((s: string, i: number) => (
                       <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                     ))}
                   </ul>
                </div>
                 <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                   <h5 className="font-bold text-xs text-amber-600 mb-2 flex items-center gap-1"><Info size={12}/> تهدیدها</h5>
                   <ul className="space-y-1">
                     {analysisData.swot?.threats?.map((s: string, i: number) => (
                       <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                     ))}
                   </ul>
                </div>
              </div>
            </Card>

            {/* Recommendations & Traffic */}
            <Card className="p-6 lg:col-span-2">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                      <Target className="text-primary" size={18} />
                      پیشنهادات عملیاتی
                    </h3>
                    <div className="space-y-3">
                      {analysisData.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="bg-muted/30 p-3 rounded-lg border border-border/50">
                          <h4 className="font-bold text-sm text-primary mb-1">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                        </div>
                      ))}
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                      <Car className="text-primary" size={18} />
                      وضعیت تردد و دسترسی
                    </h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <span className="text-sm text-muted-foreground">ساعات پیک</span>
                          <span className="font-bold text-sm">{analysisData.peakHours}</span>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <span className="text-sm text-muted-foreground">وضعیت ترافیک</span>
                          <span className="font-bold text-sm text-amber-600">{analysisData.trafficWarning || 'عادی'}</span>
                       </div>
                       <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-sm text-muted-foreground block mb-2">نقاط دسترسی:</span>
                          <div className="flex flex-wrap gap-2">
                            {analysisData.accessPoints?.map((p: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-background">{p}</Badge>
                            ))}
                          </div>
                       </div>
                    </div>
                 </div>
               </div>
            </Card>
          </div>
        </motion.div>
      )}

      {!hasAnalysis && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 pointer-events-none filter blur-sm select-none">
           {/* Placeholder blurred content */}
           <Card className="p-32 col-span-full border-dashed flex items-center justify-center">
             <p className="text-xl text-muted-foreground">منتظر دریافت آدرس برای تحلیل...</p>
           </Card>
        </div>
      )}
    </div>
  );
}
