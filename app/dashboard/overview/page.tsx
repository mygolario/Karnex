"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { 
  Loader2, 
  AlertTriangle, 
  Lightbulb, 
  Share2, 
  MapPin, 
  ArrowLeft, 
  Users, 
  DollarSign 
} from "lucide-react";

export default function DashboardOverview() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Wait for Auth to initialize
      if (authLoading) return;

      // 2. If not logged in, redirect to login (or new project for MVP)
      if (!user) {
        router.push('/new-project');
        return;
      }

      try {
        // 3. Fetch from Cloud
        const data = await getPlanFromCloud(user.uid);
        
        if (data) {
          setPlan(data);
        } else {
          // Instead of auto-redirecting, we just stop loading.
          // The UI will handle the "No Plan" state.
          console.warn("No plan found (or offline).");
        }
      } catch (error) {
        console.error("Failed to load plan:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, router]);

  // --- Loading State (Skeleton) ---
  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-12 w-1/3 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-32 w-full bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!plan) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-100 p-6 rounded-full mb-6 relative">
                <AlertTriangle className="text-slate-400 w-12 h-12" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-4 border-white"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">پروژه‌ای یافت نشد</h2>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
               ممکن است ارتباط شما با سرور قطع شده باشد، یا هنوز پروژه‌ای نساخته باشید.
            </p>
            <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  تلاش مجدد
                </button>
                <button 
                  onClick={() => router.push('/new-project')} 
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105"
                >
                  ساخت پروژه جدید
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {plan.projectName}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            {plan.tagline}
          </p>
        </div>
        <button 
          onClick={() => alert("لینک اشتراک‌گذاری کپی شد!")}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Share2 size={18} />
          <span>اشتراک‌گذاری</span>
        </button>
      </div>

      {/* 2. Core Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-amber-400"></div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">مشکلی که حل می‌کنید</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {plan.leanCanvas.problem}
              </p>
            </div>
          </div>
        </div>

        {/* Solution Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">راه حل هوشمندانه شما</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {plan.leanCanvas.solution}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Execution Focus (Week 1) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold">تمرکز هفته اول: اعتبارسنجی</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {/* Display first 3 steps of Phase 1 */}
              {plan.roadmap[0]?.steps.slice(0, 3).map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-400 flex items-center justify-center">
                    {/* Empty checkbox visual */}
                  </div>
                  <span className="text-slate-200 text-sm">{step}</span>
                </div>
              ))}
              <button 
                onClick={() => router.push('/dashboard/roadmap')}
                className="text-emerald-400 text-sm font-medium hover:text-emerald-300 flex items-center gap-1 mt-2"
              >
                مشاهده کل برنامه اجرایی
                <ArrowLeft size={16} />
              </button>
            </div>

            {/* Progress Visual */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-1">۱۵٪</div>
              <div className="text-slate-400 text-sm mb-4">پیشرفت پروژه</div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[15%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Brand & Identity Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">پالت رنگی</h3>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div 
                className="h-16 w-full rounded-xl shadow-inner ring-1 ring-black/5" 
                style={{ backgroundColor: plan.brandKit.primaryColorHex }}
              ></div>
              <div className="text-xs font-mono text-center text-slate-500">{plan.brandKit.primaryColorHex}</div>
            </div>
            <div className="flex-1 space-y-2">
              <div 
                className="h-16 w-full rounded-xl shadow-inner ring-1 ring-black/5" 
                style={{ backgroundColor: plan.brandKit.secondaryColorHex }}
              ></div>
              <div className="text-xs font-mono text-center text-slate-500">{plan.brandKit.secondaryColorHex}</div>
            </div>
          </div>
        </div>

        {/* Audience */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 text-purple-600">
            <Users size={20} />
            <span className="font-bold">مخاطب هدف</span>
          </div>
          <p className="text-slate-700 font-medium text-lg leading-snug">
            {plan.audience || "عموم مردم"}
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 text-emerald-600">
            <DollarSign size={20} />
            <span className="font-bold">مدل درآمدی</span>
          </div>
          <p className="text-slate-700 font-medium text-lg leading-snug">
            {plan.leanCanvas.revenueStream}
          </p>
        </div>

      </div>
    </div>
  );
}
