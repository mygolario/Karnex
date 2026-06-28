"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin, Search, Loader2, Navigation, Zap, History,
  GitCompare, BarChart3, Users, Shield, Target, Lightbulb,
  DollarSign, TrendingUp, ShieldAlert, Brain, Building2,
  ScrollText, Share2, Download, CheckSquare
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LocationProvider, useLocation } from "@/components/dashboard/location/location-context";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Existing components
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

// NEW components
import { VerdictBanner } from "@/components/dashboard/location/verdict-banner";
import { LocationDnaCard } from "@/components/dashboard/location/location-dna-card";
import { SurvivalGauge } from "@/components/dashboard/location/survival-gauge";
import { RevenueProjectionChart } from "@/components/dashboard/location/revenue-projection-chart";
import { StreetIntelligence } from "@/components/dashboard/location/street-intelligence";
import { SmartAlternatives } from "@/components/dashboard/location/smart-alternatives";
import { OpeningReadiness } from "@/components/dashboard/location/opening-readiness";

import { useImmersivePage } from "@/hooks/use-immersive-page";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { toast } from "sonner";

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

// Business categories
const BUSINESS_CATEGORIES = [
  { value: "cafe", label: "☕ کافه", icon: "☕" },
  { value: "restaurant", label: "🍽️ رستوران", icon: "🍽️" },
  { value: "bakery", label: "🥐 نانوایی / شیرینی", icon: "🥐" },
  { value: "clothing", label: "👔 پوشاک", icon: "👔" },
  { value: "electronics", label: "📱 الکترونیک", icon: "📱" },
  { value: "pharmacy", label: "💊 داروخانه", icon: "💊" },
  { value: "salon", label: "✂️ آرایشگاه / سالن", icon: "✂️" },
  { value: "clinic", label: "🏥 کلینیک / مطب", icon: "🏥" },
  { value: "gym", label: "🏋️ باشگاه / ورزشی", icon: "🏋️" },
  { value: "grocery", label: "🛒 سوپرمارکت", icon: "🛒" },
  { value: "bookstore", label: "📚 کتاب‌فروشی", icon: "📚" },
  { value: "jewelry", label: "💍 جواهری", icon: "💍" },
  { value: "other", label: "🏪 سایر کسب‌وکارها", icon: "🏪" },
];

// Section nav items
const SECTIONS = [
  { id: "hero", label: "خلاصه", icon: BarChart3 },
  { id: "metrics", label: "شاخص‌ها", icon: Zap },
  { id: "financial", label: "مالی", icon: DollarSign },
  { id: "risk", label: "ریسک", icon: ShieldAlert },
  { id: "competitors", label: "رقبا", icon: Shield },
  { id: "demographics", label: "جمعیت", icon: Users },
  { id: "swot", label: "SWOT", icon: Target },
  { id: "gaps", label: "فرصت‌ها", icon: Brain },
  { id: "alternatives", label: "جایگزین‌ها", icon: MapPin },
  { id: "recommendations", label: "اقدامات", icon: Lightbulb },
  { id: "readiness", label: "افتتاح", icon: CheckSquare },
];

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

function LocationPageContent() {
  const { activeProject } = useProject();
  const { analysis, loading, analyzeLocation, history, comparisonMode, toggleComparisonMode } = useLocation();
  const isMobile = useIsMobile();
  useImmersivePage(isMobile);

  // Form state
  const [city, setCity] = useState("Tehran");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState<number>(500);
  const [priceTier, setPriceTier] = useState<string>("mid");
  const [footfallDependency, setFootfallDependency] = useState<string>("high");
  const [rentBudget, setRentBudget] = useState<number>(25000000);
  const [businessCategory, setBusinessCategory] = useState<string>("");

  // UI state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [loadingStep, setLoadingStep] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Sync inputs with loaded analysis
  useEffect(() => {
    if (analysis) {
      if (analysis.city) setCity(analysis.city);
      if (analysis.address) setAddress(analysis.address);
      if (analysis.inputs) {
        if (analysis.inputs.priceTier) setPriceTier(analysis.inputs.priceTier);
        if (analysis.inputs.footfallDependency) setFootfallDependency(analysis.inputs.footfallDependency);
        if (analysis.inputs.rentBudget) setRentBudget(analysis.inputs.rentBudget);
        if (analysis.inputs.businessCategory) setBusinessCategory(analysis.inputs.businessCategory || "");
      }
      if (analysis.businessCategory) setBusinessCategory(analysis.businessCategory);
    }
  }, [analysis]);

  // Animate loading steps
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      const steps = [
        { delay: 800, step: 1 },
        { delay: 2000, step: 2 },
        { delay: 3500, step: 3 },
        { delay: 5000, step: 4 },
      ];
      const timers = steps.map(({ delay, step }) =>
        setTimeout(() => setLoadingStep(step), delay)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [loading]);

  // Track scroll to update active section
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollTop = el.scrollTop + 100;
      let active = "hero";
      for (const [id, ref] of Object.entries(sectionRefs.current)) {
        if (ref && ref.offsetTop <= scrollTop) active = id;
      }
      setActiveSection(active);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [analysis]);

  const scrollToSection = (id: string) => {
    const ref = sectionRefs.current[id];
    const container = contentRef.current;
    if (ref && container) {
      container.scrollTo({ top: ref.offsetTop - 80, behavior: "smooth" });
    }
  };

  const handleAnalyze = async () => {
    if (!address) return;
    await analyzeLocation(city, address, radius, priceTier, footfallDependency, rentBudget, businessCategory);
  };

  const handlePinDragEnd = async (lat: number, lon: number) => {
    const coordsStr = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    setAddress(coordsStr);
    await analyzeLocation(city, coordsStr, radius, priceTier, footfallDependency, rentBudget, businessCategory);
  };

  if (!activeProject) return <div className="p-10 text-center">Please select a project first.</div>;

  const selectedCatLabel = BUSINESS_CATEGORIES.find(c => c.value === businessCategory)?.label || "دسته‌بندی کسب‌وکار";

  return (
    <div className={cn(
      "bg-background text-foreground flex overflow-hidden mobile-immersive -mx-4 -mt-3",
      isMobile ? "h-[calc(100dvh-3.5rem)] flex-col" : "min-h-screen h-screen"
    )}>
      <HistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Main scroll area */}
      <div ref={contentRef} className="flex-1 h-full overflow-y-auto min-h-0">

        {/* ── Sticky Header ── */}
        <div className={cn(
          "sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-white/5",
          isMobile ? "px-3 py-3" : "px-6 py-4"
        )}>
          <div className={cn(isMobile ? "" : "max-w-5xl mx-auto")}>

            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
                  animate={{ boxShadow: ["0 0 20px rgba(139,92,246,0.3)", "0 0 35px rgba(139,92,246,0.5)", "0 0 20px rgba(139,92,246,0.3)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <MapPin size={20} className="text-white" />
                </motion.div>
                <div>
                  <h1 data-tour-id="location-header" className="text-lg font-black tracking-tight bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                    تحلیل هوشمند موقعیت
                  </h1>
                  <p className="text-xs text-muted-foreground">{activeProject.projectName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PageTourHelp tourId="location-analyzer" />
                {history.length > 0 && (
                  <>
                    <Button
                      data-tour-id="compare-btn"
                      variant="outline" size="sm"
                      onClick={toggleComparisonMode}
                      className={cn("text-xs gap-1.5 h-8 border-white/5", comparisonMode && "border-primary/30 text-primary bg-primary/5")}
                    >
                      <GitCompare size={14} />
                      {!isMobile && "مقایسه"}
                    </Button>
                    <Button
                      data-tour-id="history-btn"
                      variant="outline" size="sm"
                      onClick={() => setHistoryOpen(!historyOpen)}
                      className={cn("text-xs gap-1.5 h-8 border-white/5", historyOpen && "border-primary/30 text-primary bg-primary/5")}
                    >
                      <History size={14} />
                      {!isMobile && `سابقه (${history.length})`}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Search row */}
            <Card data-tour-id="location-search" className="p-1.5 flex items-center gap-2 bg-card/50 backdrop-blur-xl border border-white/5 shadow-lg rounded-xl mb-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="شهر..."
                className="w-[120px] bg-transparent text-xs font-bold border-none shadow-none focus-visible:ring-0 px-2 placeholder:font-normal"
              />
              <div className="h-5 w-[1px] bg-border" />
              <div className="flex-1 relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
                <input
                  type="text"
                  placeholder="نام محله، خیابان یا کوچه..."
                  className="w-full bg-transparent p-2.5 pr-8 outline-none text-xs placeholder:text-muted-foreground/70"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <Button
                size="sm"
                className="rounded-lg h-8 px-4 shadow-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs gap-1.5 border-0"
                onClick={handleAnalyze}
                disabled={loading || !address}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                تحلیل
              </Button>
            </Card>

            {/* Parameter row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {/* Business Category */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground mr-1">نوع کسب‌وکار</span>
                <Select value={businessCategory} onValueChange={setBusinessCategory}>
                  <SelectTrigger className="bg-card/40 border-white/5 h-8 text-[11px]">
                    <SelectValue placeholder="انتخاب نوع کسب‌وکار..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/5">
                    {BUSINESS_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-xs">{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Tier */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">تراز قیمتی</span>
                <Select value={priceTier} onValueChange={setPriceTier}>
                  <SelectTrigger className="bg-card/40 border-white/5 h-8 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/5">
                    <SelectItem value="budget" className="text-xs">اقتصادی</SelectItem>
                    <SelectItem value="mid" className="text-xs">متوسط</SelectItem>
                    <SelectItem value="premium" className="text-xs">لوکس</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Footfall */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">نوع تردد</span>
                <Select value={footfallDependency} onValueChange={setFootfallDependency}>
                  <SelectTrigger className="bg-card/40 border-white/5 h-8 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/5">
                    <SelectItem value="high" className="text-xs">پاخورمحور</SelectItem>
                    <SelectItem value="destination" className="text-xs">مقصدمحور</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rent Budget */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground mr-1">بودجه اجاره (تومان)</span>
                <Input
                  type="number"
                  value={rentBudget || ""}
                  onChange={(e) => setRentBudget(Number(e.target.value))}
                  placeholder="مبلغ..."
                  className="bg-card/40 border-white/5 h-8 text-[11px] placeholder:font-normal focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className={cn("mx-auto py-6", isMobile ? "px-3 pb-24" : "max-w-5xl px-6 py-8")}>
          {loading ? (
            <LoadingState step={loadingStep} />
          ) : !analysis ? (
            <EmptyState onCategorySelect={setBusinessCategory} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10 pb-20 relative"
            >
              {/* Floating section nav — desktop only */}
              {!isMobile && (
                <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5">
                  {SECTIONS.map(sec => {
                    const Icon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        title={sec.label}
                        className={cn(
                          "group relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                          activeSection === sec.id
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : "bg-card/60 border border-white/5 text-muted-foreground hover:bg-card hover:text-foreground"
                        )}
                      >
                        <Icon size={14} />
                        <span className="absolute left-10 text-[10px] font-semibold bg-card border border-white/10 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                          {sec.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── SECTION: Hero (Verdict + Map + Score + DNA) ── */}
              <section
                ref={(el) => { sectionRefs.current.hero = el; }}
                className="space-y-4"
              >
                <VerdictBanner />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Map */}
                  <div className="lg:col-span-7 h-[350px] lg:h-[420px]">
                    <InteractiveMap
                      center={analysis.coordinates || { lat: 35.6892, lon: 51.3890 }}
                      competitors={analysis.competitorAnalysis?.directCompetitors
                        ?.filter(c => c.coordinates?.lat && c.coordinates?.lon)
                        .map(c => ({ name: c.name, lat: c.coordinates!.lat, lon: c.coordinates!.lon }))}
                      radius={radius}
                      onPinDragEnd={handlePinDragEnd}
                    />
                  </div>

                  {/* Right column: Score + DNA */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <Card className="p-5 bg-card/30 border-white/5 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-md">
                      <ScoreGauge score={analysis.score} />
                      <h3 className="font-black text-sm mt-3 text-foreground">نمره تناسب صنف</h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed text-justify px-2">
                        {analysis.scoreReason}
                      </p>
                    </Card>
                    <LocationDnaCard />
                  </div>
                </div>

                {/* Neighborhood + Street Intelligence */}
                <NeighborhoodCard />
                <StreetIntelligence />
              </section>

              {/* ── SECTION: Key Metrics ── */}
              <section ref={(el) => { sectionRefs.current.metrics = el; }} className="space-y-2">
                <SectionHeader icon={Zap} label="شاخص‌های کلیدی" color="text-cyan-400" />
                <MetricCards />
              </section>

              {/* ── SECTION: Financial ── */}
              <section ref={(el) => { sectionRefs.current.financial = el; }} className="space-y-4">
                <SectionHeader icon={DollarSign} label="تحلیل مالی و درآمدی" color="text-emerald-400" />
                <RevenueProjectionChart />
                <FinancialSimulator initialRent={rentBudget} />
              </section>

              {/* ── SECTION: Risk + Survival ── */}
              <section ref={(el) => { sectionRefs.current.risk = el; }} className="space-y-4">
                <SectionHeader icon={ShieldAlert} label="ریسک و احتمال بقا" color="text-rose-400" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RiskGauge />
                  <SurvivalGauge />
                </div>
              </section>

              {/* ── SECTION: Competitors ── */}
              <section ref={(el) => { sectionRefs.current.competitors = el; }} className="space-y-2">
                <SectionHeader icon={Shield} label="رقبا و رادار رقابتی" color="text-blue-400" />
                <CompetitorTable />
              </section>

              {/* ── SECTION: Demographics ── */}
              <section ref={(el) => { sectionRefs.current.demographics = el; }} className="space-y-2">
                <SectionHeader icon={Users} label="جمعیت‌شناسی و ترافیک" color="text-violet-400" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DemographicsDashboard />
                  <AnalysisCharts />
                </div>
              </section>

              {/* ── SECTION: SWOT ── */}
              <section ref={(el) => { sectionRefs.current.swot = el; }} className="space-y-2">
                <SectionHeader icon={Target} label="ماتریس SWOT" color="text-amber-400" />
                <SwotGrid />
              </section>

              {/* ── SECTION: Market Gaps ── */}
              <section ref={(el) => { sectionRefs.current.gaps = el; }} className="space-y-2">
                <SectionHeader icon={Brain} label="فرصت‌های بازار" color="text-pink-400" />
                <MarketGapCards />
              </section>

              {/* ── SECTION: Smart Alternatives ── */}
              <section ref={(el) => { sectionRefs.current.alternatives = el; }} className="space-y-2">
                <SmartAlternatives />
              </section>

              {/* ── SECTION: Recommendations ── */}
              <section ref={(el) => { sectionRefs.current.recommendations = el; }} className="space-y-2">
                <SectionHeader icon={Lightbulb} label="اقدامات پیشنهادی" color="text-yellow-400" />
                <RecommendationsList />
              </section>

              {/* ── SECTION: Opening Readiness ── */}
              <section ref={(el) => { sectionRefs.current.readiness = el; }} className="space-y-2">
                <SectionHeader icon={CheckSquare} label="چک‌لیست آمادگی افتتاح" color="text-teal-400" />
                <OpeningReadiness />
              </section>

              {/* Comparison View */}
              <ComparisonView />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 dir-rtl mb-1">
      <div className={cn("w-1 h-6 rounded-full bg-gradient-to-b", color.replace("text-", "bg-").replace("-400", "-500") + " to-transparent opacity-80")} />
      <Icon size={16} className={color} />
      <h3 className="font-bold text-sm text-foreground">{label}</h3>
    </div>
  );
}

const LOADING_STEPS = [
  { icon: "🗺️", label: "در حال اسکن نقشه منطقه..." },
  { icon: "🏪", label: "شناسایی رقبای اطراف..." },
  { icon: "📊", label: "محاسبه شاخص‌های مالی و ریسک..." },
  { icon: "🧠", label: "تولید تحلیل هوشمند شخصی‌سازی‌شده..." },
  { icon: "✨", label: "نهایی‌سازی گزارش جامع..." },
];

function LoadingState({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 space-y-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 border-b-indigo-500 animate-spin absolute inset-0" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)].icon}
        </div>
      </div>

      <div className="text-center space-y-4 dir-rtl">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-bold text-foreground"
        >
          {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)].label}
        </motion.p>

        <div className="flex flex-col gap-2 text-xs">
          {LOADING_STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-500",
                i <= step
                  ? "bg-violet-500/15 border border-violet-500/20 text-violet-300"
                  : "bg-white/[0.03] border border-white/5 text-muted-foreground/50"
              )}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              {i < step && <span className="mr-auto text-emerald-400">✓</span>}
              {i === step && <Loader2 size={10} className="animate-spin mr-auto text-violet-400" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCategorySelect }: { onCategorySelect: (cat: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center dir-rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <div className="relative mx-auto w-28 h-28 mb-6">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 border border-violet-500/15 flex items-center justify-center">
            <MapPin size={52} className="text-violet-400/60" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain size={16} className="text-white" />
          </motion.div>
        </div>
      </motion.div>

      <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
        تحلیل هوشمند موقعیت
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm mb-8">
        دسته‌بندی کسب‌وکار خود را انتخاب کنید، آدرس یا محله را وارد کنید و دکمه «تحلیل» را بزنید تا گزارش شخصی‌سازی‌شده دریافت کنید.
      </p>

      {/* Quick category pick */}
      <div className="mb-8">
        <p className="text-xs text-muted-foreground mb-3 font-semibold">یا یک دسته‌بندی را انتخاب کنید:</p>
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {BUSINESS_CATEGORIES.slice(0, 8).map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategorySelect(cat.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300 transition-all"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: "🎯", label: "حکم قطعی برو / نرو" },
          { icon: "📈", label: "پیش‌بینی ۱۲ ماهه درآمد" },
          { icon: "🧬", label: "DNA موقعیت" },
          { icon: "💀", label: "احتمال بقای صنف" },
          { icon: "🗺️", label: "راهنمای خیابانی" },
          { icon: "📍", label: "موقعیت‌های جایگزین" },
        ].map((item, i) => (
          <Badge key={i} variant="outline" className="text-xs gap-1.5 px-3 py-1.5 border-white/10 text-muted-foreground bg-card/20">
            <span>{item.icon}</span> {item.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
