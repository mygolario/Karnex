"use client";

import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { LocationProvider, useLocation } from "@/components/dashboard/location/location-context";
import { LocationScore } from "@/components/dashboard/location/location-score";
import { DemographicsCard } from "@/components/dashboard/location/demographics-card";
import { CompetitorList } from "@/components/dashboard/location/competitor-list";
import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";
import { useState } from "react";
import { toast } from "sonner";
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
    const { analyzeLocation, loading, analysis } = useLocation();
    const [selectedCity, setSelectedCity] = useState("tehran");
    const [address, setAddress] = useState("");

    const handleAnalyze = async () => {
        if (!address) {
            toast.error("آدرس یا محله را وارد کنید");
            return;
        }
        await analyzeLocation(selectedCity, address);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <PageTourHelp tourId="location-analyzer" />
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20" data-tour-id="location-header">
                    <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                    <h1 className="text-2xl font-black text-foreground">تحلیلگر منطقه هوشمند</h1>
                    <p className="text-muted-foreground text-sm">شناسایی بهترین مکان‌ها، تحلیل رقبا و پیش‌بینی مشتریان</p>
                    </div>
                </div>
            </div>

            {/* Input Section */}
            <Card className="p-6" data-tour-id="location-inputs">
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
                    <option value="karaj">کرج</option>
                    <option value="ahvaz">اهواز</option>
                    <option value="rasht">رشت</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">محله یا آدرس دقیق</label>
                    <div className="relative">
                    <MapPin className="absolute right-3 top-3 text-muted-foreground max-w-[20px]" size={18} />
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
                    className="w-full h-[42px] bg-gradient-to-r from-primary to-secondary gap-2 shadow-lg shadow-primary/25"
                    onClick={handleAnalyze}
                    disabled={loading}
                    data-tour-id="analyze-btn"
                    >
                    {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                    تحلیل منطقه
                    </Button>
                </div>
                </div>
            </Card>

            {/* Analysis Results */}
            {analysis && (
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
                >
                    <LocationScore />
                    <DemographicsCard />
                    <CompetitorList />
                </motion.div>
            )}

            {!analysis && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 pointer-events-none filter blur-sm select-none" data-tour-id="results-placeholder">
                    {/* Placeholder blurred content for visual cue */}
                    <Card className="p-32 col-span-full border-dashed flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                        <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl text-muted-foreground font-medium">منتظر دریافت آدرس برای تحلیل...</p>
                    </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
