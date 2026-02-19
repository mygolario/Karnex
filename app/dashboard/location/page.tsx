"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin, Search, Loader2, Navigation, Layers, Zap, History,
  GitCompare, BarChart3, Users, Shield, Target, Lightbulb
} from "lucide-react";
import Link from "next/link";
import { LocationProvider, useLocation } from "@/components/dashboard/location/location-context";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// New Components
import { ScoreGauge } from "@/components/dashboard/location/score-gauge";
import { NeighborhoodCard } from "@/components/dashboard/location/neighborhood-card";
import { MetricCards } from "@/components/dashboard/location/metric-cards";
import { CompetitorTable } from "@/components/dashboard/location/competitor-table";
import { DemographicsDashboard } from "@/components/dashboard/location/demographics-dashboard";
import { SwotGrid } from "@/components/dashboard/location/swot-grid";
import { RiskGauge } from "@/components/dashboard/location/risk-gauge";
import { MarketGapCards } from "@/components/dashboard/location/market-gap-cards";
import { RecommendationsList } from "@/components/dashboard/location/recommendations-list";
import { ComparisonView } from "@/components/dashboard/location/comparison-view";
import { HistorySidebar } from "@/components/dashboard/location/history-sidebar";
import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";

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
  { id: "overview", label: "خلاصه", icon: BarChart3 },

  { id: "demographics", label: "جمعیت", icon: Users },
  { id: "swot", label: "SWOT", icon: Target },
  { id: "recommendations", label: "پیشنهادات", icon: Lightbulb },
];

function LocationPageContent() {
  const { activeProject } = useProject();
  const { analysis, loading, analyzeLocation, history, comparisonMode, toggleComparisonMode } = useLocation();
  const [city, setCity] = useState("Tehran");
  const [address, setAddress] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!address) return;
    await analyzeLocation(city, address);
  };

  if (!activeProject) return <div className="p-10 text-center">Please select a project first.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex h-screen overflow-hidden">
      
      {/* History Sidebar */}
      <HistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="max-w-5xl mx-auto">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
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
                        "text-xs gap-1.5 h-8",
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
                        "text-xs gap-1.5 h-8",
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

            {/* Search Bar */}
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
                  placeholder="نام محله یا خیابان اصلی..."
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
                تحلیل
              </Button>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-6 py-8">
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
              {/* Hero: Score + Neighborhood Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <ScoreGauge score={analysis.score} />
                  <p className="text-xs text-muted-foreground text-center mt-3 max-w-[200px] leading-relaxed">
                    {analysis.scoreReason}
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <NeighborhoodCard />
                </div>
              </div>

              {/* Tab Bar */}
              <div data-tour-id="location-tabs" className="flex items-center gap-1 p-1 bg-card/30 rounded-xl border border-white/5 overflow-x-auto">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-md"
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
                    <div className="space-y-8">
                      <MetricCards />
                      <RiskGauge />
                      <MarketGapCards />
                    </div>
                  )}

                  {activeTab === "demographics" && <DemographicsDashboard />}
                  {activeTab === "swot" && <SwotGrid />}
                  {activeTab === "recommendations" && <RecommendationsList />}
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
        <p className="text-lg font-bold mb-2 animate-pulse">در حال اسکن هوشمند منطقه...</p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          {["تحلیل پاخور", "ارزیابی ریسک", "تخمین درآمد"].map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.5 }}
              className="bg-white/5 px-3 py-1 rounded-full"
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
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-primary/10">
          <Layers size={48} className="text-muted-foreground/30" />
        </div>
      </motion.div>
      <h2 className="text-xl font-bold mb-2">آماده تحلیل هوشمند</h2>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm mb-6">
        نام محله یا خیابان مورد نظر خود را در نوار بالا وارد کنید تا تحلیل جامع موقعیت شامل 
        پاخور، ریسک و فرصت‌های سرمایه‌گذاری دریافت کنید.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: "📊", label: "امتیاز مکان" },
        ].map((item, i) => (
          <Badge key={i} variant="outline" className="text-xs gap-1.5 px-3 py-1.5 border-white/10 text-muted-foreground">
            <span>{item.icon}</span> {item.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
