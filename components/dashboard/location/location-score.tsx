import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, Store } from "lucide-react";
import { useLocation } from "./location-context";

export function LocationScore() {
  const { analysis } = useLocation();

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Score Card */}
      <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400">امتیاز مکان</h3>
            <p className="text-xs text-muted-foreground">میزان تناسب با شغل شما</p>
          </div>
        </div>
        <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
          {analysis.score}<span className="text-sm font-normal text-muted-foreground">/۱۰</span>
        </div>
        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 line-clamp-2">
          {analysis.scoreReason}
        </p>
      </Card>

      {/* Economics Card */}
      <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <h3 className="font-bold text-violet-700 dark:text-violet-400">برآورد هزینه</h3>
            <p className="text-xs text-muted-foreground">تخمین اجاره ماهانه</p>
          </div>
        </div>
        <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mb-1">
          {analysis.rentEstimate}
        </div>
        <Badge variant="outline" className="mt-1 border-violet-500/30 text-violet-700 dark:text-violet-400 font-normal">
            احتمال موفقیت: {analysis.successMatch?.label || 'بالا'}
        </Badge>
      </Card>

      {/* Competitors Card */}
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Store size={20} />
          </div>
          <div>
            <h3 className="font-bold text-amber-700 dark:text-amber-400">تحلیل رقبا</h3>
            <p className="text-xs text-muted-foreground">رقبای اصلی اطراف</p>
          </div>
        </div>
        <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">
          {analysis.competitorsCount}<span className="text-sm font-normal text-muted-foreground"> رقیب</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {analysis.nearbyCompetitors?.map((comp: string, i: number) => (
            <span key={i} className="text-[10px] bg-amber-500/10 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-md">
              {comp}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
