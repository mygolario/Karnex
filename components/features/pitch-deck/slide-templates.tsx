"use client";

import React from "react";
import type { PitchDeckSlide } from "@/lib/pitch-deck/types";
import { getSlideBullets } from "@/lib/pitch-deck/migrate";
import { SlideThemes, resolveTheme } from "@/lib/pitch-deck/themes";
import { convertPersianArabicDigits, parseNum, safeString } from "@/lib/pitch-deck/utils";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ShieldAlert,
  CheckCircle,
  Milestone,
  Zap,
  Layers,
  Award,
  Check,
  X,
  Rocket,
  BarChart3,
  Map,
  Eye,
  PieChart,
} from "lucide-react";

export { SlideThemes, resolveTheme };

interface SlideTemplatesProps {
  slide: PitchDeckSlide;
  index: number;
  total: number;
  projectName: string;
  isExport?: boolean;
}

export function SlideVisualizer({
  slide,
  index,
  total,
  projectName,
}: SlideTemplatesProps) {
  if (!slide) return null;

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
      case "traction":
        return <TractionLayout slide={slide} />;
      case "product":
        return <ProductLayout slide={slide} />;
      case "gtm":
        return <GtmLayout slide={slide} />;
      case "financials":
        return <FinancialsLayout slide={slide} />;
      case "use_of_funds":
        return <UseOfFundsLayout slide={slide} />;
      case "vision":
      case "moat":
        return <VisionLayout slide={slide} />;
      case "closing":
      case "generic":
      default:
        return <GenericLayout slide={slide} />;
    }
  };

  const activeTheme = resolveTheme(slide.theme || slide.metadata?.theme);
  const textClass = activeTheme.isDark ? "text-white" : "text-neutral-900";

  return (
    <div
      className={`w-full h-full p-8 md:p-10 flex flex-col relative overflow-hidden select-none transition-all duration-300 ${textClass}`}
      style={{
        backgroundColor: activeTheme.bg,
        borderColor: activeTheme.border,
        ["--theme-bg" as string]: activeTheme.bg,
        ["--theme-card" as string]: activeTheme.card,
        ["--theme-border" as string]: activeTheme.border,
        ["--theme-primary" as string]: activeTheme.primary,
        ["--theme-secondary" as string]: activeTheme.secondary,
        ["--theme-glow1" as string]: activeTheme.glow1,
        ["--theme-glow2" as string]: activeTheme.glow2,
        ["--theme-accent" as string]: activeTheme.accentGradient,
        ["--theme-badge-bg" as string]: activeTheme.badgeBg,
        ["--theme-text" as string]: activeTheme.text,
        ["--theme-muted" as string]: activeTheme.muted,
        color: activeTheme.text,
      }}
    >
      <div
        className="absolute -top-24 -start-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: "var(--theme-glow1)" }}
      />
      <div
        className="absolute -bottom-24 -end-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ backgroundColor: "var(--theme-glow2)" }}
      />

      <div
        className="flex justify-between items-center mb-6 border-b pb-3 relative z-10"
        style={{ borderColor: "var(--theme-border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--theme-primary)" }}
          />
          <span
            className="text-xs font-black tracking-widest uppercase"
            style={{ color: "var(--theme-primary)" }}
          >
            {projectName || "KARNEX"}
          </span>
        </div>
        <span
          className="text-xs font-mono border px-2 py-0.5 rounded-full"
          style={{
            borderColor: "var(--theme-border)",
            color: "var(--theme-secondary)",
            backgroundColor: "var(--theme-badge-bg)",
          }}
        >
          اسلاید {index + 1} از {total}
        </span>
      </div>

      <div className="flex-1 flex flex-col relative z-10 justify-center">
        {renderLayout()}
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-1 opacity-90"
        style={{ backgroundImage: "var(--theme-accent)" }}
      />
    </div>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${className}`}
      style={{
        backgroundColor: "var(--theme-card)",
        borderColor: "var(--theme-border)",
      }}
    >
      {children}
    </div>
  );
}

function TitleLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  return (
    <div className="text-center py-6 flex flex-col items-center justify-center space-y-6" dir="rtl">
      <div className="relative">
        <div
          className="absolute inset-0 blur-2xl rounded-full scale-150 opacity-40"
          style={{ backgroundColor: "var(--theme-primary)" }}
        />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 relative"
          style={{ backgroundImage: "var(--theme-accent)" }}
        >
          <Zap className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="space-y-3 max-w-xl">
        <h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
          style={{
            backgroundImage: "var(--theme-accent)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {slide.title}
        </h1>
        {bullets[0] && (
          <p className="text-base font-medium" style={{ color: "var(--theme-primary)" }}>
            {bullets[0]}
          </p>
        )}
      </div>
      {bullets.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mt-2 max-w-lg">
          {bullets.slice(1).map((b, i) => (
            <span
              key={i}
              className="text-xs border px-3 py-1.5 rounded-xl"
              style={{
                borderColor: "var(--theme-border)",
                backgroundColor: "var(--theme-card)",
                color: "var(--theme-muted)",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProblemLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  return (
    <div className="grid md:grid-cols-12 gap-6 items-center" dir="rtl">
      <div className="md:col-span-7 space-y-4">
        <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--theme-secondary)" }}>
          <ShieldAlert className="w-6 h-6" />
          {slide.title}
        </h2>
        <div className="space-y-3">
          {bullets.map((b, i) => (
            <CardShell key={i} className="flex gap-3 items-start">
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0"
                style={{ backgroundColor: "var(--theme-badge-bg)", color: "var(--theme-secondary)" }}
              >
                {i + 1}
              </span>
              <p className="text-sm md:text-base leading-relaxed font-medium" style={{ color: "var(--theme-text)" }}>
                {b}
              </p>
            </CardShell>
          ))}
        </div>
      </div>
      <div className="md:col-span-5 hidden md:flex justify-center">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center border-4"
          style={{ borderColor: "var(--theme-secondary)", backgroundColor: "var(--theme-badge-bg)" }}
        >
          <span className="text-sm font-bold" style={{ color: "var(--theme-secondary)" }}>
            چالش بازار
          </span>
        </div>
      </div>
    </div>
  );
}

function SolutionLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--theme-primary)" }}>
        <CheckCircle className="w-6 h-6" />
        {slide.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-3">
        {bullets.slice(0, 3).map((b, i) => (
          <CardShell key={i} className="space-y-2 min-h-[110px]">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundImage: "var(--theme-accent)" }}
            >
              {i + 1}
            </div>
            <p className="text-sm leading-relaxed font-medium">{b}</p>
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function MarketLayout({ slide }: { slide: PitchDeckSlide }) {
  const meta = slide.metadata || {};
  const bullets = getSlideBullets(slide);
  const cards = [
    { key: "TAM", value: meta.tam, desc: meta.tamDesc },
    { key: "SAM", value: meta.sam, desc: meta.samDesc },
    { key: "SOM", value: meta.som, desc: meta.somDesc },
  ];
  const tam = Math.max(parseNum(meta.tam), 0.0001);
  const sam = Math.max(parseNum(meta.sam), 0);
  const som = Math.max(parseNum(meta.som), 0);
  const t = tam;
  const s = sam;
  const o = som;
  const rTam = 120;
  const rSam = Math.max(45, Math.min(rTam - 20, rTam * Math.sqrt(s / t)));
  const rSom = Math.max(20, Math.min(rSam - 15, rTam * Math.sqrt(o / t)));

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Target className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="grid grid-cols-3 gap-2">
          {cards.map((c) => (
            <CardShell key={c.key} className="text-center space-y-1">
              <p className="text-[10px] font-bold" style={{ color: "var(--theme-secondary)" }}>
                {c.key}
              </p>
              <p className="text-sm font-black" style={{ color: "var(--theme-primary)" }}>
                {safeString(c.value) || "—"}
              </p>
              {c.desc && (
                <p className="text-[10px] leading-snug" style={{ color: "var(--theme-muted)" }}>
                  {safeString(c.desc)}
                </p>
              )}
            </CardShell>
          ))}
        </div>
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 260 260" className="w-full h-full pitch-market-circles">
            <circle
              cx="130"
              cy="130"
              r={rTam}
              fill="none"
              stroke="var(--theme-primary)"
              strokeWidth="2"
              opacity="0.35"
            />
            <circle
              cx="130"
              cy="130"
              r={rSam}
              fill="none"
              stroke="var(--theme-secondary)"
              strokeWidth="2"
              opacity="0.55"
            />
            <circle
              cx="130"
              cy="130"
              r={rSom}
              fill="var(--theme-badge-bg)"
              stroke="var(--theme-primary)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      {bullets.length > 0 && (
        <ul className="space-y-1 text-sm" style={{ color: "var(--theme-muted)" }}>
          {bullets.slice(0, 3).map((b, i) => (
            <li key={i}>• {b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BusinessModelLayout({ slide }: { slide: PitchDeckSlide }) {
  const models = (slide.metadata?.models || []).slice(0, 3);
  const bullets = getSlideBullets(slide);
  const items =
    models.length > 0
      ? models
      : bullets.slice(0, 3).map((b) => ({ title: b, desc: "" }));

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <DollarSign className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-3">
        {items.map((m: any, i: number) => (
          <CardShell key={i} className="space-y-2 min-h-[100px]">
            <Layers className="w-5 h-5" style={{ color: "var(--theme-secondary)" }} />
            <p className="font-bold text-sm">{m.title || m}</p>
            {m.desc && (
              <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
                {m.desc}
              </p>
            )}
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function CompetitionLayout({ slide }: { slide: PitchDeckSlide }) {
  const layout = slide.metadata?.competitionLayout || "matrix";
  const rawCompetitors = slide.metadata?.competitors;
  const competitors = Array.isArray(rawCompetitors)
    ? rawCompetitors.filter(Boolean)
    : [];
  const bullets = getSlideBullets(slide);

  if (layout === "swot") {
    const cells = [
      { t: "قوت", items: bullets.slice(0, 2), color: "var(--theme-primary)" },
      { t: "ضعف", items: bullets.slice(2, 4), color: "var(--theme-secondary)" },
      {
        t: "فرصت",
        items: competitors.slice(0, 2).map((c: any) => safeString(c?.weakness || c?.name)),
        color: "var(--theme-primary)",
      },
      {
        t: "تهدید",
        items: competitors.slice(0, 2).map((c: any) => safeString(c?.strength || c?.name)),
        color: "var(--theme-secondary)",
      },
    ];
    return (
      <div className="space-y-4" dir="rtl">
        <h2 className="text-2xl font-black">{slide.title}</h2>
        <div className="grid grid-cols-2 gap-2">
          {cells.map((c) => (
            <CardShell key={c.t}>
              <p className="text-xs font-bold mb-2" style={{ color: c.color }}>
                {c.t}
              </p>
              <ul className="space-y-1 text-xs">
                {(c.items || []).map((it: string, i: number) => (
                  <li key={i}>{safeString(it)}</li>
                ))}
              </ul>
            </CardShell>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "table") {
    return (
      <div className="space-y-4" dir="rtl">
        <h2 className="text-2xl font-black">{slide.title}</h2>
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--theme-border)" }}>
          <table className="w-full text-xs">
            <thead style={{ backgroundColor: "var(--theme-badge-bg)" }}>
              <tr>
                <th className="p-2 text-start">رقیب</th>
                <th className="p-2 text-start">قوت</th>
                <th className="p-2 text-start">ضعف</th>
              </tr>
            </thead>
            <tbody>
              {competitors.slice(0, 5).map((c: any, i: number) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--theme-border)" }}>
                  <td className="p-2 font-bold">{safeString(c?.name)}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1">
                      <Check size={10} style={{ color: "var(--theme-primary)" }} />
                      {safeString(c?.strength)}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-1">
                      <X size={10} style={{ color: "var(--theme-secondary)" }} />
                      {safeString(c?.weakness)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Default 2x2-ish matrix cards
  return (
    <div className="space-y-4" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Award className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        {competitors.slice(0, 4).map((c: any, i: number) => (
          <CardShell key={i} className="space-y-1">
            <p className="font-bold text-sm">{safeString(c?.name) || `رقیب ${i + 1}`}</p>
            <p className="text-xs" style={{ color: "var(--theme-primary)" }}>
              قوت: {safeString(c?.strength) || "—"}
            </p>
            <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
              ضعف: {safeString(c?.weakness) || "—"}
            </p>
          </CardShell>
        ))}
        {competitors.length === 0 &&
          bullets.slice(0, 4).map((b, i) => (
            <CardShell key={i}>
              <p className="text-sm">{b}</p>
            </CardShell>
          ))}
      </div>
    </div>
  );
}

function RoadmapLayout({ slide }: { slide: PitchDeckSlide }) {
  const phases = slide.metadata?.phases || [];
  const bullets = getSlideBullets(slide);
  const items =
    phases.length > 0
      ? phases
      : bullets.map((b, i) => ({ phase: `فاز ${i + 1}`, title: b, date: "" }));

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Milestone className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {items.slice(0, 5).map((p: any, i: number) => (
          <CardShell key={i} className="min-w-[140px] space-y-1">
            <p className="text-[10px] font-bold" style={{ color: "var(--theme-secondary)" }}>
              {p.phase || `فاز ${i + 1}`}
            </p>
            <p className="text-sm font-bold">{p.title}</p>
            {p.date && (
              <p className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
                {p.date}
              </p>
            )}
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function TeamLayout({ slide }: { slide: PitchDeckSlide }) {
  const rawMembers = slide.metadata?.members || slide.metadata?.team;
  const members = Array.isArray(rawMembers) ? rawMembers.filter(Boolean) : [];
  const bullets = getSlideBullets(slide);
  const list =
    members.length > 0
      ? members
      : bullets.map((b) => {
          const [name, role] = b.split(/[-–—:]/);
          return { name: name?.trim() || b, role: role?.trim() || "" };
        });

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Users className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {list.slice(0, 8).map((m: any, i: number) => {
          const name = safeString(m?.name) || "عضو تیم";
          const role = safeString(m?.role || m?.bio);
          const photo = typeof m?.photo === "string" ? m.photo : "";
          return (
            <CardShell key={i} className="text-center space-y-2">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={name} className="w-12 h-12 rounded-full object-cover mx-auto" />
              ) : (
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold"
                  style={{ backgroundImage: "var(--theme-accent)" }}
                >
                  {name[0] || "?"}
                </div>
              )}
              <p className="text-sm font-bold">{name}</p>
              <p className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
                {role}
              </p>
            </CardShell>
          );
        })}
      </div>
    </div>
  );
}

function AskLayout({ slide }: { slide: PitchDeckSlide }) {
  const meta = slide.metadata || {};
  const bullets = getSlideBullets(slide);
  const breakdown = meta.budgetBreakdown || meta.allocation || [];

  return (
    <div className="grid md:grid-cols-2 gap-6 items-center" dir="rtl">
      <div className="space-y-4">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Rocket className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
          {slide.title}
        </h2>
        <div
          className="rounded-3xl p-6 text-white text-center space-y-2"
          style={{ backgroundImage: "var(--theme-accent)" }}
        >
          <p className="text-xs opacity-90">مبلغ جذب سرمایه</p>
          <p className="text-3xl font-black">{safeString(meta.amount) || "—"}</p>
          {meta.runway && <p className="text-sm opacity-90">Runway: {safeString(meta.runway)}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {Array.isArray(breakdown) && breakdown.length > 0
          ? breakdown.slice(0, 4).map((b: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{b.label || b.title || `بخش ${i + 1}`}</span>
                  <span>{b.percent || b.value || ""}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--theme-badge-bg)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, parseNum(b.percent || b.value || 25))}%`,
                      backgroundImage: "var(--theme-accent)",
                    }}
                  />
                </div>
              </div>
            ))
          : bullets.map((b, i) => (
              <CardShell key={i}>
                <p className="text-sm">{b}</p>
              </CardShell>
            ))}
        {meta.use && (
          <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
            مصرف اصلی: {safeString(meta.use)}
          </p>
        )}
      </div>
    </div>
  );
}

function TractionLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  const metrics = slide.metadata?.metrics || [];
  const chart = slide.blocks?.find((b) => b.type === "chart")?.chartData || metrics;

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <TrendingUp className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      {slide.metadata?.validationScore != null && (
        <p className="text-sm" style={{ color: "var(--theme-secondary)" }}>
          امتیاز اعتبارسنجی: {slide.metadata.validationScore}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(chart.length > 0 ? chart : bullets.slice(0, 4).map((b) => ({ label: b, value: 1 }))).map(
          (m: any, i: number) => (
            <CardShell key={i} className="text-center space-y-2">
              <BarChart3 className="w-4 h-4 mx-auto" style={{ color: "var(--theme-primary)" }} />
              <p className="text-lg font-black" style={{ color: "var(--theme-primary)" }}>
                {m.value != null ? convertPersianArabicDigits(m.value) : "—"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
                {m.label || m.name || bullets[i] || "متریک"}
              </p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--theme-badge-bg)" }}>
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, 30 + (parseNum(m.value) % 70))}%`,
                    backgroundImage: "var(--theme-accent)",
                  }}
                />
              </div>
            </CardShell>
          )
        )}
      </div>
    </div>
  );
}

function ProductLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  const image =
    slide.metadata?.imageUrl ||
    slide.blocks?.find((b) => b.type === "image")?.imageUrl;

  return (
    <div className="grid md:grid-cols-2 gap-6 items-center" dir="rtl">
      <div className="space-y-4">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Eye className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
          {slide.title}
        </h2>
        <ul className="space-y-2">
          {bullets.map((b, i) => (
            <CardShell key={i}>
              <p className="text-sm">{b}</p>
            </CardShell>
          ))}
        </ul>
      </div>
      <div
        className="aspect-video rounded-2xl border flex items-center justify-center overflow-hidden"
        style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-card)" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="product" className="w-full h-full object-cover" />
        ) : (
          <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
            تصویر محصول / اسکرین‌شات
          </p>
        )}
      </div>
    </div>
  );
}

function GtmLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Map className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="grid md:grid-cols-3 gap-3">
        {bullets.slice(0, 6).map((b, i) => (
          <CardShell key={i} className="space-y-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
              style={{ backgroundColor: "var(--theme-badge-bg)", color: "var(--theme-primary)" }}
            >
              کانال {i + 1}
            </span>
            <p className="text-sm font-medium">{b}</p>
          </CardShell>
        ))}
      </div>
    </div>
  );
}

function FinancialsLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  const meta = slide.metadata || {};
  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <PieChart className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
        {slide.title}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "درآمد ماهانه", v: meta.revenue || meta.monthlyRevenue },
          { l: "هزینه ماهانه", v: meta.burn || meta.monthlyBurn },
          { l: "Runway", v: meta.runway },
        ].map((c) => (
          <CardShell key={c.l} className="text-center">
            <p className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
              {c.l}
            </p>
            <p className="text-sm font-black" style={{ color: "var(--theme-primary)" }}>
              {safeString(c.v) || "—"}
            </p>
          </CardShell>
        ))}
      </div>
      <ul className="space-y-1 text-sm">
        {bullets.map((b, i) => (
          <li key={i}>• {b}</li>
        ))}
      </ul>
    </div>
  );
}

function UseOfFundsLayout({ slide }: { slide: PitchDeckSlide }) {
  const meta = slide.metadata || {};
  const breakdown = meta.budgetBreakdown || meta.allocation || [];
  const bullets = getSlideBullets(slide);
  const items =
    Array.isArray(breakdown) && breakdown.length > 0
      ? breakdown
      : bullets.map((b, i) => ({ label: b, percent: 20 + i * 5 }));

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black">{slide.title}</h2>
      <div className="space-y-3">
        {items.slice(0, 6).map((b: any, i: number) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span>{b.label || b.title || b}</span>
              <span>{b.percent != null ? `${b.percent}%` : ""}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--theme-badge-bg)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, parseNum(b.percent) || 25)}%`,
                  backgroundImage: "var(--theme-accent)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisionLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  return (
    <div className="text-center space-y-6 max-w-2xl mx-auto" dir="rtl">
      <h2
        className="text-3xl font-black"
        style={{
          backgroundImage: "var(--theme-accent)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {slide.title}
      </h2>
      <div className="space-y-3">
        {bullets.map((b, i) => (
          <p key={i} className="text-base leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            {b}
          </p>
        ))}
      </div>
    </div>
  );
}

function GenericLayout({ slide }: { slide: PitchDeckSlide }) {
  const bullets = getSlideBullets(slide);
  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-2xl font-black">{slide.title}</h2>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <CardShell key={i} className="flex gap-2 items-start">
            <span
              className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
              style={{ backgroundColor: "var(--theme-primary)" }}
            />
            <p className="text-sm leading-relaxed">{b}</p>
          </CardShell>
        ))}
      </ul>
    </div>
  );
}
