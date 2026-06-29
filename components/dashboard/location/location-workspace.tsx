"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { useLocation } from "./location-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Search,
  Loader2,
  History,
  GitCompare,
  Download,
  MessageSquare,
  LayoutDashboard,
  Map,
  Users,
  DollarSign,
  ShieldAlert,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HistorySidebar } from "./history-sidebar";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { VerdictChip } from "./verdict-command-center";
import { LocationAiChat } from "./location-ai-chat";
import { MobileLocationSummary } from "./mobile-summary";
import { OverviewTab } from "./tabs/overview-tab";
import { MapTab } from "./tabs/map-tab";
import { CustomersTab } from "./tabs/customers-tab";
import { FinancialTab } from "./tabs/financial-tab";
import { RiskTab } from "./tabs/risk-tab";
import { StrategyTab } from "./tabs/strategy-tab";
import { CompareTab } from "./tabs/compare-tab";
import { useImmersivePage } from "@/hooks/use-immersive-page";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { DEMO_LOCATION_ANALYSES } from "@/lib/location/demo-analyses";
import { exportLocationPdf } from "@/lib/location/pdf-export";
import { toast } from "sonner";

const TAB_ITEMS = [
  { id: "overview", label: "خلاصه", icon: LayoutDashboard },
  { id: "map", label: "نقشه", icon: Map },
  { id: "customers", label: "مشتری", icon: Users },
  { id: "financial", label: "مالی", icon: DollarSign },
  { id: "risk", label: "ریسک", icon: ShieldAlert },
  { id: "strategy", label: "استراتژی", icon: Target },
  { id: "compare", label: "مقایسه", icon: GitCompare },
];

const LOADING_STEPS = [
  { icon: "🗺️", label: "اسکن نقشه OSM..." },
  { icon: "🏪", label: "شناسایی رقبا..." },
  { icon: "📊", label: "محاسبه مالی و ریسک..." },
  { icon: "🧠", label: "تحلیل شخصی‌سازی‌شده..." },
  { icon: "✨", label: "نهایی‌سازی گزارش..." },
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
    comparisonItems,
    loadDemoAnalysis,
  } = useLocation();

  const isMobile = useIsMobile();
  useImmersivePage(isMobile);

  const [city, setCity] = useState("Tehran");
  const [address, setAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [chatOpen, setChatOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [radius] = useState(500);

  useEffect(() => {
    if (analysis) {
      if (analysis.city) setCity(analysis.city);
      if (analysis.address) setAddress(analysis.address);
      if (analysis.businessDescription) setBusinessDescription(analysis.businessDescription);
      else if (analysis.inputs?.businessDescription)
        setBusinessDescription(analysis.inputs.businessDescription);
    } else if (activeProject?.overview) {
      setBusinessDescription(activeProject.overview.slice(0, 120));
    }
  }, [analysis, activeProject?.overview]);

  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const timers = [800, 2000, 3500, 5000].map((delay, i) =>
      setTimeout(() => setLoadingStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleAnalyze = () => {
    if (!address.trim()) return;
    void analyzeLocation(city, address, businessDescription);
  };

  const handleExport = async () => {
    if (!analysis) return;
    try {
      await exportLocationPdf(analysis, activeProject?.projectName || "Karnex");
      toast.success("PDF دانلود شد");
    } catch {
      toast.error("خطا در PDF");
    }
  };

  const showCompareTab = comparisonItems.length >= 1 || comparisonMode;

  return (
    <div
      className={cn(
        "bg-background text-foreground flex overflow-hidden mobile-immersive -mx-4 -mt-3",
        isMobile ? "h-[calc(100dvh-3.5rem)] flex-col" : "min-h-screen h-screen"
      )}
    >
      <HistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <LocationAiChat open={chatOpen && !!analysis} onClose={() => setChatOpen(false)} />

      <div className="flex-1 h-full overflow-y-auto min-h-0">
        <div
          className={cn(
            "sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-white/5",
            isMobile ? "px-3 py-3" : "px-6 py-4"
          )}
        >
          <div className={cn(isMobile ? "" : "max-w-6xl mx-auto")}>
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h1
                    data-tour-id="location-header"
                    className="text-lg font-black tracking-tight truncate"
                  >
                    تحلیل هوشمند موقعیت
                  </h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeProject?.projectName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                {analysis && activeTab !== "overview" && <VerdictChip />}
                <PageTourHelp tourId="location-analyzer" />
                {analysis && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={handleExport}
                    >
                      <Download size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageSquare size={14} />
                    </Button>
                  </>
                )}
                {history.length > 0 && (
                  <>
                    <Button
                      data-tour-id="compare-btn"
                      variant="outline"
                      size="sm"
                      className={cn("h-8 text-xs", comparisonMode && "border-primary/30")}
                      onClick={toggleComparisonMode}
                    >
                      <GitCompare size={14} />
                    </Button>
                    <Button
                      data-tour-id="history-btn"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setHistoryOpen(true)}
                    >
                      <History size={14} />
                      {!isMobile && `(${history.length})`}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Card
              data-tour-id="location-search"
              className="p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-card/50 border-white/5 rounded-xl mb-2"
            >
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="شهر"
                className="sm:w-[100px] bg-transparent text-xs border-none shadow-none h-9"
              />
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="محله، خیابان..."
                className="flex-1 bg-transparent text-xs border-none shadow-none h-9"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <Input
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="توضیح کسب‌وکار (مثلاً کافه specialty)"
                className="flex-1 bg-transparent text-xs border-none shadow-none h-9"
              />
              <Button
                size="sm"
                className="h-9 px-4 bg-gradient-to-r from-violet-600 to-indigo-600"
                onClick={handleAnalyze}
                disabled={loading || !address.trim()}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}
                تحلیل
              </Button>
            </Card>
          </div>
        </div>

        <div className={cn("mx-auto py-6", isMobile ? "px-3 pb-24" : "max-w-6xl px-6")}>
          {loading ? (
            <LoadingState step={loadingStep} />
          ) : !analysis ? (
            <EmptyState
              onDemo={loadDemoAnalysis}
              onFillExample={(cityVal, addr, biz) => {
                setCity(cityVal);
                setAddress(addr);
                setBusinessDescription(biz);
              }}
            />
          ) : isMobile ? (
            <MobileLocationSummary />
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="dir-rtl"
              data-tour-id="location-tabs"
            >
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/30 p-1 mb-6">
                {TAB_ITEMS.filter((t) => t.id !== "compare" || showCompareTab).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="text-xs gap-1.5 data-[state=active]:bg-primary/15"
                    >
                      <Icon size={14} />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="overview" className="mt-0">
                    <OverviewTab
                      onNavigateTab={setActiveTab}
                      onOpenChat={() => setChatOpen(true)}
                      radius={analysis.catchment?.radiusM || radius}
                    />
                  </TabsContent>
                  <TabsContent value="map" className="mt-0">
                    <MapTab radius={analysis.catchment?.radiusM || radius} />
                  </TabsContent>
                  <TabsContent value="customers" className="mt-0">
                    <CustomersTab />
                  </TabsContent>
                  <TabsContent value="financial" className="mt-0">
                    <FinancialTab initialRent={analysis.inputs?.rentBudget} />
                  </TabsContent>
                  <TabsContent value="risk" className="mt-0">
                    <RiskTab />
                  </TabsContent>
                  <TabsContent value="strategy" className="mt-0">
                    <StrategyTab />
                  </TabsContent>
                  {showCompareTab && (
                    <TabsContent value="compare" className="mt-0">
                      <CompareTab />
                    </TabsContent>
                  )}
                </motion.div>
              </AnimatePresence>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center py-24 space-y-6">
      <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
      <p className="text-sm font-bold">
        {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)].label}
      </p>
    </div>
  );
}

function EmptyState({
  onDemo,
  onFillExample,
}: {
  onDemo: (a: import("@/lib/db").LocationAnalysis) => void;
  onFillExample: (city: string, address: string, biz: string) => void;
}) {
  return (
    <div className="flex flex-col items-center py-20 text-center dir-rtl max-w-lg mx-auto">
      <MapPin size={48} className="text-violet-400/50 mb-4" />
      <h2 className="text-xl font-black mb-2">قبل از امضای lease — در ۲ دقیقه بدانید</h2>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        شهر، آدرس و یک خط توضیح کسب‌وکار را وارد کنید. Karnex با داده OSM واقعی و پروفایل
        پروژه شما تحلیل می‌کند.
      </p>
      <p className="text-xs text-muted-foreground mb-3 w-full text-right font-semibold">
        نمونه‌های آماده:
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {DEMO_LOCATION_ANALYSES.map((demo) => (
          <button
            key={demo.id}
            type="button"
            onClick={() => onDemo(demo.analysis)}
            className="text-xs px-3 py-1.5 rounded-full border border-white/10 hover:border-violet-500/30 hover:bg-violet-500/10"
          >
            {demo.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {DEMO_LOCATION_ANALYSES.map((demo) => (
          <button
            key={`fill-${demo.id}`}
            type="button"
            onClick={() =>
              onFillExample(
                demo.analysis.city,
                demo.analysis.address,
                demo.analysis.businessDescription || ""
              )
            }
            className="text-[10px] text-primary underline"
          >
            پر کردن: {demo.label}
          </button>
        ))}
      </div>
    </div>
  );
}
