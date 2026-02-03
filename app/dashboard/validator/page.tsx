"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  TrendingUp,
  Users,
  Shield,
  Target,
  Lightbulb,
  Loader2,
  RefreshCw,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  Swords,
  DollarSign,
} from "lucide-react";

interface ValidationResult {
  marketSize: {
    tam: string;
    sam: string;
    som: string;
    score: number;
  };
  competition: {
    level: "low" | "medium" | "high";
    competitors: { name: string; strength: string; weakness: string }[];
    score: number;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  risks: {
    technical: number;
    market: number;
    financial: number;
    team: number;
    overall: number;
  };
  investorScore: number;
  pivotSuggestions: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ValidatorPage() {
  const { activeProject: plan } = useProject();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getRole = () => {
    switch (plan?.projectType) {
      case 'creator': return 'brand strategist and creator economy expert';
      case 'traditional': return 'small business consultant';
      default: return 'startup validation expert';
    }
  };

  const getScoreLabel = () => {
    switch (plan?.projectType) {
      case 'creator': return 'جذابیت برای اسپانسرها';
      case 'traditional': return 'امکان دریافت وام';
      default: return 'جذابیت سرمایه‌گذاری';
    }
  };

  const runValidation = async () => {
    if (!plan) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const role = getRole();
      const prompt = `You are a ${role}. Perform a simulated deep web search to find REAL, EXISTING competitors for this project.
 
 Project: ${plan.projectName} (in Iran/Persian market context if applicable, otherwise global)
 Description: ${plan.overview}
 Target Audience: ${plan.audience}
 Budget: ${plan.budget}
 Type: ${plan.projectType}
 
 Return ONLY valid JSON (no markdown) with this exact structure:
 {
   "marketSize": {
     "tam": "Total addressable market/audience in Persian (Real estimate)",
     "sam": "Serviceable addressable market/audience in Persian",
     "som": "Serviceable obtainable market/audience in Persian",
     "score": 75
   },
   "competition": {
     "level": "medium",
     "competitors": [
       {"name": "Real Competitor Name 1", "strength": "Actual strength", "weakness": "Actual weakness"},
       {"name": "Real Competitor Name 2", "strength": "Actual strength", "weakness": "Actual weakness"}
     ],
     "score": 60
   },
  "swot": {
    "strengths": ["قوت ۱", "قوت ۲"],
    "weaknesses": ["ضعف ۱"],
    "opportunities": ["فرصت ۱"],
    "threats": ["تهدید ۱"]
  },
  "risks": {
    "technical": 30,
    "market": 45,
    "financial": 50,
    "team": 25,
    "overall": 40
  },
  "investorScore": 72,
  "pivotSuggestions": ["پیشنهاد محوری ۱", "پیشنهاد ۲"]
}`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemPrompt: `You are a ${role}. Return ONLY valid JSON, no markdown.`
        }),
      });

      const data = await response.json();
      
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        setResult(parsed);
      } else {
        setError("خطا در تحلیل. لطفاً دوباره تلاش کنید.");
      }
    } catch (err) {
      console.error(err);
      setError("خطا در اتصال به سرور");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-blue-500 to-cyan-500";
    if (score >= 40) return "from-amber-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 25) return { text: "کم", color: "text-emerald-500" };
    if (score <= 50) return { text: "متوسط", color: "text-amber-500" };
    if (score <= 75) return { text: "زیاد", color: "text-orange-500" };
    return { text: "بحرانی", color: "text-red-500" };
  };

  // Empty state
  if (!plan) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FlaskConical size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پروژه‌ای انتخاب نشده</h2>
          <p className="text-muted-foreground">ابتدا یک پروژه بسازید یا انتخاب کنید.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FlaskConical size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
                {plan?.projectType === 'creator' ? 'اعتبارسنجی برند' : 'اعتبارسنجی ایده'}
            </h1>
            <p className="text-muted-foreground">
              {plan?.projectType === 'creator' ? 'تحلیل مخاطب، رقبا و ریسک' : 'تحلیل بازار، رقبا و ریسک'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={runValidation}
          disabled={isAnalyzing}
          variant={result ? "outline" : "shimmer"}
          size="lg"
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              در حال تحلیل...
            </>
          ) : result ? (
            <>
              <RefreshCw size={18} />
              تحلیل مجدد
            </>
          ) : (
            <>
              <Sparkles size={18} />
              شروع اعتبارسنجی
            </>
          )}
        </Button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
        >
          <AlertTriangle size={20} />
          {error}
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-6"
          >
            {/* Top Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Investor Score */}
              <Card className="p-6 text-center relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getScoreBg(result.investorScore)} opacity-10`} />
                <div className="relative z-10">
                  <DollarSign size={32} className={`mx-auto mb-2 ${getScoreColor(result.investorScore)}`} />
                  <p className="text-sm text-muted-foreground mb-1">{getScoreLabel()}</p>
                  <p className={`text-4xl font-black ${getScoreColor(result.investorScore)}`}>
                    {result.investorScore}%
                  </p>
                </div>
              </Card>

              {/* Market Score */}
              <Card className="p-6 text-center relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getScoreBg(result.marketSize.score)} opacity-10`} />
                <div className="relative z-10">
                  <BarChart3 size={32} className={`mx-auto mb-2 ${getScoreColor(result.marketSize.score)}`} />
                  <p className="text-sm text-muted-foreground mb-1">امتیاز اندازه بازار</p>
                  <p className={`text-4xl font-black ${getScoreColor(result.marketSize.score)}`}>
                    {result.marketSize.score}%
                  </p>
                </div>
              </Card>

              {/* Competition Score */}
              <Card className="p-6 text-center relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getScoreBg(result.competition.score)} opacity-10`} />
                <div className="relative z-10">
                  <Swords size={32} className={`mx-auto mb-2 ${getScoreColor(result.competition.score)}`} />
                  <p className="text-sm text-muted-foreground mb-1">امتیاز رقابت‌پذیری</p>
                  <p className={`text-4xl font-black ${getScoreColor(result.competition.score)}`}>
                    {result.competition.score}%
                  </p>
                </div>
              </Card>
            </div>

            {/* Market Size */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                تحلیل اندازه بازار
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">TAM - کل بازار قابل دسترس</p>
                  <p className="font-bold">{result.marketSize.tam}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">SAM - بازار قابل سرویس</p>
                  <p className="font-bold">{result.marketSize.sam}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">SOM - سهم قابل کسب</p>
                  <p className="font-bold">{result.marketSize.som}</p>
                </div>
              </div>
            </Card>

            {/* SWOT */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <Card className="p-6 border-emerald-500/20">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-emerald-600">
                  <CheckCircle2 size={18} />
                  نقاط قوت
                </h4>
                <ul className="space-y-2">
                  {result.swot.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Weaknesses */}
              <Card className="p-6 border-red-500/20">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-red-600">
                  <XCircle size={18} />
                  نقاط ضعف
                </h4>
                <ul className="space-y-2">
                  {result.swot.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Opportunities */}
              <Card className="p-6 border-blue-500/20">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-blue-600">
                  <Target size={18} />
                  فرصت‌ها
                </h4>
                <ul className="space-y-2">
                  {result.swot.opportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Threats */}
              <Card className="p-6 border-amber-500/20">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-amber-600">
                  <Shield size={18} />
                  تهدیدها
                </h4>
                <ul className="space-y-2">
                  {result.swot.threats.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Risk Analysis */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" />
                تحلیل ریسک
              </h3>
              <div className="space-y-4">
                {Object.entries(result.risks).filter(([k]) => k !== "overall").map(([key, value]) => {
                  const risk = getRiskLabel(value);
                  const labels: Record<string, string> = {
                    technical: "ریسک فنی",
                    market: "ریسک بازار",
                    financial: "ریسک مالی",
                    team: "ریسک تیم",
                  };
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="w-24 text-sm text-muted-foreground">{labels[key]}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreBg(100 - value)}`}
                          style={{ width: `${100 - value}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${risk.color}`}>{risk.text}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Pivot Suggestions */}
            <Card className="p-6 border-primary/20 bg-primary/5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-primary" />
                پیشنهادات بهبود
              </h3>
              <div className="space-y-3">
                {result.pivotSuggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-background/50"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Competitors */}
            {result.competition.competitors.length > 0 && (
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users size={20} className="text-purple-500" />
                  تحلیل رقبا
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {result.competition.competitors.map((comp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50">
                      <h4 className="font-bold mb-2">{comp.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">نقطه قوت:</p>
                      <p className="text-sm text-emerald-600 mb-2">{comp.strength}</p>
                      <p className="text-xs text-muted-foreground mb-1">نقطه ضعف:</p>
                      <p className="text-sm text-red-600">{comp.weakness}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            variants={itemVariants}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <FlaskConical size={48} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">اعتبارسنجی ایده</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              با کلیک روی دکمه "شروع اعتبارسنجی"، AI ایده شما را از نظر اندازه بازار، رقابت، ریسک و جذابیت سرمایه‌گذاری تحلیل می‌کند.
            </p>
            <Button onClick={runValidation} disabled={isAnalyzing} variant="shimmer" size="lg">
              <Sparkles size={18} className="ml-2" />
              شروع اعتبارسنجی
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
