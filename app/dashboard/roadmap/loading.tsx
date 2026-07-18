import { Loader2 } from "lucide-react";

export default function RoadmapLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center" aria-busy="true" role="status">
      <span className="sr-only">در حال بارگذاری نقشه راه</span>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
