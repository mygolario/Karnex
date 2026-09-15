import type {
  AgentOutput,
  CapitalOutput,
  ExecutionOutput,
  GrowthOutput,
  NightShiftOutput,
  ResearchOutput,
  ThreatLevel,
  WorkforceAgentId,
} from "./types";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function strList(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((v) => str(v)).filter(Boolean);
  return items.length ? items : fallback;
}

function threat(value: unknown): ThreatLevel {
  const v = String(value ?? "").toLowerCase();
  if (v === "high" || v === "low" || v === "medium") return v;
  return "medium";
}

function asRec(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeResearch(
  raw: Record<string, unknown>,
  fallback: ResearchOutput,
): ResearchOutput {
  const movesIn = Array.isArray(raw.competitorMoves) ? raw.competitorMoves : [];
  const moves = movesIn
    .map((m) => {
      const rec = asRec(m);
      const name = str(rec.name);
      const move = str(rec.move);
      if (!name || !move) return null;
      return { name, move, threat: threat(rec.threat) };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const actionsIn = Array.isArray(raw.recommendedActions) ? raw.recommendedActions : [];
  const actions = actionsIn
    .map((a) => {
      const rec = asRec(a);
      const title = str(rec.title);
      if (!title) return null;
      return {
        title,
        why: str(rec.why, "برای جلو بردن پروژه این هفته."),
        href: str(rec.href) || undefined,
      };
    })
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return {
    kind: "research",
    headline: str(raw.headline, fallback.headline),
    briefing: str(raw.briefing, fallback.briefing),
    competitorMoves: moves.length ? moves : fallback.competitorMoves,
    questions: strList(raw.questions, fallback.questions).slice(0, 6),
    recommendedActions: actions.length ? actions.slice(0, 5) : fallback.recommendedActions,
  };
}

export function normalizeExecution(
  raw: Record<string, unknown>,
  fallback: ExecutionOutput,
): ExecutionOutput {
  const missionsIn = Array.isArray(raw.missions) ? raw.missions : [];
  const missions = missionsIn
    .map((m, i) => {
      const rec = asRec(m);
      const title = str(rec.title);
      if (!title) return null;
      const copy = asRec(rec.copyPaste);
      const minutes = Number(rec.minutes);
      return {
        id: str(rec.id, `m${i + 1}`),
        title,
        roadmapStep: str(rec.roadmapStep) || undefined,
        minutes: Number.isFinite(minutes) && minutes > 0 ? Math.min(180, Math.round(minutes)) : 30,
        steps: strList(rec.steps, ["این مأموریت را به یک خروجی قابل مشاهده تبدیل کن"]),
        copyPaste:
          str(copy.label) && str(copy.body)
            ? { label: str(copy.label), body: str(copy.body) }
            : undefined,
      };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return {
    kind: "execution",
    weekTheme: str(raw.weekTheme, fallback.weekTheme),
    missions: missions.length ? missions.slice(0, 5) : fallback.missions,
    decisionForFounder: str(raw.decisionForFounder, fallback.decisionForFounder),
  };
}

export function normalizeGrowth(
  raw: Record<string, unknown>,
  fallback: GrowthOutput,
): GrowthOutput {
  const postsIn = Array.isArray(raw.posts) ? raw.posts : [];
  const posts = postsIn
    .map((p) => {
      const rec = asRec(p);
      const caption = str(rec.caption);
      if (!caption) return null;
      const channelRaw = str(rec.channel, "instagram");
      const channel =
        channelRaw === "telegram" || channelRaw === "linkedin" ? channelRaw : "instagram";
      return {
        channel,
        title: str(rec.title, "پست"),
        caption,
        cta: str(rec.cta, "ذخیره کن"),
      } as const;
    })
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const script = asRec(raw.interviewScript);
  return {
    kind: "growth",
    hook: str(raw.hook, fallback.hook),
    posts: posts.length ? posts.slice(0, 4) : fallback.posts,
    interviewScript: {
      opener: str(script.opener, fallback.interviewScript.opener),
      questions: strList(script.questions, fallback.interviewScript.questions).slice(0, 6),
    },
    dmTemplate: str(raw.dmTemplate, fallback.dmTemplate),
  };
}

export function normalizeCapital(
  raw: Record<string, unknown>,
  fallback: CapitalOutput,
): CapitalOutput {
  const faqsIn = Array.isArray(raw.faqs) ? raw.faqs : [];
  const faqs = faqsIn
    .map((f) => {
      const rec = asRec(f);
      const q = str(rec.q);
      const a = str(rec.a);
      if (!q || !a) return null;
      return { q, a };
    })
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return {
    kind: "capital",
    oneLiner: str(raw.oneLiner, fallback.oneLiner),
    ask: str(raw.ask, fallback.ask),
    faqs: faqs.length ? faqs.slice(0, 6) : fallback.faqs,
    objections: strList(raw.objections, fallback.objections).slice(0, 6),
  };
}

export function normalizeNightShift(
  raw: Record<string, unknown>,
  fallback: NightShiftOutput,
): NightShiftOutput {
  const children = asRec(raw.children);
  return {
    kind: "night_shift",
    greeting: str(raw.greeting, fallback.greeting),
    todayFocus: str(raw.todayFocus, fallback.todayFocus),
    decision: str(raw.decision, fallback.decision),
    whatAgentsDid: strList(raw.whatAgentsDid, fallback.whatAgentsDid).slice(0, 8),
    children: {
      research: children.research
        ? normalizeResearch(asRec(children.research), fallback.children.research!)
        : fallback.children.research,
      execution: children.execution
        ? normalizeExecution(asRec(children.execution), fallback.children.execution!)
        : fallback.children.execution,
      growth: children.growth
        ? normalizeGrowth(asRec(children.growth), fallback.children.growth!)
        : fallback.children.growth,
      capital:
        children.capital && fallback.children.capital
          ? normalizeCapital(asRec(children.capital), fallback.children.capital)
          : fallback.children.capital,
    },
  };
}

export function normalizeAgentOutput(
  agentId: WorkforceAgentId,
  raw: Record<string, unknown>,
  fallback: AgentOutput,
): AgentOutput {
  switch (agentId) {
    case "research":
      return normalizeResearch(raw, fallback as ResearchOutput);
    case "execution":
      return normalizeExecution(raw, fallback as ExecutionOutput);
    case "growth":
      return normalizeGrowth(raw, fallback as GrowthOutput);
    case "capital":
      return normalizeCapital(raw, fallback as CapitalOutput);
    case "night_shift":
      return normalizeNightShift(raw, fallback as NightShiftOutput);
  }
}

export function summaryFromOutput(output: AgentOutput): string {
  switch (output.kind) {
    case "research":
      return output.headline;
    case "execution":
      return output.weekTheme;
    case "growth":
      return output.hook;
    case "capital":
      return output.oneLiner;
    case "night_shift":
      return output.todayFocus;
  }
}

export function titleForAgentRun(agentId: WorkforceAgentId, output: AgentOutput): string {
  if (output.kind === "night_shift") return "گزارش صبح — شب‌کاری";
  if (output.kind === "research") return "گزارش تحقیق";
  if (output.kind === "execution") return "هفتهٔ کاری";
  if (output.kind === "growth") return "بسته رشد";
  if (output.kind === "capital") return "بسته سرمایه";
  return agentId;
}
