import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-primary/5 animate-ping" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
