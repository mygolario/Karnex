"use client";

import React from "react";
import { PitchDeckSlide } from "@/lib/db";
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle, 
  MapPin, 
  Milestone, 
  ChevronRight, 
  Zap, 
  Layers, 
  Award,
  Check,
  X
} from "lucide-react";

interface SlideTemplatesProps {
  slide: PitchDeckSlide;
  index: number;
  total: number;
  projectName: string;
  isExport?: boolean;
}

export function SlideVisualizer({ slide, index, total, projectName, isExport = false }: SlideTemplatesProps) {
  if (!slide) return null;

  // Render correct layout based on slide.type
  const renderLayout = () => {
    switch (slide.type) {
      case "title":
        return <TitleLayout slide={slide} />;
      case "problem":
        return <ProblemLayout slide={slide} />;
      case "solution":
        return <SolutionLayout slide={slide} />;
      case "market":
      case "market_size":
        return <MarketLayout slide={slide} />;
      case "business_model":
        return <BusinessModelLayout slide={slide} />;
      case "competition":
        return <CompetitionLayout slide={slide} />;
      case "roadmap":
        return <RoadmapLayout slide={slide} />;
      case "team":
        return <TeamLayout slide={slide} />;
      case "ask":
        return <AskLayout slide={slide} />;
      default:
        return <GenericLayout slide={slide} />;
    }
  };

  return (
    <div className={`w-full h-full p-8 md:p-10 flex flex-col relative overflow-hidden bg-slate-950 text-white select-none`}>
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-black tracking-widest text-cyan-400 uppercase font-mono">{projectName || "KARNEX"}</span>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full">
          اسلاید {index + 1} از {total}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative z-10 justify-center">
        {renderLayout()}
      </div>

      {/* Footer Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-500 opacity-60" />
    </div>
  );
}

// 1. Title Layout
function TitleLayout({ slide }: { slide: PitchDeckSlide }) {
  return (
    <div className="text-center py-6 flex flex-col items-center justify-center space-y-6" dir="rtl">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-150" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 relative">
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="space-y-3 max-w-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-violet-300 tracking-tight leading-tight">
          {slide.title}
        </h1>
        {slide.bullets.length > 0 && (
          <p className="text-base text-cyan-400 font-medium">
            {slide.bullets[0]}
          </p>
        )}
      </div>
      {slide.bullets.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mt-2 max-w-lg">
          {slide.bullets.slice(1).map((b, i) => (
            <span key={i} className="text-xs bg-slate-900/80 border border-white/5 px-3 py-1.5 rounded-xl text-slate-300">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// 2. Problem Layout
function ProblemLayout({ slide }: { slide: PitchDeckSlide }) {
  return (
    <div className="grid md:grid-cols-12 gap-6 items-center" dir="rtl">
      <div className="md:col-span-7 space-y-4">
        <h2 className="text-2xl font-black text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          {slide.title}
        </h2>
        <div className="space-y-3">
          {slide.bullets.map((b, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
              <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm md:text-base leading-relaxed text-slate-300 font-medium">{b}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="md:col-span-5 hidden md:flex justify-center relative">
        <div className="absolute inset-0 bg-rose-500/10 blur-[50px] rounded-full" />
        <div className="relative w-44 h-44 rounded-full border border-rose-500/20 bg-rose-500/5 flex flex-col items-center justify-center text-center p-4">
          <ShieldAlert className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
          <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">چالش بازار</span>
          <span className="text-[10px] text-slate-400 mt-1">مشکل برطرف نشده مشتریان</span>
        </div>
      </div>
    </div>
  );
}

// 3. Solution Layout
function SolutionLayout({ slide }: { slide: PitchDeckSlide }) {
  return (
    <div className="grid md:grid-cols-12 gap-6 items-center" dir="rtl">
      <div className="md:col-span-7 space-y-4">
        <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          {slide.title}
        </h2>
        <div className="space-y-3">
          {slide.bullets.map((b, i) => (
            <div key={i} className="flex gap-3 items-start bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm md:text-base leading-relaxed text-slate-300 font-medium">{b}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="md:col-span-5 hidden md:flex justify-center relative">
        <div className="absolute inset-0 bg-emerald-500/10 blur-[50px] rounded-full" />
        <div className="relative w-44 h-44 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center p-4">
          <CheckCircle className="w-10 h-10 text-emerald-400 mb-2 animate-pulse" />
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">ارزش پیشنهادی</span>
          <span className="text-[10px] text-slate-400 mt-1">راهکار هوشمند کارنکس</span>
        </div>
      </div>
    </div>
  );
}

// 4. Market TAM/SAM/SOM Layout
function MarketLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const tam = metadata.tam || "داده عددی ندارد";
  const sam = metadata.sam || "داده عددی ندارد";
  const som = metadata.som || "داده عددی ندارد";
  const tamDesc = metadata.tamDesc || "کل بازار در دسترس (TAM)";
  const samDesc = metadata.samDesc || "بازار قابل دسترسی (SAM)";
  const somDesc = metadata.somDesc || "سهم بازار هدف ما (SOM)";

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        {slide.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* TAM */}
        <div className="relative group overflow-hidden bg-slate-900/60 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-1">
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">TAM - کل بازار</span>
            <h3 className="text-2xl font-black text-white">{tam}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-3">{tamDesc}</p>
        </div>

        {/* SAM */}
        <div className="relative group overflow-hidden bg-slate-900/60 border border-cyan-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="space-y-1">
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">SAM - بازار در دسترس</span>
            <h3 className="text-2xl font-black text-cyan-300">{sam}</h3>
          </div>
          <p className="text-xs text-slate-300 mt-3">{samDesc}</p>
        </div>

        {/* SOM */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-cyan-950/40 to-slate-900 border-2 border-cyan-400 p-5 rounded-2xl flex flex-col justify-between">
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">SOM - سهم هدف اولیه</span>
            <h3 className="text-2xl font-black text-cyan-200">{som}</h3>
          </div>
          <p className="text-xs text-slate-200 mt-3">{somDesc}</p>
        </div>

      </div>
    </div>
  );
}

// 5. Business Model Layout
function BusinessModelLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const models = metadata.models || [];

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black text-violet-400 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-violet-400" />
        {slide.title}
      </h2>
      
      {models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.slice(0, 3).map((m: any, i: number) => (
            <div key={i} className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl hover:border-violet-500/30 transition-all flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{m.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slide.bullets.map((b, i) => (
            <div key={i} className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 6. Competition Layout
function CompetitionLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const competitors = metadata.competitors || [];

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black text-fuchsia-400 flex items-center gap-2">
        <Layers className="w-6 h-6 text-fuchsia-400" />
        {slide.title}
      </h2>

      {competitors.length > 0 ? (
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-900 border-b border-white/10 p-3 text-xs font-bold text-slate-400">
            <div className="col-span-4">رقیب</div>
            <div className="col-span-4 text-emerald-400">نقاط قوت (مزیت)</div>
            <div className="col-span-4 text-rose-400">نقاط ضعف (شکاف)</div>
          </div>
          <div className="divide-y divide-white/5">
            {competitors.map((c: any, i: number) => (
              <div key={i} className="grid grid-cols-12 p-3 text-xs md:text-sm items-center hover:bg-slate-900/20">
                <div className="col-span-4 font-bold text-white">{c.name}</div>
                <div className="col-span-4 text-slate-300 pl-2">{c.strength}</div>
                <div className="col-span-4 text-slate-400 pl-2">{c.weakness}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {slide.bullets.map((b, i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex gap-3 items-start">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 mt-2 shrink-0" />
              <p className="text-xs text-slate-300 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 7. Roadmap Timeline Layout
function RoadmapLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const phases = metadata.phases || [];

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2">
        <Milestone className="w-6 h-6" />
        {slide.title}
      </h2>

      {phases.length > 0 ? (
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
          {/* Connector line for desktop */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-600 hidden md:block z-0 -translate-y-4" />
          
          {phases.slice(0, 3).map((p: any, i: number) => (
            <div key={i} className="relative z-10 w-full md:w-[30%] bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-xl flex flex-col space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full font-bold">{p.phase}</span>
                <span className="text-[10px] text-slate-400 font-mono">{p.date}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{p.title}</h4>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {slide.bullets.map((b, i) => (
            <div key={i} className="flex gap-3 items-center bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
              <span className="text-xs font-bold text-cyan-400 shrink-0">گام {i + 1}:</span>
              <p className="text-sm text-slate-300 font-medium">{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 8. Team Layout
function TeamLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const members = metadata.members || [];

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black text-indigo-400 flex items-center gap-2">
        <Users className="w-6 h-6 text-indigo-400" />
        {slide.title}
      </h2>

      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.slice(0, 3).map((m: any, i: number) => {
            const initials = m.name ? m.name.split(' ').map((n: string) => n[0]).join('') : '?';
            return (
              <div key={i} className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-500/20">
                  {initials}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">{m.name}</h4>
                  <p className="text-xs text-indigo-300 font-medium truncate">{m.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slide.bullets.map((b, i) => (
            <div key={i} className="bg-slate-900/60 border border-white/5 p-4 rounded-xl flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 9. Ask / Funding Layout
function AskLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const amount = metadata.amount || "نامشخص";
  const runway = metadata.runway || "نامشخص";
  const use = metadata.use || "توسعه محصول و مارکتینگ";

  return (
    <div className="grid md:grid-cols-12 gap-6 items-center" dir="rtl">
      <div className="md:col-span-6 space-y-4">
        <h2 className="text-2xl font-black text-amber-400 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-amber-500" />
          {slide.title}
        </h2>
        <div className="space-y-3">
          <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-xs text-slate-400 font-bold mb-1">مبلغ سرمایه درخواستی</span>
            <span className="text-2xl font-black text-amber-400">{amount}</span>
          </div>
          <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-xs text-slate-400 font-bold mb-1">طول دوره مصرف (Runway)</span>
            <span className="text-lg font-bold text-white">{runway}</span>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-6 space-y-3">
        <div className="bg-slate-900/60 border border-amber-500/20 p-5 rounded-2xl space-y-2">
          <h4 className="text-xs text-amber-400 font-bold uppercase tracking-wider">محل مصرف سرمایه</h4>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-semibold">{use}</p>
        </div>
        {slide.bullets.length > 0 && (
          <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-center">
            <p className="text-xs text-slate-400 italic">{slide.bullets[0]}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 10. Generic Layout
function GenericLayout({ slide }: { slide: PitchDeckSlide }) {
  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-2">
        <Award className="w-6 h-6" />
        {slide.title}
      </h2>
      <div className="space-y-3">
        {slide.bullets.map((b, i) => (
          <div key={i} className="flex gap-3 items-start bg-slate-900/40 border border-white/5 p-3 rounded-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 shrink-0" />
            <p className="text-sm md:text-base leading-relaxed text-slate-300 font-semibold">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
