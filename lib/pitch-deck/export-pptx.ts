/**
 * Layout-aware PPTX export for Pitch Deck V2 (RTL, Karnex colors).
 * Uses pptxgenjs dynamically on the client.
 */
import type { PitchDeckSlide } from "./types";
import { getSlideBullets } from "./migrate";
import { resolveTheme } from "./themes";

function hex(color: string): string {
  return color.replace("#", "");
}

export async function exportPitchDeckPptx(opts: {
  slides: PitchDeckSlide[];
  projectName: string;
  fileName?: string;
}): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pres = new PptxGenJS();
  pres.author = "Karnex";
  pres.title = opts.projectName || "Pitch Deck";
  (pres as any).rtlMode = true;
  pres.defineLayout({ name: "LAYOUT_16x9", width: 13.333, height: 7.5 });
  pres.layout = "LAYOUT_16x9";

  const visible = opts.slides.filter((s) => !s.isHidden);

  for (const slide of visible) {
    const theme = resolveTheme(slide.theme || slide.metadata?.theme);
    const s = pres.addSlide();
    s.background = { color: hex(theme.bg) };

    // Accent bar
    s.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 7.35,
      w: 13.333,
      h: 0.15,
      fill: { color: hex(theme.primary) },
    });

    // Brand label
    s.addText(opts.projectName || "KARNEX", {
      x: 0.5,
      y: 0.3,
      w: 8,
      h: 0.35,
      fontSize: 10,
      color: hex(theme.primary),
      bold: true,
      align: "right",
      fontFace: "Arial",
    });

    // Title
    s.addText(slide.title || "", {
      x: 0.5,
      y: 0.8,
      w: 12.3,
      h: 0.7,
      fontSize: 28,
      bold: true,
      color: hex(theme.text),
      align: "right",
      fontFace: "Arial",
    });

    const bullets = getSlideBullets(slide);
    const meta = slide.metadata || {};

    if (slide.type === "market" && (meta.tam || meta.sam || meta.som)) {
      const cards = [
        { label: "TAM", value: String(meta.tam || "—"), desc: meta.tamDesc || "" },
        { label: "SAM", value: String(meta.sam || "—"), desc: meta.samDesc || "" },
        { label: "SOM", value: String(meta.som || "—"), desc: meta.somDesc || "" },
      ];
      cards.forEach((c, i) => {
        const x = 0.5 + i * 4.2;
        s.addShape(pres.ShapeType.roundRect, {
          x,
          y: 1.8,
          w: 3.9,
          h: 2.4,
          fill: { color: hex(theme.isDark ? "#241220" : "#FFFFFF") },
          shadow: { type: "outer", color: "000000", blur: 4, opacity: 0.1 },
        });
        s.addText(c.label, {
          x,
          y: 2.0,
          w: 3.9,
          h: 0.35,
          fontSize: 12,
          color: hex(theme.secondary),
          align: "center",
          bold: true,
        });
        s.addText(c.value, {
          x,
          y: 2.5,
          w: 3.9,
          h: 0.6,
          fontSize: 16,
          color: hex(theme.primary),
          align: "center",
          bold: true,
        });
        if (c.desc) {
          s.addText(c.desc, {
            x: x + 0.15,
            y: 3.3,
            w: 3.6,
            h: 0.6,
            fontSize: 11,
            color: hex(theme.muted),
            align: "center",
          });
        }
      });
    } else if (slide.type === "ask" && meta.amount) {
      s.addShape(pres.ShapeType.roundRect, {
        x: 3.5,
        y: 1.9,
        w: 6.3,
        h: 1.6,
        fill: { color: hex(theme.primary) },
      });
      s.addText(String(meta.amount), {
        x: 3.5,
        y: 2.15,
        w: 6.3,
        h: 0.7,
        fontSize: 28,
        bold: true,
        color: "FFFFFF",
        align: "center",
      });
      s.addText(meta.runway ? `Runway: ${meta.runway}` : "درخواست سرمایه", {
        x: 3.5,
        y: 2.9,
        w: 6.3,
        h: 0.35,
        fontSize: 12,
        color: "FFFFFF",
        align: "center",
      });
      if (bullets.length) {
        s.addText(
          bullets.map((b) => ({ text: b, options: { breakLine: true } })),
          {
            x: 0.8,
            y: 3.9,
            w: 11.7,
            h: 2.8,
            fontSize: 14,
            color: hex(theme.text),
            align: "right",
          }
        );
      }
    } else if (slide.type === "team" && (meta.members || meta.team)) {
      const members = (meta.members || meta.team || []).slice(0, 4);
      members.forEach((m: any, i: number) => {
        const x = 0.5 + (i % 4) * 3.2;
        s.addShape(pres.ShapeType.roundRect, {
          x,
          y: 2.0,
          w: 3.0,
          h: 2.2,
          fill: { color: hex(theme.isDark ? "#241220" : "#FFFFFF") },
        });
        s.addText(m.name || "عضو تیم", {
          x,
          y: 2.4,
          w: 3.0,
          h: 0.5,
          fontSize: 14,
          bold: true,
          color: hex(theme.text),
          align: "center",
        });
        s.addText(m.role || "", {
          x,
          y: 3.0,
          w: 3.0,
          h: 0.4,
          fontSize: 12,
          color: hex(theme.primary),
          align: "center",
        });
      });
    } else {
      // Default bullet layout
      if (bullets.length) {
        s.addText(
          bullets.map((b) => ({ text: b, options: { breakLine: true, bullet: false } })),
          {
            x: 0.7,
            y: 1.8,
            w: 12,
            h: 4.8,
            fontSize: 16,
            color: hex(theme.text),
            align: "right",
            fontFace: "Arial",
          }
        );
      }
    }

    // Speaker notes
    if (slide.notes) {
      s.addNotes(slide.notes);
    }
  }

  const name = opts.fileName || `${opts.projectName || "pitch-deck"}.pptx`;
  await pres.writeFile({ fileName: name });
}
