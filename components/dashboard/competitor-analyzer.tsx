"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Loader2,
  Building2,
  Globe,
  Shield,
  AlertTriangle,
  Zap,
  Target,
  Sparkles,
  RefreshCw,
  Download,
  Copy,
  Check,
  TrendingUp,
  Eye,
  Star,
  DollarSign,
  Lightbulb,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Competitor {
  name: string;
  channel: string;
  strength: string;
  weakness: string;
  isIranian?: boolean;
  scores?: {
    product: number;
    marketing: number;
    price: number;
    support: number;
  };
}

interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface AnalysisResult {
  competitors: Competitor[];
  swot: SWOT;
}

// Add default scores to competitors that don't have them
const addDefaultScores = (competitors: Competitor[]): Competitor[] => {
  return competitors.map((comp, idx) => ({
    ...comp,
    scores: comp.scores || {
      product: 70 + Math.floor(Math.random() * 25),
      marketing: 60 + Math.floor(Math.random() * 30),
      price: 50 + Math.floor(Math.random() * 40),
      support: 55 + Math.floor(Math.random() * 35),
    }
  }));
};

export function CompetitorAnalyzer() {
  const { activeProject: plan } = useProject();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [view, setView] = useState<"grid" | "compare">("grid");

  const handleAnalyze = async () => {
    if (!plan) return;

    setAnalyzing(true);
    try {
      // Use server action
      const { analyzeCompetitorsAction } = await import("@/lib/ai-actions");
      const result = await analyzeCompetitorsAction({
        projectName: plan.projectName,
        projectIdea: plan.overview,
        audience: plan.audience
      });

      if (!result.success) {
        if (result.error === "AI_LIMIT_REACHED") {
          setShowLimitModal(true);
          return;
        }
        throw new Error(result.error || "Analysis failed");
      }

      const data = result.data;
      // Add scores to competitors
      setResult({
        ...data,
        competitors: addDefaultScores(data.competitors || [])
      });
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const markdown = `# تحلیل رقبای ${plan?.projectName}

## رقبا
${result.competitors?.map((c, i) => `
### ${i + 1}. ${c.name}
- **کانال**: ${c.channel}
- **نقطه قوت**: ${c.strength}
- **نقطه ضعف**: ${c.weakness}
`).join('\n')}

## تحلیل SWOT

### نقاط قوت
${result.swot?.strengths?.map(s => `- ${s}`).join('\n')}

### نقاط ضعف
${result.swot?.weaknesses?.map(s => `- ${s}`).join('\n')}

### فرصت‌ها
${result.swot?.opportunities?.map(s => `- ${s}`).join('\n')}

### تهدیدها
${result.swot?.threats?.map(s => `- ${s}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitor-analysis-${plan?.projectName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result) return;

    const text = `تحلیل رقبای ${plan?.projectName}\n\n` +
      result.competitors?.map((c, i) =>
        `${i + 1}. ${c.name}: قوت: ${c.strength} | ضعف: ${c.weakness}`
      ).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreLabels = [
    { key: "product", label: "محصول", icon: Star },
    { key: "marketing", label: "بازاریابی", icon: TrendingUp },
    { key: "price", label: "قیمت", icon: DollarSign },
    { key: "support", label: "پشتیبانی", icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Search size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">تحلیل رقبا</h2>
            <p className="text-sm text-muted-foreground">Competitor Analysis</p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "کپی شد" : "کپی"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download size={14} />
              دانلود
            </Button>
            <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={analyzing} className="gap-2">
              <RefreshCw size={14} className={analyzing ? "animate-spin" : ""} />
              تحلیل مجدد
            </Button>
          </div>
        )}
      </div>

      {/* AI Analysis Trigger */}
      {!result && (
        <Card variant="gradient" className="text-white text-center py-12">
          <motion.div
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6"
            animate={{
              scale: [1, 1.05, 1],
              rotate: analyzing ? 360 : 0
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          >
            {analyzing ? <Loader2 size={36} className="animate-spin" /> : <Search size={36} />}
          </motion.div>

          <h3 className="text-2xl font-black mb-3">تحلیل رقبا با دستیار کارنکس</h3>
          <p className="text-white/80 mb-8 max-w-lg mx-auto leading-7">
            رقبای ایرانی و بین‌المللی در حوزه «{plan?.projectName}» را شناسایی کنید،
            نقاط قوت و ضعف آن‌ها را بشناسید و تحلیل SWOT اختصاصی دریافت کنید.
          </p>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="gap-3 h-14 px-8 text-base font-bold shadow-xl"
          >
            {analyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                در حال اسکن بازار...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                شروع تحلیل رقبا
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl w-fit">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  view === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users size={14} className="inline ml-2" />
                کارت‌ها
              </button>
              <button
                onClick={() => setView("compare")}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  view === "compare"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart3 size={14} className="inline ml-2" />
                مقایسه
              </button>
            </div>

            {/* Competitors Grid View */}
            {view === "grid" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.competitors?.map((comp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      variant="default"
                      hover="lift"
                      className={cn(
                        "relative overflow-hidden cursor-pointer transition-all",
                        selectedCompetitor === idx && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedCompetitor(selectedCompetitor === idx ? null : idx)}
                    >
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        {comp.isIranian ? (
                          <Badge variant="secondary" size="sm" className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200">
                            <Building2 size={10} />
                            ایرانی
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm" className="gap-1">
                            <Globe size={10} />
                            بین‌المللی
                          </Badge>
                        )}
                      </div>

                      <div className="pt-8">
                        {/* Name & Channel */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-primary font-black text-xl border border-primary/10">
                            {comp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-lg">{comp.name}</h4>
                            <p className="text-xs text-muted-foreground">{comp.channel}</p>
                          </div>
                        </div>

                        {/* Mini scores */}
                        {comp.scores && (
                          <div className="flex items-center gap-2 mb-4">
                            {scoreLabels.map((s) => (
                              <div
                                key={s.key}
                                className="flex-1 text-center p-2 rounded-lg bg-muted/30"
                                title={s.label}
                              >
                                <s.icon size={12} className="text-muted-foreground mx-auto mb-1" />
                                <div className="text-xs font-bold text-foreground">
                                  {comp.scores![s.key as keyof typeof comp.scores]}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Strength & Weakness */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <Shield size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-emerald-900">{comp.strength}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm p-3 rounded-xl bg-rose-50 border border-rose-100">
                            <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                            <span className="text-rose-900">{comp.weakness}</span>
                          </div>
                        </div>

                        {/* Expanded view */}
                        <AnimatePresence>
                          {selectedCompetitor === idx && comp.scores && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-border/50"
                            >
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Lightbulb size={14} className="text-amber-500" />
                                نقاط ورود شما
                              </div>
                              <p className="text-sm text-foreground leading-7">
                                با توجه به ضعف "{comp.weakness}" می‌توانید با تمرکز روی این نقطه، مزیت رقابتی ایجاد کنید.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Compare View */}
            {view === "compare" && (
              <Card variant="default">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-right py-3 px-4 font-bold text-foreground">رقیب</th>
                        {scoreLabels.map((s) => (
                          <th key={s.key} className="text-center py-3 px-4 font-medium text-muted-foreground">
                            <div className="flex items-center justify-center gap-1">
                              <s.icon size={14} />
                              {s.label}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Your project row */}
                      <tr className="bg-primary/5 border-b border-border/50">
                        <td className="py-3 px-4 font-bold text-primary">
                          {plan?.projectName} (شما)
                        </td>
                        {scoreLabels.map((s) => (
                          <td key={s.key} className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-primary rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: "85%" }}
                                  transition={{ delay: 0.5 }}
                                />
                              </div>
                              <span className="font-bold text-primary">85</span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Competitor rows */}
                      {result.competitors?.map((comp, idx) => (
                        <tr key={idx} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="py-3 px-4 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                                {comp.name.charAt(0)}
                              </div>
                              {comp.name}
                            </div>
                          </td>
                          {scoreLabels.map((s) => {
                            const score = comp.scores?.[s.key as keyof typeof comp.scores] || 0;
                            return (
                              <td key={s.key} className="text-center py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      className={cn(
                                        "h-full rounded-full",
                                        score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
                                      )}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${score}%` }}
                                      transition={{ delay: 0.3 + idx * 0.1 }}
                                    />
                                  </div>
                                  <span className="font-medium text-muted-foreground w-6">{score}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Enhanced SWOT Analysis */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <Card variant="default" className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800">نقاط قوت شما</h3>
                    <p className="text-xs text-emerald-600">Strengths</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.swot?.strengths?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-emerald-900 bg-white/50 p-3 rounded-xl"
                    >
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </Card>

              {/* Weaknesses */}
              <Card variant="default" className="bg-gradient-to-br from-rose-50 to-pink-50/50 border-rose-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-800">نقاط ضعف</h3>
                    <p className="text-xs text-rose-600">Weaknesses</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.swot?.weaknesses?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-rose-900 bg-white/50 p-3 rounded-xl"
                    >
                      <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </Card>

              {/* Opportunities */}
              <Card variant="default" className="bg-gradient-to-br from-blue-50 to-cyan-50/50 border-blue-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-800">فرصت‌ها</h3>
                    <p className="text-xs text-blue-600">Opportunities</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.swot?.opportunities?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-blue-900 bg-white/50 p-3 rounded-xl"
                    >
                      <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </Card>

              {/* Threats */}
              <Card variant="default" className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800">تهدیدها</h3>
                    <p className="text-xs text-amber-600">Threats</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {result.swot?.threats?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-amber-900 bg-white/50 p-3 rounded-xl"
                    >
                      <Target size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
