"use client";

import { useState } from "react";
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
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Competitor {
  name: string;
  channel: string;
  strength: string;
  weakness: string;
  isIranian?: boolean;
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

export function CompetitorAnalyzer() {
  const { activeProject: plan } = useProject();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!plan) return;
    
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: plan.projectName,
          projectIdea: plan.overview,
          audience: plan.audience
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Analysis Trigger */}
      {!result && (
        <Card variant="gradient" className="text-white text-center py-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">تحلیل رقبا با کارنکس</h3>
          <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
            رقبای ایرانی و بین‌المللی در حوزه «{plan?.projectName}» را شناسایی کنید و تحلیل SWOT اختصاصی دریافت کنید.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                در حال تحلیل بازار...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                شروع تحلیل رقبا
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          {/* Competitors List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">رقبای شناسایی‌شده</h3>
                  <p className="text-xs text-muted-foreground">{result.competitors?.length || 0} رقیب پیدا شد</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={analyzing}>
                <RefreshCw size={14} className={analyzing ? "animate-spin" : ""} />
                تحلیل مجدد
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.competitors?.map((comp, idx) => (
                <Card 
                  key={idx} 
                  variant="default"
                  hover="lift"
                  className="relative overflow-hidden"
                >
                  {/* Iranian/Global indicator */}
                  <div className={cn(
                    "absolute top-3 left-3",
                  )}>
                    {comp.isIranian ? (
                      <Badge variant="secondary" size="sm" className="gap-1">
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
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-primary font-bold text-lg">
                        {comp.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{comp.name}</h4>
                        <p className="text-xs text-muted-foreground">{comp.channel}</p>
                      </div>
                    </div>

                    {/* Strength & Weakness */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Shield size={10} />
                        </div>
                        <span className="text-muted-foreground"><strong className="text-foreground">قوت:</strong> {comp.strength}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle size={10} />
                        </div>
                        <span className="text-muted-foreground"><strong className="text-foreground">ضعف:</strong> {comp.weakness}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Dynamic SWOT Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">تحلیل SWOT اختصاصی</h3>
                <p className="text-xs text-muted-foreground">بر اساس ایده و بازار شما</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Strengths */}
              <Card variant="default" className="bg-emerald-50/50 border-emerald-200/50">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3">
                  <Shield size={18} />
                  نقاط قوت
                </div>
                <ul className="space-y-2">
                  {result.swot?.strengths?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-900/80">
                      <span className="text-emerald-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Weaknesses */}
              <Card variant="default" className="bg-rose-50/50 border-rose-200/50">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-3">
                  <AlertTriangle size={18} />
                  نقاط ضعف
                </div>
                <ul className="space-y-2">
                  {result.swot?.weaknesses?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-rose-900/80">
                      <span className="text-rose-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Opportunities */}
              <Card variant="default" className="bg-blue-50/50 border-blue-200/50">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                  <Zap size={18} />
                  فرصت‌ها
                </div>
                <ul className="space-y-2">
                  {result.swot?.opportunities?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-900/80">
                      <span className="text-blue-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Threats */}
              <Card variant="default" className="bg-orange-50/50 border-orange-200/50">
                <div className="flex items-center gap-2 text-orange-700 font-bold mb-3">
                  <Target size={18} />
                  تهدیدها
                </div>
                <ul className="space-y-2">
                  {result.swot?.threats?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-orange-900/80">
                      <span className="text-orange-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
