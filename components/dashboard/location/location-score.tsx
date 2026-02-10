import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, Store, TrendingUp, Users, AlertTriangle, ArrowRight } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";

export function LocationScore() {
  const { analysis } = useLocation();

  if (!analysis) return null;

  // Safely access metrics with defaults
  const metrics = analysis.metrics || {
    footfallIndex: 'Medium',
    spendPower: 'Medium',
    riskRewardRatio: 50,
    competitionDensity: 'Medium'
  };

  const getMetricColor = (val: string) => {
    if (val === 'High') return 'text-emerald-500';
    if (val === 'Medium') return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Footfall */}
        <Card className="p-4 bg-card/30 backdrop-blur border-white/5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Users size={16} />
                <span className="text-xs">پاخور (Footfall)</span>
            </div>
            <div className={`text-lg font-bold ${getMetricColor(metrics.footfallIndex)}`}>
                {metrics.footfallIndex === 'High' ? 'بسیار بالا' : metrics.footfallIndex === 'Medium' ? 'متوسط' : 'کم'}
            </div>
        </Card>

        {/* Spend Power */}
        <Card className="p-4 bg-card/30 backdrop-blur border-white/5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <DollarSign size={16} />
                <span className="text-xs">قدرت خرید</span>
            </div>
            <div className={`text-lg font-bold ${getMetricColor(metrics.spendPower)}`}>
                {metrics.spendPower === 'High' ? 'بالا' : metrics.spendPower === 'Medium' ? 'متوسط' : 'پایین'}
            </div>
        </Card>

        {/* Risk/Reward */}
        <Card className="p-4 bg-card/30 backdrop-blur border-white/5 col-span-2 md:col-span-2">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp size={16} />
                    <span className="text-xs">ریسک / پاداش</span>
                </div>
                <span className="text-xs font-mono text-white">{metrics.riskRewardRatio}%</span>
            </div>
            <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500" 
                    style={{ width: `${metrics.riskRewardRatio}%` }}
                />
            </div>
        </Card>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-500/5">
            <h4 className="font-bold text-emerald-600 mb-3 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> نقاط قوت (Strengths)
            </h4>
            <ul className="space-y-2">
                {analysis.swot.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        {s}
                    </li>
                ))}
            </ul>
        </Card>

         <Card className="p-5 border-l-4 border-l-red-500 bg-red-500/5">
            <h4 className="font-bold text-red-600 mb-3 text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> نقاط ضعف (Weaknesses)
            </h4>
             <ul className="space-y-2">
                {analysis.swot.weaknesses.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 shrink-0" />
                        {s}
                    </li>
                ))}
            </ul>
        </Card>
      </div>
    </div>
  );
}
