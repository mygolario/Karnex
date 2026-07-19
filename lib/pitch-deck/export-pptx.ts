import type { PitchDeckSlide } from "@/lib/db";
import { resolveTheme } from "./themes";
import { getVisibleSlides, safeString } from "./utils";

type PptxPres = InstanceType<typeof import("pptxgenjs").default>;

function themeFor(slide: PitchDeckSlide) {
  return resolveTheme(slide.metadata?.theme);
}

function addTitle(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  text: string,
  theme: ReturnType<typeof resolveTheme>,
  y = 0.35
) {
  pptxSlide.addText(text, {
    x: 0.4,
    y,
    w: 9.2,
    h: 0.7,
    fontSize: 26,
    bold: true,
    color: theme.pptxPrimary,
    rtlMode: true,
    align: "right",
    fontFace: "Arial",
  });
}

function addBullets(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  bullets: string[],
  theme: ReturnType<typeof resolveTheme>,
  opts: { x?: number; y?: number; w?: number; h?: number } = {}
) {
  const items = (bullets || []).filter(Boolean).map((b) => ({
    text: b,
    options: {
      rtlMode: true,
      fontSize: 15,
      color: theme.pptxFg,
      breakLine: true,
      bullet: true,
    },
  }));
  if (items.length === 0) return;
  pptxSlide.addText(items, {
    x: opts.x ?? 0.4,
    y: opts.y ?? 1.3,
    w: opts.w ?? 9.2,
    h: opts.h ?? 3.8,
    align: "right",
    fontFace: "Arial",
    valign: "top",
  });
}

function renderMarket(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  const rows = [
    ["TAM", safeString(slide.metadata?.tam), safeString(slide.metadata?.tamDesc)],
    ["SAM", safeString(slide.metadata?.sam), safeString(slide.metadata?.samDesc)],
    ["SOM", safeString(slide.metadata?.som), safeString(slide.metadata?.somDesc)],
  ];
  pptxSlide.addTable(
    [
      [
        { text: "سطح", options: { bold: true, color: theme.pptxPrimary } },
        { text: "مقدار", options: { bold: true, color: theme.pptxPrimary } },
        { text: "توضیح", options: { bold: true, color: theme.pptxPrimary } },
      ],
      ...rows.map(([a, b, c]) => [
        { text: a, options: { color: theme.pptxFg } },
        { text: b || "—", options: { color: theme.pptxFg } },
        { text: c || "—", options: { color: theme.pptxMuted } },
      ]),
    ],
    {
      x: 0.4,
      y: 1.3,
      w: 9.2,
      colW: [1.5, 3, 4.7],
      border: { type: "solid", pt: 0.5, color: theme.pptxPrimary },
      fontFace: "Arial",
      fontSize: 13,
      align: "right",
    }
  );
  addBullets(pptxSlide, slide.bullets || [], theme, { y: 3.6, h: 1.6 });
}

function renderCompetition(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  const comps = Array.isArray(slide.metadata?.competitors)
    ? slide.metadata!.competitors
    : [];
  if (comps.length > 0) {
    pptxSlide.addTable(
      [
        [
          { text: "رقیب", options: { bold: true, color: theme.pptxPrimary } },
          { text: "نقطه قوت", options: { bold: true, color: theme.pptxPrimary } },
          { text: "نقطه ضعف", options: { bold: true, color: theme.pptxPrimary } },
        ],
        ...comps.slice(0, 6).map((c: { name?: string; strength?: string; weakness?: string }) => [
          { text: safeString(c?.name), options: { color: theme.pptxFg } },
          { text: safeString(c?.strength), options: { color: theme.pptxFg } },
          { text: safeString(c?.weakness), options: { color: theme.pptxMuted } },
        ]),
      ],
      {
        x: 0.4,
        y: 1.2,
        w: 9.2,
        colW: [2.4, 3.4, 3.4],
        border: { type: "solid", pt: 0.5, color: theme.pptxPrimary },
        fontFace: "Arial",
        fontSize: 12,
        align: "right",
      }
    );
  }
  addBullets(pptxSlide, slide.bullets || [], theme, { y: 4.0, h: 1.4 });
}

function renderRoadmap(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  const phases = Array.isArray(slide.metadata?.phases) ? slide.metadata!.phases : [];
  if (phases.length > 0) {
    const colW = 9.0 / Math.min(phases.length, 5);
    phases.slice(0, 5).forEach(
      (
        p: { phase?: string; title?: string; date?: string },
        i: number
      ) => {
        const x = 0.45 + i * colW;
        pptxSlide.addShape("roundRect" as never, {
          x,
          y: 1.4,
          w: colW - 0.15,
          h: 2.4,
          fill: { color: theme.pptxBg },
          line: { color: theme.pptxPrimary, pt: 1 },
        });
        pptxSlide.addText(safeString(p.phase), {
          x,
          y: 1.5,
          w: colW - 0.15,
          h: 0.35,
          fontSize: 11,
          bold: true,
          color: theme.pptxPrimary,
          align: "center",
          fontFace: "Arial",
        });
        pptxSlide.addText(safeString(p.title), {
          x: x + 0.05,
          y: 2.0,
          w: colW - 0.25,
          h: 1.2,
          fontSize: 12,
          color: theme.pptxFg,
          align: "center",
          fontFace: "Arial",
        });
        pptxSlide.addText(safeString(p.date), {
          x,
          y: 3.4,
          w: colW - 0.15,
          h: 0.3,
          fontSize: 10,
          color: theme.pptxMuted,
          align: "center",
          fontFace: "Arial",
        });
      }
    );
  } else {
    addBullets(pptxSlide, slide.bullets || [], theme);
  }
}

function renderTeam(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  const team = Array.isArray(slide.metadata?.team)
    ? slide.metadata!.team
    : Array.isArray(slide.metadata?.members)
      ? slide.metadata!.members
      : [];
  if (team.length > 0) {
    team.slice(0, 6).forEach(
      (m: { name?: string; role?: string }, i: number) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.5 + col * 3.1;
        const y = 1.3 + row * 1.8;
        pptxSlide.addShape("roundRect" as never, {
          x,
          y,
          w: 2.9,
          h: 1.5,
          fill: { color: theme.pptxBg },
          line: { color: theme.pptxPrimary, pt: 1 },
        });
        pptxSlide.addText(safeString(m.name), {
          x,
          y: y + 0.35,
          w: 2.9,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: theme.pptxFg,
          align: "center",
          fontFace: "Arial",
        });
        pptxSlide.addText(safeString(m.role), {
          x,
          y: y + 0.85,
          w: 2.9,
          h: 0.35,
          fontSize: 11,
          color: theme.pptxPrimary,
          align: "center",
          fontFace: "Arial",
        });
      }
    );
  } else {
    addBullets(pptxSlide, slide.bullets || [], theme);
  }
}

function renderAsk(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  pptxSlide.addText(`مبلغ: ${safeString(slide.metadata?.amount) || "—"}`, {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: theme.pptxPrimary,
    rtlMode: true,
    align: "right",
    fontFace: "Arial",
  });
  pptxSlide.addText(`ران‌وی: ${safeString(slide.metadata?.runway) || "—"}`, {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 0.4,
    fontSize: 16,
    color: theme.pptxFg,
    rtlMode: true,
    align: "right",
    fontFace: "Arial",
  });
  pptxSlide.addText(`محل مصرف: ${safeString(slide.metadata?.use) || "—"}`, {
    x: 0.5,
    y: 2.4,
    w: 9,
    h: 0.4,
    fontSize: 14,
    color: theme.pptxMuted,
    rtlMode: true,
    align: "right",
    fontFace: "Arial",
  });
  const budget = Array.isArray(slide.metadata?.budget) ? slide.metadata!.budget : [];
  if (budget.length > 0) {
    pptxSlide.addTable(
      [
        [
          { text: "دسته", options: { bold: true, color: theme.pptxPrimary } },
          { text: "درصد", options: { bold: true, color: theme.pptxPrimary } },
        ],
        ...budget.slice(0, 6).map((b: { category?: string; percentage?: number }) => [
          { text: safeString(b.category), options: { color: theme.pptxFg } },
          {
            text: `${b.percentage ?? 0}%`,
            options: { color: theme.pptxFg },
          },
        ]),
      ],
      {
        x: 0.5,
        y: 3.1,
        w: 9,
        colW: [6.5, 2.5],
        border: { type: "solid", pt: 0.5, color: theme.pptxPrimary },
        fontFace: "Arial",
        fontSize: 12,
        align: "right",
      }
    );
  }
}

function renderTraction(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  const metrics = Array.isArray(slide.metadata?.metrics) ? slide.metadata!.metrics : [];
  if (metrics.length > 0) {
    metrics.slice(0, 6).forEach(
      (m: { label?: string; value?: string; note?: string }, i: number) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.5 + col * 3.1;
        const y = 1.3 + row * 1.7;
        pptxSlide.addShape("roundRect" as never, {
          x,
          y,
          w: 2.9,
          h: 1.45,
          fill: { color: theme.pptxBg },
          line: { color: theme.pptxPrimary, pt: 1 },
        });
        pptxSlide.addText(safeString(m.value), {
          x,
          y: y + 0.25,
          w: 2.9,
          h: 0.45,
          fontSize: 20,
          bold: true,
          color: theme.pptxPrimary,
          align: "center",
          fontFace: "Arial",
        });
        pptxSlide.addText(safeString(m.label), {
          x,
          y: y + 0.75,
          w: 2.9,
          h: 0.35,
          fontSize: 12,
          color: theme.pptxFg,
          align: "center",
          fontFace: "Arial",
        });
      }
    );
  } else {
    addBullets(pptxSlide, slide.bullets || [], theme);
  }
}

function renderBusinessModel(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  const models = Array.isArray(slide.metadata?.models) ? slide.metadata!.models : [];
  if (models.length > 0) {
    models.slice(0, 3).forEach(
      (m: { title?: string; desc?: string }, i: number) => {
        const x = 0.4 + i * 3.15;
        pptxSlide.addShape("roundRect" as never, {
          x,
          y: 1.3,
          w: 3.0,
          h: 2.8,
          fill: { color: theme.pptxBg },
          line: { color: theme.pptxPrimary, pt: 1 },
        });
        pptxSlide.addText(safeString(m.title), {
          x: x + 0.1,
          y: 1.5,
          w: 2.8,
          h: 0.6,
          fontSize: 14,
          bold: true,
          color: theme.pptxPrimary,
          align: "center",
          fontFace: "Arial",
        });
        pptxSlide.addText(safeString(m.desc), {
          x: x + 0.1,
          y: 2.3,
          w: 2.8,
          h: 1.5,
          fontSize: 12,
          color: theme.pptxFg,
          align: "center",
          fontFace: "Arial",
        });
      }
    );
  } else {
    addBullets(pptxSlide, slide.bullets || [], theme);
  }
}

function renderDefault(
  pptxSlide: ReturnType<PptxPres["addSlide"]>,
  slide: PitchDeckSlide,
  theme: ReturnType<typeof resolveTheme>
) {
  addTitle(pptxSlide, slide.title, theme);
  addBullets(pptxSlide, slide.bullets || [], theme);
}

export async function exportPitchDeckPptx(opts: {
  slides: PitchDeckSlide[];
  projectName: string;
}): Promise<void> {
  const pptxgen = (await import("pptxgenjs")).default;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.rtlMode = true;
  pres.author = "Karnex AI";
  pres.company = opts.projectName || "Startup";
  pres.subject = "Pitch Deck";
  pres.title = opts.projectName || "Pitch Deck";

  const visible = getVisibleSlides(opts.slides);

  visible.forEach((slide) => {
    const theme = themeFor(slide);
    const pptxSlide = pres.addSlide();
    pptxSlide.background = { color: theme.pptxBg };

    switch (slide.type) {
      case "market":
      case "market_size":
        renderMarket(pptxSlide, slide, theme);
        break;
      case "competition":
        renderCompetition(pptxSlide, slide, theme);
        break;
      case "roadmap":
        renderRoadmap(pptxSlide, slide, theme);
        break;
      case "team":
        renderTeam(pptxSlide, slide, theme);
        break;
      case "ask":
        renderAsk(pptxSlide, slide, theme);
        break;
      case "traction":
        renderTraction(pptxSlide, slide, theme);
        break;
      case "business_model":
        renderBusinessModel(pptxSlide, slide, theme);
        break;
      default:
        renderDefault(pptxSlide, slide, theme);
        break;
    }
  });

  const safeName = (opts.projectName || "PitchDeck").replace(/[\\/:*?"<>|]/g, "-");
  await pres.writeFile({ fileName: `${safeName}.pptx` });
}
