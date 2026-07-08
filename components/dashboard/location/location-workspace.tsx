"use client";

import { useState, useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { useLocation } from "./location-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  History,
  GitCompare,
  Download,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Eye,
  DollarSign,
  Users,
  Target,
  ShieldAlert,
  Map,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HistorySidebar } from "./history-sidebar";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { VerdictChip } from "./verdict-command-center";
import { LocationAiChat } from "./location-ai-chat";
import { MobileLocationSummary } from "./mobile-summary";
import { LocationWizard } from "./location-wizard";
import { InteractiveMap } from "./interactive-map";
import { VisionAnalyzer } from "./vision-analyzer";
import { FinancialSimulator } from "./financial-simulator";
import { SmartAlternatives } from "./smart-alternatives";
import { VerdictCommandCenter } from "./verdict-command-center";
import { ExecutiveSummaryCard } from "./executive-summary-card";
import { FitScoreBreakdown } from "./fit-score-breakdown";
import { StreetContextPanel } from "./street-context-panel";
import { NeighborhoodCard } from "./neighborhood-card";
import { CompetitorTable } from "./competitor-table";
import { CompetitorList } from "./competitor-list";
import { DemographicsDashboard } from "./demographics-dashboard";
import { CustomersTab } from "./tabs/customers-tab";
import { RiskTab } from "./tabs/risk-tab";
import { StrategyTab } from "./tabs/strategy-tab";
import { exportLocationPdf } from "@/lib/location/pdf-export";
import { toast } from "sonner";

const QUICK_NAV = [
  { id: "verdict", label: "خلاصه و رأی", icon: Compass },
  { id: "vision", label: "آنالیز ویترین", icon: Eye },
  { id: "financials", label: "شبیه‌ساز مالی", icon: DollarSign },
  { id: "demographics", label: "مشتریان و پاخور", icon: Users },
  { id: "competitors", label: "رقبا و اشباع", icon: Target },
  { id: "risks", label: "ریسک‌ها و استراتژی", icon: ShieldAlert },
  { id: "alternatives", label: "گزینه‌های جایگزین", icon: MapPin },
];

const LOADING_STEPS = [
  { icon: "🗺️", label: "در حال مسیریابی و اسکن نقشه نشان..." },
  { icon: "🏪", label: "شناسایی و خوشه‌بندی رقبا..." },
  { icon: "📊", label: "محاسبه توجیه مالی و نقطه سر‌به‌سر..." },
  { icon: "🧠", label: "اجرای مدل هوشمند مکان‌یابی Karnex..." },
  { icon: "✨", label: "نهایی‌سازی سناریوهای سوددهی..." },
];

export function LocationWorkspace() {
  const { activeProject } = useProject();
  const {
    analysis,
    loading,
    analyzeLocation,
    history,
    comparisonMode,
    toggleComparisonMode,
    loadDemoAnalysis,
  } = useLocation();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [activeSection, setActiveSection] = useState("verdict");

  // Ref to track scroll positions of sections
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const timers = [800, 2000, 3500, 5000].map((delay, i) =>
      setTimeout(() => setLoadingStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleAnalyze = async (params: {
    city: string;
    address: string;
    businessDescription: string;
    options: {
      priceTier: "budget" | "mid" | "premium";
      footfallDependency: "high" | "destination";
      rentBudget: number;
      businessCategory: string;
    };
  }) => {
    setShowWizard(false);
    await analyzeLocation(
      params.city,
      params.address,
      params.businessDescription,
      params.options
    );
  };

  const handleExport = async () => {
    if (!analysis) return;
    try {
      await exportLocationPdf(analysis, activeProject?.projectName || "Karnex");
      toast.success("گزارش PDF با موفقیت دانلود شد");
    } catch {
      toast.error("خطا در خروجی PDF");
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const showWizardScreen = !analysis || showWizard;

  return (
    <div className="bg-slate-950 text-foreground flex flex-col md:flex-row overflow-hidden -mx-4 -mt-3 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
      <HistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <LocationAiChat open={chatOpen && !!analysis} onClose={() => setChatOpen(false)} />

      {/* Loading state screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-[500] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">در حال شبیه‌سازی و تحلیل موقعیت</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
              هوش مصنوعی Karnex با دریافت داده‌های زنده نقشه نشان و مشخصات صنف شما، در حال تدوین سناریوهای سوددهی است.
            </p>
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl min-w-[280px]">
              <div className="text-2xl mb-2">
                {LOADING_STEPS[Math.min(loadingStep, LOADING_STEPS.length - 1)].icon}
              </div>
              <span className="text-xs text-indigo-400 font-bold animate-pulse">
                {LOADING_STEPS[Math.min(loadingStep, LOADING_STEPS.length - 1)].label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIZARD ONBOARDING OR FULL CONTROL VIEW */}
      {showWizardScreen ? (
        <div className="flex-1 overflow-y-auto py-10 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto w-full text-center px-4 mb-4">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 items-center justify-center mb-4">
              <MapPin size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">تحلیل‌گر موقعیت و مکان یابی Karnex</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
              تطبیق فیزیکی و مالی محل کسب‌وکار با ویژگی‌های صنف شما با استفاده از هوش مصنوعی و داده‌های زنده نشان.
            </p>
          </div>
          
          <LocationWizard
            isLoading={loading}
            onAnalyze={handleAnalyze}
            initialValues={{
              city: analysis?.city,
              address: analysis?.address,
              businessDescription: analysis?.businessDescription,
            }}
          />

          {history.length > 0 && (
            <div className="max-w-2xl mx-auto w-full px-4 text-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-indigo-400 hover:text-indigo-300 gap-1.5"
                onClick={() => setShowWizard(false)}
              >
                <ArrowRight size={14} />
                بازگشت به آخرین تحلیل
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* RIGHT PANEL: Scrollable Reports (58% width on desktop) */}
          <div
            ref={rightPanelRef}
            className="w-full md:w-[58%] h-1/2 md:h-full overflow-y-auto border-l border-white/5 flex flex-col bg-slate-950 order-2 md:order-1"
          >
            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white truncate max-w-[200px]">
                    {analysis.address || "تحلیل موقعیت"}
                  </h1>
                  <span className="text-[10px] text-muted-foreground">{analysis.city}</span>
                </div>
              </div>

              {/* Actions strip */}
              <div className="flex items-center gap-1.5">
                <VerdictChip />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white"
                  onClick={handleExport}
                >
                  <Download size={13} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] border-white/5 hover:bg-white/5 text-indigo-400 hover:text-indigo-300"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageSquare size={13} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] border-white/5 hover:bg-white/5 text-muted-foreground hover:text-white"
                  onClick={() => setHistoryOpen(true)}
                >
                  <History size={13} />
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white gap-1"
                  onClick={() => setShowWizard(true)}
                >
                  <Sparkles size={12} className="animate-pulse" />
                  <span>تحلیل جدید</span>
                </Button>
              </div>
            </div>

            {/* Quick Sticky Section Navigation */}
            <div className="sticky top-[73px] z-10 bg-slate-950/90 border-b border-white/5 px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {QUICK_NAV.map((nav) => {
                const Icon = nav.icon;
                const active = activeSection === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => scrollToSection(nav.id)}
                    className={cn(
                      "text-[10px] px-3 py-1.5 rounded-lg border shrink-0 transition-all flex items-center gap-1.5",
                      active
                        ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                        : "bg-slate-900/40 border-white/5 text-muted-foreground hover:bg-slate-900"
                    )}
                  >
                    <Icon size={12} />
                    {nav.label}
                  </button>
                );
              })}
            </div>

            {/* Stacked Report Sections */}
            <div className="p-6 space-y-10 pb-24">
              
              {/* SECTION 1: Verdict & Main Score */}
              <div id="section-verdict" className="space-y-6">
                <VerdictCommandCenter />
                <ExecutiveSummaryCard onNavigateTab={scrollToSection} />
                <FitScoreBreakdown />
                <StreetContextPanel />
              </div>

              {/* SECTION 2: Facade & Vision AI */}
              <div id="section-vision" className="space-y-4 border-t border-white/5 pt-8">
                <VisionAnalyzer />
              </div>

              {/* SECTION 3: Financial Simulator */}
              <div id="section-financials" className="space-y-4 border-t border-white/5 pt-8">
                <FinancialSimulator initialRent={analysis.inputs?.rentBudget} />
              </div>

              {/* SECTION 4: Customers & Demographics */}
              <div id="section-demographics" className="space-y-4 border-t border-white/5 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-violet-400" />
                  <h3 className="font-black text-sm text-white">جامعه مشتریان هدف و پاخور لوکیشن</h3>
                </div>
                <CustomersTab />
              </div>

              {/* SECTION 5: Competitor Saturation */}
              <div id="section-competitors" className="space-y-4 border-t border-white/5 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-indigo-400" />
                  <h3 className="font-black text-sm text-white">تحلیل میزان اشباع و رقبای محلی</h3>
                </div>
                <CompetitorTable />
                <CompetitorList />
              </div>

              {/* SECTION 6: Risks & SWOT Strategy */}
              <div id="section-risks" className="space-y-4 border-t border-white/5 pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={16} className="text-rose-400" />
                  <h3 className="font-black text-sm text-white">ارزیابی ریسک‌ها و تدوین استراتژی مغازه</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RiskTab />
                  <StrategyTab />
                </div>
              </div>

              {/* SECTION 7: Smart Alternatives */}
              <div id="section-alternatives" className="space-y-4 border-t border-white/5 pt-8">
                <SmartAlternatives />
              </div>

            </div>
          </div>

          {/* LEFT PANEL: Sticky Full Height Map (42% width on desktop) */}
          <div className="w-full md:w-[42%] h-1/2 md:h-full relative order-1 md:order-2">
            <InteractiveMap
              center={analysis.coordinates || { lat: 35.6892, lon: 51.3890 }}
              competitors={
                analysis.competitorAnalysis?.directCompetitors
                  ?.filter((c) => c.coordinates?.lat && c.coordinates?.lon)
                  .map((c) => ({
                    name: c.name,
                    lat: c.coordinates!.lat,
                    lon: c.coordinates!.lon,
                  })) || []
              }
              alternatives={analysis.alternatives || []}
              radius={analysis.catchment?.radiusM || 500}
              onPinDragEnd={async (lat, lon) => {
                await analyzeLocation(
                  analysis.city,
                  `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
                  analysis.businessDescription || "",
                  {
                    radius: analysis.catchment?.radiusM,
                    priceTier: analysis.inputs?.priceTier,
                    footfallDependency: analysis.inputs?.footfallDependency,
                    rentBudget: analysis.inputs?.rentBudget,
                    businessCategory: analysis.businessCategory,
                    storefrontPhoto: analysis.storefront?.photoDataUrl || "",
                  }
                );
              }}
              mapStyle="dark"
              showLayerToggle
            />
          </div>
        </>
      )}
    </div>
  );
}
