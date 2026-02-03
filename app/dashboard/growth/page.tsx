"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Target,
  BarChart3,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  Loader2,
  RefreshCw,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface KPI {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: "users" | "revenue" | "conversion" | "custom";
}

interface Insight {
  type: "positive" | "negative" | "neutral";
  text: string;
}

const defaultKPIs: KPI[] = [
  { id: "1", name: "کاربران فعال", value: 0, previousValue: 0, unit: "نفر", icon: "users" },
  { id: "2", name: "درآمد ماهانه", value: 0, previousValue: 0, unit: "تومان", icon: "revenue" },
  { id: "3", name: "نرخ تبدیل", value: 0, previousValue: 0, unit: "%", icon: "conversion" },
];

export default function GrowthPage() {
  const { activeProject: plan } = useProject();
  const [kpis, setKpis] = useState<KPI[]>(defaultKPIs);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingKPI, setEditingKPI] = useState<string | null>(null);

  const updateKPI = (id: string, field: "value" | "previousValue", newVal: number) => {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, [field]: newVal } : k));
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, direction: "neutral" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      percent: Math.abs(change).toFixed(1),
      direction: change > 0 ? "up" as const : change < 0 ? "down" as const : "neutral" as const,
    };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "users": return Users;
      case "revenue": return DollarSign;
      case "conversion": return TrendingUp;
      default: return BarChart3;
    }
  };

  const generateInsights = async () => {
    if (!plan) return;
    setIsGenerating(true);

    try {
      const kpiSummary = kpis.map(k => `${k.name}: ${k.value} ${k.unit} (قبلی: ${k.previousValue})`).join(", ");
      
      const prompt = `You are a business analyst. Based on these KPIs for "${plan.projectName}", provide 4 actionable insights in Persian:
${kpiSummary}

Return ONLY valid JSON array:
[
  {"type": "positive", "text": "بینش مثبت فارسی"},
  {"type": "negative", "text": "هشدار فارسی"},
  {"type": "neutral", "text": "پیشنهاد فارسی"}
]`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemPrompt: "Return ONLY valid JSON array in Persian. No markdown."
        }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        setInsights(parsed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Empty state
  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <TrendingUp size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پروژه‌ای انتخاب نشده</h2>
          <p className="text-muted-foreground">ابتدا یک پروژه بسازید.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">رشدنما</h1>
            <p className="text-muted-foreground">داشبورد KPI و تحلیل رشد</p>
          </div>
        </div>

        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          variant={insights.length > 0 ? "outline" : "shimmer"}
          className="gap-2"
        >
          {isGenerating ? (
            <><Loader2 size={16} className="animate-spin" /> تحلیل...</>
          ) : (
            <><Sparkles size={16} /> تحلیل هوشمند</>
          )}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = getIcon(kpi.icon);
          const trend = getTrend(kpi.value, kpi.previousValue);
          const isEditing = editingKPI === kpi.id;

          return (
            <Card
              key={kpi.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setEditingKPI(isEditing ? null : kpi.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Icon size={24} className="text-primary" />
                </div>
                {trend.direction !== "neutral" && (
                  <Badge
                    variant={trend.direction === "up" ? "success" : "danger"}
                    className="flex items-center gap-1"
                  >
                    {trend.direction === "up" ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {trend.percent}%
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-1">{kpi.name}</p>
              
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <div>
                      <label className="text-xs text-muted-foreground">مقدار فعلی</label>
                      <input
                        type="number"
                        value={kpi.value}
                        onChange={(e) => updateKPI(kpi.id, "value", Number(e.target.value))}
                        className="w-full h-10 px-3 rounded-lg bg-muted text-lg font-bold"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">مقدار قبلی</label>
                      <input
                        type="number"
                        value={kpi.previousValue}
                        onChange={(e) => updateKPI(kpi.id, "previousValue", Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-lg bg-muted text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black"
                  >
                    {kpi.value.toLocaleString("fa-IR")} <span className="text-lg text-muted-foreground">{kpi.unit}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* AI Insights */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              بینش‌های هوشمند
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    insight.type === "positive"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : insight.type === "negative"
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-blue-500/20 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        insight.type === "positive"
                          ? "bg-emerald-500 text-white"
                          : insight.type === "negative"
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {insight.type === "positive" ? (
                        <ArrowUpRight size={16} />
                      ) : insight.type === "negative" ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Target size={16} />
                      )}
                    </div>
                    <p className="text-sm leading-7 flex-1">{insight.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Section */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Target size={20} className="text-blue-500" />
          اهداف ماهانه
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar size={48} className="mx-auto mb-4 opacity-40" />
          <p>به زودی: تعیین هدف و ردیابی پیشرفت</p>
        </div>
      </Card>
    </motion.div>
  );
}
