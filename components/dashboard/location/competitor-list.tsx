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
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <h4 className="font-bold text-sm text-primary mb-1">{rec.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
            <Car className="text-primary" size={18} />
            وضعیت تردد و دسترسی
          </h3>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-muted-foreground">ساعات پیک</span>
                <span className="font-bold text-sm">{analysis.peakHours}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-muted-foreground">وضعیت ترافیک</span>
                <span className="font-bold text-sm text-amber-600">{analysis.trafficWarning || 'عادی'}</span>
              </div>
              <div className="p-3 bg-muted/20 rounded-lg">
                <span className="text-sm text-muted-foreground block mb-2">نقاط دسترسی:</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.accessPoints?.map((p, i) => (
                    <Badge key={i} variant="outline" className="bg-background">{p}</Badge>
                  ))}
                </div>
              </div>
          </div>

           <div className="mt-6">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
               <Store className="text-primary" size={18} />
               لیست رقبای شناسایی شده
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.nearbyCompetitors?.map((comp, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 text-xs">
                        {comp}
                    </Badge>
                ))}
            </div>
           </div>
        </div>
      </div>
    </Card>
  );
}
