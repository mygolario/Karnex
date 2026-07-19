"use client";

import React from "react";
import { PitchDeckSlide } from "@/lib/db";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShieldAlert,
  CheckCircle,
  Milestone,
  Zap,
  Layers,
  Award,
  Activity,
} from "lucide-react";
import {
  SlideThemes,
  resolveTheme,
  convertPersianArabicDigits,
  safeString,
  parseNum,
} from "@/lib/pitch-deck";

export { SlideThemes };

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
      case "traction":
        return <TractionLayout slide={slide} />;
      case "ask":
        return <AskLayout slide={slide} />;
      default:
        return <GenericLayout slide={slide} />;
    }
  };

  const activeTheme = resolveTheme(slide.metadata?.theme);
  const fgClass = activeTheme.isLight ? "text-zinc-900" : "text-white";

  return (
    <div 
      className={`w-full h-full p-8 md:p-10 flex flex-col relative overflow-hidden select-none transition-all duration-300 ${fgClass}`}
      style={{
        backgroundColor: activeTheme.bg,
        borderColor: activeTheme.border,
        color: activeTheme.fg,
        ['--theme-bg' as any]: activeTheme.bg,
        ['--theme-fg' as any]: activeTheme.fg,
        ['--theme-muted' as any]: activeTheme.muted,
        ['--theme-card' as any]: activeTheme.card,
        ['--theme-border' as any]: activeTheme.border,
        ['--theme-primary' as any]: activeTheme.primary,
        ['--theme-secondary' as any]: activeTheme.secondary,
        ['--theme-glow1' as any]: activeTheme.glow1,
        ['--theme-glow2' as any]: activeTheme.glow2,
        ['--theme-accent' as any]: activeTheme.accentGradient,
        ['--theme-badge-bg' as any]: activeTheme.badgeBg,
      }}
    >
      {/* Glow Effects */}
      <div 
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: 'var(--theme-glow1)' }}
      />
      <div 
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: 'var(--theme-glow2)' }}
      />
      
      {/* Header */}
      <div 
        className="flex justify-between items-center mb-6 border-b pb-3 relative z-10"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-primary)' }} />
          <span className="text-xs font-black tracking-widest uppercase font-mono" style={{ color: 'var(--theme-primary)' }}>{projectName || "KARNEX"}</span>
        </div>
        <span 
          className="text-xs font-mono bg-slate-900/60 border px-2 py-0.5 rounded-full"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-secondary)' }}
        >
          اسلاید {index + 1} از {total}
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative z-10 justify-center">
        {renderLayout()}
      </div>

      {/* Footer Accent Line */}
      <div 
        className="absolute bottom-0 left-0 w-full h-1 opacity-80 transition-all duration-500" 
        style={{ backgroundImage: 'var(--theme-accent)' }}
      />
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
        {(slide.bullets || []).length > 0 && (
          <p className="text-base text-cyan-400 font-medium">
            {(slide.bullets || [])[0]}
          </p>
        )}
      </div>
      {(slide.bullets || []).length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mt-2 max-w-lg">
          {(slide.bullets || []).slice(1).map((b, i) => (
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
          {(slide.bullets || []).map((b, i) => (
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
          {(slide.bullets || []).map((b, i) => (
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
  const [hoveredCircle, setHoveredCircle] = React.useState<'tam' | 'sam' | 'som' | null>(null);

  const tamVal = parseNum(metadata.tam);
  const samVal = parseNum(metadata.sam);
  const somVal = parseNum(metadata.som);

  const formatValue = (val: any): string => {
    if (typeof val === 'symbol') return '';
    if (val === null || val === undefined || val === '') return 'نامشخص';
    const cleaned = convertPersianArabicDigits(val).replace(/,/g, '');
    const num = Number(cleaned);
    if (!isNaN(num)) {
      return num.toLocaleString('fa-IR');
    }
    return String(val);
  };

  const formattedTam = formatValue(metadata.tam);
  const formattedSam = formatValue(metadata.sam);
  const formattedSom = formatValue(metadata.som);

  const hasVals = tamVal > 0 && samVal > 0 && somVal > 0;
  const t = hasVals ? tamVal : 100;
  const s = hasVals ? samVal : 60;
  const o = hasVals ? somVal : 20;

  const rTam = 120;
  const rSam = Math.max(45, Math.min(rTam - 20, rTam * Math.sqrt(s / t)));
  const rSom = Math.max(20, Math.min(rSam - 15, rTam * Math.sqrt(o / t)));

  return (
    <div className="grid md:grid-cols-12 gap-6 items-center" dir="rtl">
      {/* Cards list */}
      <div className="md:col-span-7 space-y-3">
        <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--theme-primary)' }}>{slide.title}</h2>
        <div className="space-y-2">
          {/* TAM Card */}
          <div 
            className={`p-3.5 rounded-xl border transition-all duration-300 ${
              hoveredCircle === 'tam' 
                ? 'bg-[var(--theme-card)] border-[var(--theme-primary)] scale-[1.01] shadow-lg shadow-[var(--theme-glow1)]' 
                : 'bg-[var(--theme-card)]/50 border-[var(--theme-border)]'
            }`}
            onMouseEnter={() => setHoveredCircle('tam')}
            onMouseLeave={() => setHoveredCircle(null)}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">TAM - کل بازار در دسترس</span>
              <span className="text-base font-black text-white font-mono">{formattedTam} ریال</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{metadata.tamDesc || 'حجم کلی تقاضا در این بازار هدف'}</p>
          </div>

          {/* SAM Card */}
          <div 
            className={`p-3.5 rounded-xl border transition-all duration-300 ${
              hoveredCircle === 'sam' 
                ? 'bg-[var(--theme-card)] border-[var(--theme-secondary)] scale-[1.01] shadow-lg' 
                : 'bg-[var(--theme-card)]/50 border-[var(--theme-border)]'
            }`}
            onMouseEnter={() => setHoveredCircle('sam')}
            onMouseLeave={() => setHoveredCircle(null)}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold" style={{ color: 'var(--theme-secondary)' }}>SAM - بازار قابل دسترسی</span>
              <span className="text-base font-black font-mono" style={{ color: 'var(--theme-secondary)' }}>{formattedSam} ریال</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{metadata.samDesc || 'بخش قابل آدرس‌دهی و متناسب با کانال‌های توزیع ما'}</p>
          </div>

          {/* SOM Card */}
          <div 
            className={`p-3.5 rounded-xl border transition-all duration-300 ${
              hoveredCircle === 'som' 
                ? 'bg-[var(--theme-card)] border-[var(--theme-primary)] scale-[1.01] shadow-lg shadow-[var(--theme-glow1)]' 
                : 'bg-[var(--theme-card)]/50 border-[var(--theme-border)]'
            }`}
            onMouseEnter={() => setHoveredCircle('som')}
            onMouseLeave={() => setHoveredCircle(null)}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>SOM - سهم بازار هدف اولیه</span>
              <span className="text-base font-black font-mono" style={{ color: 'var(--theme-primary)' }}>{formattedSom} ریال</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">{metadata.somDesc || 'سهمی از بازار که در ۱ تا ۳ سال اول کسب می‌کنیم'}</p>
          </div>
        </div>
      </div>

      {/* SVG Concentric visualization */}
      <div className="md:col-span-5 flex justify-center relative">
        <svg width="260" height="260" viewBox="0 0 260 260" className="drop-shadow-2xl">
          {/* TAM Outer Circle */}
          <circle 
            cx="130" cy="130" r={rTam} 
            className="transition-all duration-300 stroke-2 cursor-pointer" 
            style={{ 
              stroke: hoveredCircle === 'tam' ? 'var(--theme-primary)' : 'rgba(255,255,255,0.1)',
              fill: hoveredCircle === 'tam' ? 'var(--theme-glow1)' : 'transparent'
            }}
            onMouseEnter={() => setHoveredCircle('tam')}
            onMouseLeave={() => setHoveredCircle(null)}
          />
          {/* SAM Middle Circle */}
          <circle 
            cx="130" cy="130" r={rSam} 
            className="transition-all duration-300 stroke-2 cursor-pointer" 
            style={{ 
              stroke: hoveredCircle === 'sam' ? 'var(--theme-secondary)' : 'var(--theme-border)',
              fill: hoveredCircle === 'sam' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'
            }}
            onMouseEnter={() => setHoveredCircle('sam')}
            onMouseLeave={() => setHoveredCircle(null)}
          />
          {/* SOM Inner Circle */}
          <circle 
            cx="130" cy="130" r={rSom} 
            className="transition-all duration-300 stroke-2 cursor-pointer animate-pulse" 
            style={{ 
              stroke: 'var(--theme-primary)',
              fill: hoveredCircle === 'som' ? 'var(--theme-badge-bg)' : 'rgba(34, 211, 238, 0.12)'
            }}
            onMouseEnter={() => setHoveredCircle('som')}
            onMouseLeave={() => setHoveredCircle(null)}
          />

          {/* Value overlays */}
          <text x="130" y="134" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" className="pointer-events-none font-mono">SOM</text>
        </svg>
      </div>
    </div>
  );
}

// 5. Business Model Layout
function BusinessModelLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const rawModels = metadata.models;
  const modelsList = Array.isArray(rawModels) ? rawModels : [];
  const models = modelsList.filter(Boolean);

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black text-violet-400 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-violet-400" />
        {slide.title}
      </h2>
      
      {models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.slice(0, 3).map((m: any, i: number) => {
            const mTitle = safeString(m && typeof m === 'object' ? m.title : '');
            const mDesc = safeString(m && typeof m === 'object' ? m.desc : '');
            return (
              <div key={i} className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl hover:border-violet-500/30 transition-all flex flex-col justify-between">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{mTitle}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{mDesc}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(slide.bullets || []).map((b, i) => (
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
  const rawComps = metadata.competitors;
  const compsList = Array.isArray(rawComps) ? rawComps : [];
  const competitors = compsList.filter(Boolean);

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
        <Layers className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
        {slide.title}
      </h2>

      {competitors.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {/* S - Strengths */}
          <div className="bg-[var(--theme-card)] border border-emerald-500/20 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              نقاط قوت ما (Strengths)
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pr-2">
              {(slide.bullets || []).slice(0, 3).map((b, idx) => <li key={idx}>{b}</li>)}
              {(slide.bullets || []).length === 0 && <li>مزیت انحصاری در سرعت و مقیاس کاربری</li>}
            </ul>
          </div>

          {/* W - Weaknesses */}
          <div className="bg-[var(--theme-card)] border border-rose-500/20 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ضعف رقیبان و شکاف‌ها (Weaknesses)
            </h4>
            <div className="space-y-1.5 pr-2">
              {competitors.slice(0, 3).map((c: any, idx: number) => {
                const cName = safeString(c && typeof c === 'object' ? c.name : '');
                const cWeakness = safeString(c && typeof c === 'object' ? (c.weakness || c.weaknesses) : '');
                return (
                  <div key={idx} className="text-xs text-slate-300">
                    <strong className="text-white">{cName}:</strong> {cWeakness}
                  </div>
                );
              })}
            </div>
          </div>

          {/* O - Opportunities */}
          <div className="bg-[var(--theme-card)] border border-cyan-500/20 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              فرصت‌های رشد بازار (Opportunities)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pr-2">
              تمرکز روی سهم بازار آزاد شده به خاطر عدم انطباق رقبا با قوانین بومی و نبود خدمات پشتیبانی اختصاصی در ایران.
            </p>
          </div>

          {/* T - Threats */}
          <div className="bg-[var(--theme-card)] border border-amber-500/20 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              تهدیدها و قوت رقبا (Threats)
            </h4>
            <div className="space-y-1.5 pr-2">
              {competitors.slice(0, 3).map((c: any, idx: number) => {
                const cName = safeString(c && typeof c === 'object' ? c.name : '');
                const cStrength = safeString(c && typeof c === 'object' ? (c.strength || c.strengths) : '');
                return (
                  <div key={idx} className="text-xs text-slate-300">
                    <strong className="text-white">{cName}:</strong> {cStrength}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {(slide.bullets ?? []).map((b, i) => (
            <div key={i} className="bg-[var(--theme-card)] border p-4 rounded-2xl flex gap-3 items-start" style={{ borderColor: 'var(--theme-border)' }}>
              <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] mt-2 shrink-0" />
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">{b}</p>
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
  const rawPhases = metadata.phases;
  const phasesList = Array.isArray(rawPhases) ? rawPhases : [];
  const phases = phasesList.filter(Boolean);

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
        <Milestone className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
        {slide.title}
      </h2>

      {phases.length > 0 ? (
        <div className="relative flex flex-col md:flex-row justify-between gap-4 py-8">
          {/* Connector line */}
          <div className="absolute top-[35px] left-8 right-8 h-0.5 hidden md:block opacity-35" style={{ backgroundColor: 'var(--theme-primary)' }} />
          
          {phases.slice(0, 5).map((p: any, i: number) => {
            const pPhase = safeString(p && typeof p === 'object' ? p.phase : '');
            const pDate = safeString(p && typeof p === 'object' ? p.date : '');
            const pTitle = safeString(p && typeof p === 'object' ? p.title : '');
            return (
              <div key={i} className="relative z-10 flex-1 flex flex-col items-center">
                {/* Timeline dot */}
                <div 
                  className="w-5 h-5 rounded-full border-4 mb-3 z-20 flex items-center justify-center transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: 'var(--theme-primary)'
                  }}
                />
                
                {/* Content card */}
                <div 
                  className="w-full bg-[var(--theme-card)] border p-4 rounded-2xl flex flex-col space-y-2 hover:scale-[1.02] transition-transform duration-300"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase" style={{ backgroundColor: 'var(--theme-badge-bg)', color: 'var(--theme-primary)' }}>{pPhase}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">{pDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-relaxed">{pTitle}</h4>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(slide.bullets || []).map((b, i) => (
            <div key={i} className="bg-[var(--theme-card)] border p-4 rounded-2xl flex gap-3 items-start" style={{ borderColor: 'var(--theme-border)' }}>
              <span className="w-6 h-6 rounded-lg bg-[var(--theme-badge-bg)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }}>{i+1}</span>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">{b}</p>
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
  const rawTeam = metadata.team || metadata.members || [];
  const teamList = Array.isArray(rawTeam) ? rawTeam : [];
  const team = teamList.filter(Boolean);

  const getRoleBadgeStyle = (role: any) => {
    const r = String(role || '').toLowerCase();
    if (r.includes('founder') || r.includes('ceo') || r.includes('بنیان') || r.includes('مدیر')) {
      return { border: 'rgba(16, 185, 129, 0.2)', bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' }; // Emerald
    }
    if (r.includes('cto') || r.includes('tech') || r.includes('فنی') || r.includes('برنامه')) {
      return { border: 'rgba(6, 182, 212, 0.2)', bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4' }; // Cyan
    }
    if (r.includes('cmo') || r.includes('growth') || r.includes('بازار') || r.includes('رشد')) {
      return { border: 'rgba(245, 158, 11, 0.2)', bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' }; // Amber
    }
    return { border: 'var(--theme-border)', bg: 'var(--theme-badge-bg)', text: 'var(--theme-primary)' };
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
        <Users className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
        {slide.title}
      </h2>

      {team.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {team.slice(0, 6).map((m: any, i: number) => {
            const mName = safeString(m && typeof m === 'object' ? m.name : '');
            const mRole = safeString(m && typeof m === 'object' ? m.role : '');
            const initials = mName ? mName.split(' ').map((n: string) => n[0]).join('') : '?';
            const badgeStyle = getRoleBadgeStyle(mRole);
            return (
              <div 
                key={i} 
                className="bg-[var(--theme-card)] border p-4 rounded-2xl flex items-center gap-3 hover:scale-[1.01] transition-transform duration-300"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
                  }}
                >
                  {safeString(m.initials) || initials}
                </div>
                <div className="space-y-1 overflow-hidden flex-1 text-right">
                  <h4 className="text-xs font-bold text-white truncate">{mName}</h4>
                  <span 
                    className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full border"
                    style={{ 
                      backgroundColor: badgeStyle.bg,
                      color: badgeStyle.text,
                      borderColor: badgeStyle.border
                    }}
                  >
                    {mRole}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(slide.bullets || []).map((b, i) => (
            <div key={i} className="bg-[var(--theme-card)] border p-4 rounded-xl flex gap-3 items-center" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--theme-badge-bg)', color: 'var(--theme-primary)' }}>
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
  const amount = safeString(metadata.amount || "نامشخص");
  const runway = safeString(metadata.runway || "نامشخص");
  const use = safeString(metadata.use || "توسعه محصول و مارکتینگ");
  
  // Budget breakdown metadata mapping
  const rawBudget = metadata.budget;
  const budgetList = Array.isArray(rawBudget) ? rawBudget : [];
  const budget = budgetList.length > 0 ? budgetList.filter(Boolean) : [
    { category: "توسعه محصول و تحقیق و توسعه", percentage: 45 },
    { category: "مارکتینگ و جذب مشتری", percentage: 35 },
    { category: "عملیات و تیم اداری", percentage: 20 }
  ];

  const colors = ["bg-cyan-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"];

  return (
    <div className="grid md:grid-cols-12 gap-6 items-center" dir="rtl">
      {/* Left: General Funding Ask */}
      <div className="md:col-span-5 space-y-3">
        <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
          <DollarSign className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
          {slide.title}
        </h2>
        <div className="bg-[var(--theme-card)] border p-4 rounded-2xl space-y-3" style={{ borderColor: 'var(--theme-border)' }}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">سرمایه مورد نیاز</span>
            <span className="text-xl md:text-2xl font-black" style={{ color: 'var(--theme-primary)' }}>{amount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block mb-1">مدت زمان بقا (Runway)</span>
            <span className="text-sm font-bold text-white">{runway}</span>
          </div>
        </div>
      </div>

      {/* Right: Sleek Budget Progress Allocation Card */}
      <div className="md:col-span-7">
        <div className="bg-[var(--theme-card)] border p-5 rounded-2xl space-y-4" style={{ borderColor: 'var(--theme-border)' }}>
          <h4 className="text-xs font-black text-white pb-2 border-b" style={{ borderColor: 'var(--theme-border)' }}>توزیع تخصیص منابع بودجه</h4>
          <div className="space-y-3.5">
            {budget.map((b: any, idx: number) => {
              const barColor = colors[idx % colors.length];
              const bCategory = safeString(b && typeof b === 'object' ? b.category : '');
              const bPercentageVal = parseNum(b && typeof b === 'object' ? b.percentage : 0);
              const barWidth = Math.max(0, Math.min(100, bPercentageVal));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300">{bCategory}</span>
                    <span className="font-mono" style={{ color: 'var(--theme-primary)' }}>{bPercentageVal}%</span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Traction / Metrics Layout
function TractionLayout({ slide }: { slide: PitchDeckSlide }) {
  const metadata = slide.metadata || {};
  const rawMetrics = metadata.metrics;
  const metricsList = Array.isArray(rawMetrics) ? rawMetrics : [];
  const metrics = metricsList.filter(Boolean);

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
        <Activity className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>

      {metrics.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.slice(0, 6).map((m: { label?: string; value?: string; note?: string }, i: number) => (
            <div
              key={i}
              className="bg-[var(--theme-card)] border p-4 rounded-2xl flex flex-col gap-1"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <span className="text-2xl font-black font-mono" style={{ color: "var(--theme-primary)" }}>
                {safeString(m.value) || "—"}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--theme-fg)" }}>
                {safeString(m.label) || "شاخص"}
              </span>
              {m.note ? (
                <span className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
                  {safeString(m.note)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(slide.bullets || []).map((b, i) => (
            <div
              key={i}
              className="bg-[var(--theme-card)] border p-4 rounded-2xl flex gap-3 items-start"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--theme-primary)" }} />
              <p className="text-xs leading-relaxed font-semibold" style={{ color: "var(--theme-muted)" }}>
                {b}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 11. Generic Layout
function GenericLayout({ slide }: { slide: PitchDeckSlide }) {
  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
        <Award className="w-6 h-6" />
        {slide.title}
      </h2>
      <div className="space-y-3">
        {(slide.bullets || []).map((b, i) => (
          <div
            key={i}
            className="flex gap-3 items-start bg-[var(--theme-card)] border p-3 rounded-2xl"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: "var(--theme-primary)" }} />
            <p className="text-sm md:text-base leading-relaxed font-semibold" style={{ color: "var(--theme-muted)" }}>
              {b}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
