"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin, Search, Loader2, Navigation, Layers, Zap, History,
  GitCompare, BarChart3, Users, Shield, Target, Lightbulb, DollarSign, Clock
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LocationProvider, useLocation } from "@/components/dashboard/location/location-context";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Custom UI Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Reworked and New Components
import { ScoreGauge } from "@/components/dashboard/location/score-gauge";
import { NeighborhoodCard } from "@/components/dashboard/location/neighborhood-card";
import { MetricCards } from "@/components/dashboard/location/metric-cards";
import { SwotGrid } from "@/components/dashboard/location/swot-grid";
import { RiskGauge } from "@/components/dashboard/location/risk-gauge";
import { MarketGapCards } from "@/components/dashboard/location/market-gap-cards";
import { RecommendationsList } from "@/components/dashboard/location/recommendations-list";
import { ComparisonView } from "@/components/dashboard/location/comparison-view";
import { HistorySidebar } from "@/components/dashboard/location/history-sidebar";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { FinancialSimulator } from "@/components/dashboard/location/financial-simulator";
import { RegulatoryChecklist } from "@/components/dashboard/location/regulatory-checklist";
import { useImmersivePage } from "@/hooks/use-immersive-page";
import { useIsMobile } from "@/hooks/use-is-mobile";

const InteractiveMap = dynamic(
  () => import("@/components/dashboard/location/interactive-map").then((m) => m.InteractiveMap),
  { loading: () => <div className="min-h-[300px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>, ssr: false }
);
const AnalysisCharts = dynamic(
  () => import("@/components/dashboard/location/analysis-charts").then((m) => m.AnalysisCharts),
  { loading: () => <div className="min-h-[200px]" /> }
);
const CompetitorTable = dynamic(
  () => import("@/components/dashboard/location/competitor-table").then((m) => m.CompetitorTable),
  { loading: () => <div className="min-h-[200px]" /> }
);
const DemographicsDashboard = dynamic(
  () => import("@/components/dashboard/location/demographics-dashboard").then((m) => m.DemographicsDashboard),
  { loading: () => <div className="min-h-[200px]" /> }
);

export default function LocationAnalyzerPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

// Tab Definitions
const TABS = [
  { id: "overview", label: "خلاصه تحلیل", icon: BarChart3 },
  { id: "demographics", label: "جمعیت و ترافیک", icon: Users },
  { id: "competitors", label: "رقبا و رادار رقابتی", icon: Shield },
  { id: "swot", label: "ماتریس SWOT", icon: Target },
  { id: "recommendations", label: "اقدامات پیشنهادی", icon: Lightbulb },
];

function LocationPageContent() {
  const { activeProject } = useProject();
  const { analysis, loading, analyzeLocation, history, comparisonMode, toggleComparisonMode } = useLocation();
  const isMobile = useIsMobile();
  useImmersivePage(isMobile);
  
  // Search parameters
  const [city, setCity] = useState("Tehran");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState<number>(500);
  const [priceTier, setPriceTier] = useState<string>("mid");
  const [footfallDependency, setFootfallDependency] = useState<string>("high");
  const [rentBudget, setRentBudget] = useState<number>(25000000);
  
  // Local UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [historyOpen, setHistoryOpen] = useState(false);

  // Sync inputs with loaded analysis if available
  useEffect(() => {
    if (analysis) {
      if (analysis.city) setCity(analysis.city);
      if (analysis.address) setAddress(analysis.address);
      if (analysis.inputs) {
        if (analysis.inputs.priceTier) setPriceTier(analysis.inputs.priceTier);
        if (analysis.inputs.footfallDependency) setFootfallDependency(analysis.inputs.footfallDependency);
        if (analysis.inputs.rentBudget) setRentBudget(analysis.inputs.rentBudget);
      }
    }
  }, [analysis]);

  const handleAnalyze = async () => {
    if (!address) return;
    await analyzeLocation(city, address, radius, priceTier, footfallDependency, rentBudget);
  };

  const handlePinDragEnd = async (lat: number, lon: number) => {
    const coordsStr = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    setAddress(coordsStr);
    await analyzeLocation(city, coordsStr, radius, priceTier, footfallDependency, rentBudget);
  };

  if (!activeProject) return <div className="p-10 text-center">Please select a project first.</div>;

  return (
    <div className={cn(
      "bg-background text-foreground flex overflow-hidden mobile-immersive -mx-4 -mt-3",
      isMobile ? "h-[calc(100dvh-3.5rem)] flex-col" : "min-h-screen h-screen"
    )}>
      
      {/* History Sidebar / Sheet */}
      <HistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto min-h-0">
        
        {/* Header */}
        <div className={cn(
          "sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5",
          isMobile ? "px-3 py-3" : "px-6 py-4"
        )}>
          <div className={cn(isMobile ? "" : "max-w-5xl mx-auto")}>
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h1 data-tour-id="location-header" className="text-lg font-black tracking-tight">تحلیل هوشمند موقعیت</h1>
                  <p className="text-xs text-muted-foreground">{activeProject.projectName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PageTourHelp tourId="location-analyzer" />
                {history.length > 0 && (
                  <>
                    <Button
                      data-tour-id="compare-btn"
                      variant="outline"
                      size="sm"
                      onClick={toggleComparisonMode}
                      className={cn(
                        "text-xs gap-1.5 h-8 border-white/5",
                        comparisonMode && "border-primary/30 text-primary bg-primary/5"
                      )}
                    >
                      <GitCompare size={14} />
                      مقایسه
                    </Button>
                    <Button
                      data-tour-id="history-btn"
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryOpen(!historyOpen)}
                      className={cn(
                        "text-xs gap-1.5 h-8 border-white/5",
                        historyOpen && "border-primary/30 text-primary bg-primary/5"
                      )}
                    >
                      <History size={14} />
                      سابقه ({history.length})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Advanced Header Filters */}
            <div className="space-y-3">
              {/* Row 1: City and District Search */}
              <Card data-tour-id="location-search" className="p-1.5 flex items-center gap-2 bg-card/50 backdrop-blur-xl border border-white/5 shadow-lg rounded-xl">
                <div className="relative">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="نام شهر..."
                    className="w-[140px] bg-transparent text-xs font-bold border-none shadow-none focus-visible:ring-0 px-2 placeholder:font-normal"
                  />
                </div>
                <div className="h-5 w-[1px] bg-border" />
                <div className="flex-1 relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
                  <input
                    type="text"
                    placeholder="نام محله، خیابان یا پین نقشه..."
                    className="w-full bg-transparent p-2.5 pr-8 outline-none text-xs placeholder:text-muted-foreground/70"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
                <Button
                  size="sm"
                  className="rounded-lg h-8 px-4 shadow-md bg-primary hover:bg-primary/90 text-xs gap-1.5"
                  onClick={handleAnalyze}
                  disabled={loading || !address}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  تحلیل موقعیت
                </Button>
              </Card>

              {/* Row 2: Custom Shop Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Search Radius */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">شعاع جستجو</span>
                  <Select value={String(radius)} onValueChange={(val) => setRadius(Number(val))}>
                    <SelectTrigger className="bg-card/40 border-white/5 h-8 text-[11px]">
                      <SelectValue placeholder="شعاع" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/5">
                      <SelectItem value="500" className="text-xs">۵۰۰ متر (پیش‌فرض)</SelectItem>
                      <SelectItem value="1000" className="text-xs">۱ کیلومتر</SelectItem>
                      <SelectItem value="2000" className="text-xs">۲ کیلومتر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Tier */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">تراز قیمتی محصول</span>
                  <Select value={priceTier} onValueChange={setPriceTier}>
                    <SelectTrigger className="bg-card/40 border-white/5 h-8 text-[11px]">
                      <SelectValue placeholder="تراز قیمت" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/5">
                      <SelectItem value="budget" className="text-xs">اقتصادی (ارزان)</SelectItem>
                      <SelectItem value="mid" className="text-xs">متوسط (میان‌رده)</SelectItem>
                      <SelectItem value="premium" className="text-xs">لوکس (گران‌قیمت)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Footfall dependency */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">وابستگی به تردد عابر</span>
                  <Select value={footfallDependency} onValueChange={setFootfallDependency}>
                    <SelectTrigger className="bg-card/40 border-white/5 h-8 text-[11px]">
                      <SelectValue placeholder="نوع تردد" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/5">
                      <SelectItem value="high" className="text-xs">پاخورمحور (عبوری زیاد)</SelectItem>
                      <SelectItem value="destination" className="text-xs">مقصدمحور (مراجعه خاص)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rent Budget */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">بودجه اجاره ماهانه (تومان)</span>
                  <Input
                    type="number"
                    value={rentBudget || ""}
                    onChange={(e) => setRentBudget(Number(e.target.value))}
                    placeholder="بودجه به تومان..."
                    className="bg-card/40 border-white/5 h-8 text-[11px] placeholder:font-normal focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn("mx-auto py-6", isMobile ? "px-3 pb-24" : "max-w-5xl px-6 py-8")}>
          {loading ? (
            <LoadingState />
          ) : !analysis ? (
            <EmptyState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 pb-20"
            >
              {/* Split Screen Layout: Map (65% width) + Stats (35% width) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
                
                {/* Right Column: Dynamic Leaflet Map */}
                <div className="lg:col-span-8 h-[380px] lg:h-auto min-h-[350px]">
                  <InteractiveMap
                    center={analysis.coordinates || { lat: 35.6892, lon: 51.3890 }}
                    competitors={analysis.competitorAnalysis?.directCompetitors?.filter(c => c.coordinates?.lat && c.coordinates?.lon).map(c => ({
                      name: c.name,
                      lat: c.coordinates!.lat,
                      lon: c.coordinates!.lon
                    }))}
                    radius={radius}
                    onPinDragEnd={handlePinDragEnd}
                  />
                </div>

                {/* Left Column: Location score and Neighborhood profile */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                  <Card className="p-6 bg-card/30 border-white/5 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-md">
                    <ScoreGauge score={analysis.score} />
                    <h3 className="font-black text-sm mt-3 text-foreground">نمره تناسب صنف شما</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed text-justify">
                      {analysis.scoreReason}
                    </p>
                  </Card>

                  <div className="flex-1 flex flex-col">
                    <NeighborhoodCard />
                  </div>
                </div>

              </div>

              {/* Tab Bar — sticky bottom on mobile */}
              <div
                data-tour-id="location-tabs"
                className={cn(
                  "flex items-center gap-1 p-1 bg-card/30 rounded-xl border border-white/5 overflow-x-auto mobile-scroll-x",
                  isMobile && "sticky bottom-0 z-10 safe-bottom backdrop-blur-xl"
                )}
              >
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-md font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <MetricCards />
                      <FinancialSimulator initialRent={rentBudget} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RiskGauge />
                        <MarketGapCards />
                      </div>
                    </div>
                  )}

                  {activeTab === "demographics" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <DemographicsDashboard />
                      <AnalysisCharts />
                    </div>
                  )}

                  {activeTab === "competitors" && <CompetitorTable />}
                  {activeTab === "swot" && <SwotGrid />}
                  {activeTab === "recommendations" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <RecommendationsList />
                      <RegulatoryChecklist />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Comparison View */}
              <ComparisonView />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Navigation className="animate-pulse text-primary" size={28} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold mb-2 animate-pulse dir-rtl">در حال اسکن هوشمند منطقه...</p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground dir-rtl">
          {["تحلیل پاخور", "ارزیابی ریسک", "تخمین درآمد"].map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.5 }}
              className="bg-white/5 px-3 py-1 rounded-full border border-white/5"
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center dir-rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-primary/10">
          <Layers size={48} className="text-muted-foreground/30 animate-bounce" />
        </div>
      </motion.div>
      <h2 className="text-xl font-bold mb-2">آماده تحلیل هوشمند مکان</h2>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm mb-6">
        آدرس یا مختصات پین نقشه مغازه خود را در نوار جستجوی بالا مشخص کنید تا تحلیل همه‌جانبه موقعیت شامل 
        ترافیک زمانی پاخور، تراکم رقبای فیزیکی و تخمین سود خالص محله را شروع کنیم.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: "📍", label: "مکان‌یابی زنده" },
          { icon: "📈", label: "شبیه‌ساز سود ماهانه" },
          { icon: "👥", label: "ترکیب جمعیتی عابرین" }
        ].map((item, i) => (
          <Badge key={i} variant="outline" className="text-xs gap-1.5 px-3 py-1.5 border-white/10 text-muted-foreground bg-card/20">
            <span>{item.icon}</span> {item.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
