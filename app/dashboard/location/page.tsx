"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2, Navigation, Layers, Zap, Store } from "lucide-react";
import Link from "next/link";
import { LocationProvider, useLocation } from "@/components/dashboard/location/location-context";
import { AnalysisCharts } from "@/components/dashboard/location/analysis-charts";
import { LocationScore } from "@/components/dashboard/location/location-score";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
// import { toast } from "sonner"; // Removed unused import
import { motion } from "framer-motion";

export default function LocationAnalyzerPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading || !plan) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
  }

  // Check project type - Traditional Only
  if (plan.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md bg-muted/20 border-dashed">
          <MapPin size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تحلیل منطقه برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button variant="outline" className="w-full">بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <LocationProvider>
        <LocationPageContent />
    </LocationProvider>
  );
}

function LocationPageContent() {
  const { activeProject } = useProject();
  const { analysis, loading, analyzeLocation } = useLocation();
  const [city, setCity] = useState("Tehran");
  const [address, setAddress] = useState("");

  const handleAnalyze = async () => {
    if (!address) return;
    await analyzeLocation(city, address);
  };

  if (!activeProject) return <div className="p-10 text-center">Please select a project first.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* LEFT PANEL - MAP & INPUT (Sticky) */}
      <div className="w-full md:w-[40%] h-[40vh] md:h-full relative border-l border-border bg-muted/10 flex flex-col">
          
          {/* Map Background Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Tehran_location_map.svg/1024px-Tehran_location_map.svg.png')] bg-cover bg-center filter grayscale opacity-20" />
             <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col p-6 md:p-8 justify-center">
             
             <div className="mb-8">
                <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur border-primary/20 text-primary">
                    <Zap size={12} className="mr-1" /> هوش مصنوعی + داده‌های ماهواره‌ای
                </Badge>
                <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">تحلیل موقعیت مکانی</h1>
                <p className="text-muted-foreground text-lg">دستیار هوشمند انتخاب لوکیشن برای {activeProject.projectName}</p>
             </div>

             {/* Search Box */}
             <Card className="p-2 flex items-center gap-2 bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl">
                 <div className="relative">
                    <select 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-transparent text-sm font-bold p-3 outline-none appearance-none cursor-pointer hover:bg-muted/50 rounded-xl transition-colors"
                    >
                        <option value="Tehran">تهران</option>
                        <option value="Karaj">کرج</option>
                        <option value="Mashhad">مشهد</option>
                        <option value="Isfahan">اصفهان</option>
                        <option value="Tabriz">تبریز</option>
                        <option value="Shiraz">شیراز</option>
                    </select>
                </div>
                <div className="h-6 w-[1px] bg-border" />
                <div className="flex-1 relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 animate-bounce" />
                    <input 
                        type="text" 
                        placeholder="نام محله یا خیابان اصلی..."
                        className="w-full bg-transparent p-3 pr-9 outline-none text-sm placeholder:text-muted-foreground/70"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                </div>
                <Button 
                    size="icon" 
                    className="rounded-xl h-10 w-10 shadow-lg bg-primary hover:bg-primary/90"
                    onClick={handleAnalyze}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                </Button>
             </Card>

             {/* Dynamic Score Display (If Analysis Exists) */}
             {analysis && (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-6 bg-background/60 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl text-center"
                 >
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">امتیاز نهایی لوکیشن</span>
                    <div className="text-7xl font-black my-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
                        {analysis.score}<span className="text-2xl text-muted-foreground/50">/10</span>
                    </div>
                    <Badge variant={(analysis.score >= 7) ? "success" : "danger"} className="text-sm px-4 py-1">
                        {analysis.score >= 8 ? 'فوق‌العاده عالی' : analysis.score >= 5 ? 'متوسط / قابل قبول' : 'پر ریسک'}
                    </Badge>
                 </motion.div>
             )}
          </div>
      </div>

      {/* RIGHT PANEL - RESULTS (Scrollable) */}
      <div className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-10">
         
         {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Navigation className="animate-pulse text-primary" size={32} />
                    </div>
                </div>
                <p className="text-xl font-medium animate-pulse">در حال اسکن ماهواره‌ای منطقه...</p>
                <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>تحلیل پاخور</span> • <span>بررسی رقبا</span> • <span>تخمین درآمد</span>
                </div>
             </div>
         ) : !analysis ? (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Layers size={64} className="mb-4 text-muted-foreground/50" />
                <h2 className="text-2xl font-bold mb-2">هنوز تحلیلی انجام نشده</h2>
                <p className="max-w-md mx-auto">برای شروع، نام محله یا خیابان مورد نظر خود را در پنل سمت راست وارد کنید.</p>
             </div>
         ) : (
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 max-w-4xl mx-auto pb-20"
             >
                {/* 1. Executive Summary */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <span className="w-1 h-8 bg-primary rounded-full" />
                        گزارش مدیریتی
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        {analysis.aiInsight}
                    </p>
                </div>

                {/* 2. Key Metrics Cards */}
                <LocationScore />

                {/* 3. Deep Charts */}
                <AnalysisCharts />

                {/* 4. Competitor Table */}
                <Card className="p-6 bg-card/40 border-white/5">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Store size={18} className="text-orange-500" />
                        لیست رقبا (تایید شده)
                    </h3>
                    <div className="space-y-3">
                         {analysis.competitorAnalysis?.directCompetitors?.map((comp, i) => (
                             <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/5">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                                         {i + 1}
                                     </div>
                                     <div>
                                         <p className="font-bold">{comp.name}</p>
                                         <p className="text-xs text-muted-foreground">{comp.distance} فاصله</p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2 mt-2 sm:mt-0">
                                     <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">{comp.strength || 'نقطه قوت'}</Badge>
                                     <Badge variant="outline" className="text-xs border-red-500/30 text-red-500">{comp.weakness || 'نقطه ضعف'}</Badge>
                                 </div>
                             </div>
                         ))}
                         {(!analysis.competitorAnalysis?.directCompetitors || analysis.competitorAnalysis.directCompetitors.length === 0) && (
                             <div className="p-4 text-center text-muted-foreground">هیچ رقیب مستقیمی در شعاع نزدیک یافت نشد.</div>
                         )}
                    </div>
                </Card>
             </motion.div>
         )}
      </div>
    </div>
  );
}
