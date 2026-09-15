import type { ProjectSnapshot } from "./types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function sectionText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        const rec = asRecord(item);
        return String(rec.content ?? rec.title ?? rec.text ?? "").trim();
      })
      .filter(Boolean)
      .join("؛ ");
  }
  const rec = asRecord(content);
  return String(rec.content ?? rec.title ?? rec.text ?? "").trim();
}

export function stepTitle(step: unknown): string {
  if (typeof step === "string") return step.trim();
  const rec = asRecord(step);
  return String(rec.title ?? rec.name ?? "").trim();
}

export function stepId(step: unknown): string {
  if (typeof step === "string") return step.trim();
  const rec = asRecord(step);
  return String(rec.id ?? rec.title ?? "").trim();
}

function pitchOneLiner(data: Record<string, unknown>): string {
  const deck = Array.isArray(data.pitchDeck) ? data.pitchDeck : [];
  for (const slide of deck) {
    const rec = asRecord(slide);
    const bullets = Array.isArray(rec.bullets)
      ? rec.bullets.map((b) => String(b)).filter(Boolean)
      : [];
    const title = String(rec.title ?? "").trim();
    if (title) return bullets[0] ? `${title} — ${bullets[0]}` : title;
  }
  return String(data.tagline ?? "").trim();
}

function competitorList(data: Record<string, unknown>): ProjectSnapshot["competitors"] {
  const intel = asRecord(data.competitorIntel);
  const fromIntel = Array.isArray(intel.competitors) ? intel.competitors : [];
  if (fromIntel.length) {
    return fromIntel
      .map((c) => {
        const rec = asRecord(c);
        const status = String(rec.status ?? "active");
        if (status === "dismissed") return null;
        const name = String(rec.name ?? "").trim();
        if (!name) return null;
        const threat = Number(rec.threatScore);
        return {
          name,
          strength: String(rec.strength ?? "").trim() || undefined,
          weakness: String(rec.weakness ?? "").trim() || undefined,
          threatScore: Number.isFinite(threat) ? threat : undefined,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }
  const legacy = Array.isArray(data.competitors) ? data.competitors : [];
  return legacy
    .map((c) => {
      const rec = asRecord(c);
      const name = String(rec.name ?? rec.title ?? "").trim();
      if (!name) return null;
      return {
        name,
        strength: String(rec.strength ?? "").trim() || undefined,
        weakness: String(rec.weakness ?? "").trim() || undefined,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
}

export function collectRoadmapSteps(data: Record<string, unknown>): {
  titles: string[];
  nextSteps: string[];
  completedCount: number;
  totalSteps: number;
} {
  const roadmap = Array.isArray(data.roadmap) ? data.roadmap : [];
  const completed = new Set(
    (Array.isArray(data.completedSteps) ? data.completedSteps : []).map((s) =>
      String(s).trim(),
    ),
  );
  const titles: string[] = [];
  const nextSteps: string[] = [];
  let completedCount = 0;

  for (const phase of roadmap) {
    const rec = asRecord(phase);
    const steps = Array.isArray(rec.steps) ? rec.steps : [];
    for (const step of steps) {
      const title = stepTitle(step);
      if (!title) continue;
      titles.push(title);
      const id = stepId(step);
      const obj = asRecord(step);
      const status = String(obj.status ?? "");
      const done =
        status === "done" ||
        completed.has(title) ||
        (id !== "" && completed.has(id));
      if (done) completedCount += 1;
      else if (nextSteps.length < 5) nextSteps.push(title);
    }
  }

  return {
    titles,
    nextSteps,
    completedCount,
    totalSteps: titles.length,
  };
}

export function buildProjectSnapshot(
  data: Record<string, unknown> | null | undefined,
  extras?: {
    projectId?: string;
    projectName?: string;
    tagline?: string;
    description?: string;
  },
): ProjectSnapshot {
  const d = data ? asRecord(data) : {};
  const canvas = asRecord(d.leanCanvas);
  const brand = asRecord(d.brandCanvas);
  const { nextSteps, completedCount, totalSteps } = collectRoadmapSteps(d);
  const intel = asRecord(d.competitorIntel);

  return {
    projectId: extras?.projectId,
    projectName: String(extras?.projectName ?? d.projectName ?? "پروژه").trim() || "پروژه",
    tagline: String(extras?.tagline ?? d.tagline ?? "").trim(),
    description: String(extras?.description ?? d.description ?? d.overview ?? "").trim(),
    audience: String(d.audience ?? "").trim(),
    projectType: String(d.projectType ?? "startup"),
    problem: sectionText(canvas.problem) || sectionText(brand.purpose),
    solution: sectionText(canvas.solution) || sectionText(brand.offer),
    uniqueValue: sectionText(canvas.uniqueValue) || sectionText(brand.personality),
    nextSteps,
    completedCount,
    totalSteps,
    competitors: competitorList(d),
    competitorBrief: String(intel.brief ?? intel.wedge ?? "").trim() || undefined,
    pitchOneLiner: pitchOneLiner(d) || undefined,
  };
}

export function snapshotToPromptBlock(snapshot: ProjectSnapshot): string {
  const competitorLines = snapshot.competitors.length
    ? snapshot.competitors
        .slice(0, 8)
        .map((c) => {
          const bits = [c.name];
          if (c.strength) bits.push(`قوت: ${c.strength}`);
          if (c.weakness) bits.push(`ضعف: ${c.weakness}`);
          if (c.threatScore) bits.push(`تهدید ${c.threatScore}/5`);
          return `- ${bits.join(" | ")}`;
        })
        .join("\n")
    : "- هنوز رقیبی ثبت نشده";

  return [
    `نام پروژه: ${snapshot.projectName}`,
    snapshot.tagline ? `شعار: ${snapshot.tagline}` : "",
    `نوع: ${snapshot.projectType}`,
    snapshot.audience ? `مخاطب: ${snapshot.audience}` : "",
    snapshot.description ? `توضیح: ${snapshot.description.slice(0, 600)}` : "",
    snapshot.problem ? `مسئله: ${snapshot.problem.slice(0, 400)}` : "",
    snapshot.solution ? `راه‌حل: ${snapshot.solution.slice(0, 400)}` : "",
    snapshot.uniqueValue ? `ارزش منحصربه‌فرد: ${snapshot.uniqueValue.slice(0, 400)}` : "",
    `پیشرفت نقشه راه: ${snapshot.completedCount} از ${snapshot.totalSteps}`,
    snapshot.nextSteps.length
      ? `گام‌های بعدی:\n${snapshot.nextSteps.map((s) => `- ${s}`).join("\n")}`
      : "گام بعدی: نقشه راه خالی یا کامل است",
    `رقبا:\n${competitorLines}`,
    snapshot.competitorBrief ? `خلاصه رقبا: ${snapshot.competitorBrief}` : "",
    snapshot.pitchOneLiner ? `پیچ فعلی: ${snapshot.pitchOneLiner}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
