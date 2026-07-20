/**
 * Keep user-chosen project names consistent across AI-generated plan content.
 * Genesis historically preferred an AI-invented brand over the user's name,
 * so roadmap titles/overview can mention a different brand than the sidebar.
 */

/** ZWNJ and spaced variants of a Persian brand name. */
export function projectNameVariants(name: string): string[] {
  const n = name.trim();
  if (!n) return [];
  const variants = new Set<string>([n]);
  variants.add(n.replace(/\u200c/g, ""));
  variants.add(n.replace(/\u200c/g, " ").replace(/\s+/g, " ").trim());
  variants.add(n.replace(/ +/g, "\u200c"));
  return [...variants].filter(Boolean);
}

export function textIncludesProjectName(text: string, name: string): boolean {
  if (!text || !name.trim()) return false;
  return projectNameVariants(name).some((v) => text.includes(v));
}

export function replaceProjectNameInText(
  text: string,
  fromName: string,
  toName: string
): string {
  if (!text || !fromName.trim() || !toName.trim() || fromName === toName) {
    return text;
  }
  let result = text;
  for (const variant of projectNameVariants(fromName)) {
    if (!variant || !result.includes(variant)) continue;
    result = result.split(variant).join(toName);
  }
  return result;
}

function replaceInValue(value: unknown, fromName: string, toName: string): unknown {
  if (typeof value === "string") {
    return replaceProjectNameInText(value, fromName, toName);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceInValue(item, fromName, toName));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceInValue(child, fromName, toName);
    }
    return out;
  }
  return value;
}

/** Force every string field that mentions `inventedName` to use `userProjectName`. */
export function alignPlanToUserProjectName<T extends Record<string, unknown>>(
  plan: T,
  userProjectName: string,
  inventedName?: string | null
): T {
  const correct = userProjectName.trim();
  if (!correct || !plan || typeof plan !== "object") return plan;

  const wrong = (inventedName ?? (typeof plan.projectName === "string" ? plan.projectName : "")).trim();
  let next: Record<string, unknown> = { ...plan };

  if (wrong && wrong !== correct) {
    next = replaceInValue(next, wrong, correct) as Record<string, unknown>;
  }

  next.projectName = correct;
  return next as T;
}

const BRAND_STOPWORDS = new Set([
  "یک",
  "این",
  "برای",
  "با",
  "از",
  "که",
  "در",
  "به",
  "و",
  "است",
  "هست",
  "می",
  "می‌شود",
  "خواهد",
  "پروژه",
  "استارتاپ",
  "کسب",
  "کار",
  "ایده",
  "برند",
  "محصول",
  "اپلیکیشن",
  "پلتفرم",
  "سایت",
  "فروشگاه",
  "خدمات",
  "بازار",
]);

/** First 1–2 Persian tokens of overview/tagline — often the AI-invented brand. */
function extractLeadingBrandCandidate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = trimmed.match(
    /^([\u0600-\u06FF][\u0600-\u06FF\u200c]*(?:[\u200c\s]+[\u0600-\u06FF][\u0600-\u06FF\u200c]*)?)/
  );
  const cand = match?.[1]?.trim() ?? null;
  if (!cand || cand.length < 3 || cand.length > 40) return null;
  const firstToken = cand.split(/[\s\u200c]+/)[0] ?? "";
  if (BRAND_STOPWORDS.has(firstToken)) return null;
  return cand;
}

function countVariantHits(haystack: string, name: string): number {
  let count = 0;
  for (const variant of projectNameVariants(name)) {
    if (!variant) continue;
    let idx = 0;
    while ((idx = haystack.indexOf(variant, idx)) !== -1) {
      count += 1;
      idx += variant.length;
    }
  }
  return count;
}

/**
 * Detect an AI-invented brand still present in roadmap/overview when
 * `projectName` was overwritten with the user's real name at save time.
 */
export function detectInventedBrandName(plan: {
  projectName?: string;
  overview?: string;
  tagline?: string;
  roadmap?: unknown;
}): string | null {
  const correct = (plan.projectName || "").trim();
  if (!correct) return null;

  const roadmapText = JSON.stringify(plan.roadmap ?? "");
  if (!roadmapText || roadmapText === "[]" || roadmapText === '""') return null;
  if (textIncludesProjectName(roadmapText, correct)) return null;

  const sources = [plan.overview || "", plan.tagline || "", roadmapText].filter(
    Boolean
  );
  const candidates = new Set<string>();

  for (const source of sources) {
    const leading = extractLeadingBrandCandidate(source);
    if (leading) candidates.add(leading);

    const tokens =
      source.match(
        /[\u0600-\u06FF][\u0600-\u06FF\u200c]*(?:[\u200c\s]+[\u0600-\u06FF][\u0600-\u06FF\u200c]*){0,1}/g
      ) || [];
    for (const raw of tokens) {
      const cand = raw.trim();
      if (cand.length < 3 || cand.length > 40) continue;
      const first = cand.split(/[\s\u200c]+/)[0] ?? "";
      if (BRAND_STOPWORDS.has(first)) continue;
      // Skip generic roadmap vocabulary that is not a brand.
      if (
        /^(تعریف|ایده|ارزش|پیشنهادی|تحقیق|بازار|ساخت|آماده‌سازی|راه‌اندازی|گام|هفته)/.test(
          first
        )
      ) {
        continue;
      }
      candidates.add(cand);
    }
  }

  let best: { name: string; count: number } | null = null;
  for (const cand of candidates) {
    if (
      projectNameVariants(correct).some((v) =>
        projectNameVariants(cand).includes(v)
      )
    ) {
      continue;
    }
    const count = countVariantHits(roadmapText, cand);
    if (count < 2) continue;
    if (
      !best ||
      count > best.count ||
      (count === best.count && cand.length > best.name.length)
    ) {
      best = { name: cand, count };
    }
  }

  // Overview/tagline leading brand: accept a single roadmap hit.
  for (const source of [plan.overview || "", plan.tagline || ""]) {
    const leading = extractLeadingBrandCandidate(source);
    if (!leading) continue;
    if (
      projectNameVariants(correct).some((v) =>
        projectNameVariants(leading).includes(v)
      )
    ) {
      continue;
    }
    const count = countVariantHits(roadmapText, leading);
    if (count >= 1) {
      if (!best || count >= best.count) {
        best = { name: leading, count };
      }
    }
  }

  return best?.name ?? null;
}

export type ProjectNameRepairResult<T> = {
  plan: T;
  changed: boolean;
  inventedName: string | null;
};

/** One-shot repair for projects already saved with mismatched roadmap copy. */
export function repairMisalignedProjectName<T extends Record<string, unknown>>(
  plan: T
): ProjectNameRepairResult<T> {
  const correct =
    typeof plan.projectName === "string" ? plan.projectName.trim() : "";
  if (!correct) {
    return { plan, changed: false, inventedName: null };
  }

  const invented = detectInventedBrandName({
    projectName: correct,
    overview: typeof plan.overview === "string" ? plan.overview : "",
    tagline: typeof plan.tagline === "string" ? plan.tagline : "",
    roadmap: plan.roadmap,
  });

  if (!invented) {
    return { plan, changed: false, inventedName: null };
  }

  const aligned = alignPlanToUserProjectName(plan, correct, invented);
  return { plan: aligned, changed: true, inventedName: invented };
}
