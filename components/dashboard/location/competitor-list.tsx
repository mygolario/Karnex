import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Car, Clock, Target } from "lucide-react";
import { useLocation } from "./location-context";

export function CompetitorList() {
  const { analysis } = useLocation();

  if (!analysis) return null;

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
            <Target className="text-primary" size={18} />
            پیشنهادات عملیاتی
          </h3>
          <div className="space-y-3">
            {analysis.recommendations?.map((rec, i) => (
              <div key={i} className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <h4 className="font-bold text-sm text-primary mb-1">{rec.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
              </div>
            ))}
            {(!analysis.recommendations || analysis.recommendations.length === 0) && (
                <div className="p-4 text-center text-muted-foreground text-xs">هیچ پیشنهادی ثبت نشده است.</div>
            )}
          </div>
        </div>
        
        
        <div>
           {/* Traffic section removed as data is not available in LocationAnalysis interface */}
           <div className="mt-0">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
               <Store className="text-primary" size={18} />
               لیست رقبای شناسایی شده
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.competitorAnalysis?.directCompetitors?.map((comp, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 text-xs">
                        {comp.name}
                    </Badge>
                ))}
                {(!analysis.competitorAnalysis?.directCompetitors || analysis.competitorAnalysis.directCompetitors.length === 0) && (
                    <span className="text-xs text-muted-foreground">رقیب مستقیمی یافت نشد.</span>
                )}
            </div>
           </div>
        </div>
      </div>
    </Card>
  );
}
