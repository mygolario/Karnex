"use client";

import { useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { LocationProvider } from "@/components/dashboard/location/location-context";
import { LocationWorkspace } from "@/components/dashboard/location/location-workspace";

export default function LocationAnalyzerPage() {
  const { activeProject: plan, loading } = useProject();

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c3355b'},body:JSON.stringify({sessionId:'c3355b',location:'location/page.tsx:render',message:'location page state',data:{loading,hasPlan:!!plan,projectType:plan?.projectType,hasLocationAnalysis:!!plan?.locationAnalysis},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  }, [loading, plan?.id, plan?.projectType, plan?.locationAnalysis]);
  // #endregion

  if (loading && !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (plan.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md bg-muted/20 border-dashed">
          <MapPin size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تحلیل منطقه برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button variant="outline" className="w-full">
              بازگشت به داشبورد
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <LocationProvider key={plan.id}>
      <LocationWorkspace />
    </LocationProvider>
  );
}
