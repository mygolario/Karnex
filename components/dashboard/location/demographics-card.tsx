import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, Target, Info } from "lucide-react";
import { useLocation } from "./location-context";

export function DemographicsCard() {
  const { analysis } = useLocation();

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Demographics & Insight */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold flex items-center gap-2">
            <Users className="text-primary" size={20} />
            تحلیل بافت جمعیتی
          </h3>
          <Badge variant="secondary">شعاع ۱ کیلومتری</Badge>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-medium">
             <span>جمعیت کل</span>
             <span className="font-bold text-lg">{analysis.population}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{analysis.populationDesc}</p>
          
          <div className="space-y-3">
            {analysis.demographics.map((demo, index) => (
                <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                    <span>{demo.label}</span>
                    <span className="font-bold">{demo.percent}٪</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                    className="h-full rounded-full" 
                    style={{ width: `${demo.percent}%`, backgroundColor: demo.color || '#3b82f6' }} 
                    />
                </div>
                </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            تحلیل هوشمند منطقه:
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed text-justify">
            {analysis.aiInsight}
          </p>
        </div>
      </Card>

      {/* SWOT Aanalysis */}
      <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            تحلیل استراتژیک (SWOT)
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 h-[calc(100%-3rem)]">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <h5 className="font-bold text-xs text-emerald-600 mb-2 flex items-center gap-1"><CheckCircle2 size={12}/> نقاط قوت</h5>
              <ul className="space-y-1">
                {analysis.swot?.strengths?.map((s, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                ))}
              </ul>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
              <h5 className="font-bold text-xs text-rose-600 mb-2 flex items-center gap-1"><AlertTriangle size={12}/> نقاط ضعف</h5>
              <ul className="space-y-1">
                {analysis.swot?.weaknesses?.map((s, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                ))}
              </ul>
          </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <h5 className="font-bold text-xs text-blue-600 mb-2 flex items-center gap-1"><Target size={12}/> فرصت‌ها</h5>
              <ul className="space-y-1">
                {analysis.swot?.opportunities?.map((s, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                ))}
              </ul>
          </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <h5 className="font-bold text-xs text-amber-600 mb-2 flex items-center gap-1"><Info size={12}/> تهدیدها</h5>
              <ul className="space-y-1">
                {analysis.swot?.threats?.map((s, i) => (
                  <li key={i} className="text-[11px] text-muted-foreground leading-tight">• {s}</li>
                ))}
              </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
