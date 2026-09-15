import type {
  CapitalOutput,
  ExecutionOutput,
  GrowthOutput,
  NightShiftOutput,
  ProjectSnapshot,
  ResearchOutput,
  ThreatLevel,
} from "./types";

function threatFromScore(score?: number): ThreatLevel {
  if (!score) return "medium";
  if (score >= 4) return "high";
  if (score <= 2) return "low";
  return "medium";
}

export function fallbackResearch(snapshot: ProjectSnapshot): ResearchOutput {
  const name = snapshot.projectName;
  const moves = snapshot.competitors.slice(0, 4).map((c) => ({
    name: c.name,
    move: c.strength
      ? `روی «${c.strength}» فشار می‌آورد — اگر شما ${snapshot.uniqueValue || "تمایزتان"} را این هفته واضح نکنید، مشتری سراغ او می‌رود.`
      : `در بازار شما دیده می‌شود؛ جایگاه‌تان را با یک پیام مشخص در برابر ${c.name} سفت کنید.`,
    threat: threatFromScore(c.threatScore),
  }));

  if (!moves.length) {
    moves.push({
      name: "شکاف داده",
      move: "هنوز رقیب ثبت نشده. این هفته ۳ رقیب ایرانی (مستقیم/غیرمستقیم) را با لینک و قیمت پیدا کن تا رادار روشن شود.",
      threat: "high",
    });
  }

  const next = snapshot.nextSteps[0];
  return {
    kind: "research",
    headline: `رادار ${name}: ${moves[0]?.name || "بازار"} را جدی بگیر`,
    briefing: [
      snapshot.competitorBrief ||
        `${name} ${snapshot.tagline ? `— ${snapshot.tagline}` : ""} در مرحلهٔ اجراست، نه مرحلهٔ سندسازی.`,
      next
        ? `گام روی میز: «${next}». تحقیق این هفته باید این گام را جلو ببرد، نه یک SWOT تزئینی.`
        : "نقشه راه خالی است؛ اول یک گام اجرایی این هفته تعریف کن.",
      snapshot.problem
        ? `مسئلهٔ مشتری: ${snapshot.problem.slice(0, 180)}`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    competitorMoves: moves,
    questions: [
      snapshot.audience
        ? `${snapshot.audience} الان مشکل «${(snapshot.problem || "این کار").slice(0, 60)}» را چطور حل می‌کند؟`
        : "مشتری الان این کار را بدون شما چطور انجام می‌دهد؟",
      "کدام رقیب در اینستاگرام/تلگرام ایران بیشتر دیده می‌شود و پیامش چیست؟",
      "اگر این هفته فقط یک فرض خطرناک را تست کنیم، کدام است؟",
    ],
    recommendedActions: [
      {
        title: "۳ رقیب را در تحلیل رقبا ثبت یا به‌روز کن",
        why: "بدون نام و لینک، عامل تحقیق حدس می‌زند.",
        href: "/dashboard/competitors",
      },
      {
        title: next ? `گام «${next}» را این هفته تمام کن` : "اولین گام نقشه راه را مشخص کن",
        why: "تحقیق بدون حرکت روی نقشه راه فقط متن است.",
        href: "/dashboard/roadmap",
      },
      {
        title: "یک مصاحبه ۱۵ دقیقه‌ای با مشتری بالقوه بگذار",
        why: "بازار ایران را چت‌جی‌پی‌تی نمی‌شناسد؛ یک مکالمه واقعی می‌شناسد.",
      },
    ],
  };
}

export function fallbackExecution(snapshot: ProjectSnapshot): ExecutionOutput {
  const steps = snapshot.nextSteps.length
    ? snapshot.nextSteps.slice(0, 3)
    : ["تعریف یک کار مشخص برای ۷ روز آینده"];

  const missions = steps.map((title, i) => {
    const minutes = [25, 40, 20][i] ?? 30;
    if (i === 0) {
      return {
        id: `m${i + 1}`,
        title: `شروع: ${title}`,
        roadmapStep: snapshot.nextSteps[0] ? title : undefined,
        minutes,
        steps: [
          "۱۵ دقیقه: این گام را به ۳ زیرکار قابل تیک تبدیل کن",
          "۵ دقیقه: یک نفر واقعی (مشتری/هم‌بنیان/منتور) برای بازخورد مشخص کن",
          "۵ دقیقه: آخر امروز یک خروجی قابل ارسال داشته باش (پیام، فایل، یا لینک)",
        ],
        copyPaste: {
          label: "پیام برای هماهنگ کردن یک گفتگو",
          body: `سلام، روی ${snapshot.projectName} کار می‌کنم${snapshot.tagline ? ` (${snapshot.tagline})` : ""}. می‌خوام ۱۵ دقیقه از تجربه‌ت درباره «${(snapshot.problem || title).slice(0, 80)}» استفاده کنم — این هفته ۱۵ دقیقه وقت داری؟`,
        },
      };
    }
    if (i === 1) {
      return {
        id: `m${i + 1}`,
        title,
        roadmapStep: title,
        minutes,
        steps: [
          "مدارک/لینک‌های لازم این گام را در یک یادداشت جمع کن",
          "یک مانع مشخص بنویس (پول، مجوز، ابزار، آدم)",
          "اگر گیر کردی، همان مانع را به عامل تحقیق بده",
        ],
      };
    }
    return {
      id: `m${i + 1}`,
      title,
      roadmapStep: title,
      minutes,
      steps: [
        "این گام را به «انجام شد / نشد» قابل مشاهده تبدیل کن",
        "اگر این هفته نمی‌رسد، صریحاً به هفته بعد منتقلش کن — نیمه کار نگذار",
      ],
    };
  });

  return {
    kind: "execution",
    weekTheme:
      snapshot.nextSteps[0]
        ? `این هفته فقط این را جلو ببر: ${snapshot.nextSteps[0]}`
        : `این هفته برای ${snapshot.projectName} یک خروجی بیرونی بساز`,
    missions,
    decisionForFounder: snapshot.nextSteps[1]
      ? `اگر فقط یک کار برسد، «${snapshot.nextSteps[0]}» را تمام کن و «${snapshot.nextSteps[1]}» را آگاهانه عقب بینداز.`
      : "یک خروجی این هفته که کسی بیرون از کارنکس ببیند (پیام، پست، یا جلسه) تعریف کن.",
  };
}

export function fallbackGrowth(snapshot: ProjectSnapshot): GrowthOutput {
  const uvp = snapshot.uniqueValue || snapshot.tagline || snapshot.solution || snapshot.projectName;
  const problem = snapshot.problem || "یک کار خسته‌کننده و پراکنده";
  return {
    kind: "growth",
    hook: `${snapshot.projectName} برای کسی که از «${problem.slice(0, 70)}» خسته شده`,
    posts: [
      {
        channel: "instagram",
        title: "اینستاگرام — مسئله",
        caption: `اگر ${snapshot.audience || "بنیان‌گذار"} هنوز ${problem.slice(0, 90)} را با چت و فایل پراکنده حل می‌کند، مشکل ابزار نیست — مشکل سیستم است.\n\n${snapshot.projectName}${snapshot.tagline ? ` | ${snapshot.tagline}` : ""}\n\nذخیره کن اگر این هفته می‌خواهی یکی از این کارها را واقعاً ببندی.`,
        cta: "ذخیره + یک کامنت: بزرگ‌ترین گیر این هفته‌ات چیست؟",
      },
      {
        channel: "telegram",
        title: "تلگرام — تمایز",
        caption: `${uvp.slice(0, 180)}\n\nاین هفته داریم روی «${snapshot.nextSteps[0] || "یک خروجی واقعی"}» کار می‌کنیم. اگر مشتری این درد را داری، به این پیام ریپلای کن.`,
        cta: "ریپلای با یک جمله از مشکل‌ات",
      },
      {
        channel: "instagram",
        title: "اینستاگرام — دعوت به گفتگو",
        caption: `۳ نفر می‌خواهم که ${snapshot.audience || "مخاطب هدف"} باشند و ۱۵ دقیقه حرف بزنند.\nقول: سوال آماده دارم، فروش ندارم.\nموضوع: ${problem.slice(0, 80)}`,
        cta: "دایرکت بده «گفتگو»",
      },
    ],
    interviewScript: {
      opener: `سلام، ممنون که وقت گذاشتی. من ${snapshot.projectName} را می‌سازم تا ${problem.slice(0, 80)}. فقط می‌خواهم بفهمم تو الان این کار را چطور انجام می‌دهی — نه اینکه چیزی بفروشم.`,
      questions: [
        "آخرین باری که با این مشکل برخوردی کی بود، دقیقاً چه کردی؟",
        "چه ابزاری را امتحان کردی و کجا رها کردی؟",
        "اگر یک هم‌بنیان‌گذار اجرایی داشتی، اولین کاری که باید از روی دوشت بردارد چیست؟",
        "برای اینکه هفته بعد برگردی، چه خروجی‌ای باید ببینی؟",
      ],
    },
    dmTemplate: `سلام، ${snapshot.projectName} را می‌سازم برای ${snapshot.audience || "بنیان‌گذارهایی"} که ${problem.slice(0, 70)}. دنبال ۳ گفتگوی کوتاه‌ام — فروش نیست. ۱۵ دقیقه این هفته وقت داری؟`,
  };
}

export function fallbackCapital(snapshot: ProjectSnapshot): CapitalOutput {
  const oneLiner =
    snapshot.pitchOneLiner ||
    `${snapshot.projectName} ${snapshot.uniqueValue ? `— ${snapshot.uniqueValue.slice(0, 120)}` : snapshot.tagline ? `— ${snapshot.tagline}` : "هم‌بنیان‌گذار اجرایی برای بنیان‌گذار ایرانی"}`;
  return {
    kind: "capital",
    oneLiner,
    ask: "به جای راند بزرگ: سرمایهٔ پل برای ۶ ماه یادگیری کانال رشد و اثبات اینکه بنیان‌گذار هر هفته برمی‌گردد چون کار انجام شده، نه چون سند ساخته شده.",
    faqs: [
      {
        q: "چرا الان؟",
        a: "بازار ایران به چت عمومی دسترسی دارد؛ به هم‌بنیان‌گذار اجرایی که روی یک پروژهٔ زنده کار کند نه.",
      },
      {
        q: "رقبا کی‌اند؟",
        a: snapshot.competitors.length
          ? `در محصول: ${snapshot.competitors
              .slice(0, 3)
              .map((c) => c.name)
              .join("، ")}. در عادت کاربر: ChatGPT و فایل ورد.`
          : "رقیب عادت‌شده ChatGPT و فایل پراکنده است؛ رقیب محصول را این هفته در تحلیل رقبا پر می‌کنیم.",
      },
      {
        q: "چطور می‌فروشید؟",
        a: "پرداخت زیبال، پلن رایگان برای ورود، پرو برای کسی که عامل‌ها را هر هفته صدا می‌زند.",
      },
      {
        q: "اگر AI ارزان‌تر شود چه؟",
        a: "مدل کالا است. حافظهٔ شرکت ایرانی + کار اجرایی روی نقشه راه کالا نیست.",
      },
      {
        q: "چرا شما؟",
        a: `بنیان‌گذار روی ${snapshot.projectName} داخل همین بازار زندگی می‌کند؛ خروجی فارسی و ایران‌محور است نه ترجمه.`,
      },
    ],
    objections: [
      "«این همان چت‌جی‌پی‌تی است» → نشان بده کار بعد از تأیید روی نقشه راه/تقویم نوشته شده.",
      "«بازار ایران پول نمی‌دهد» → یک پرداخت واقعی زیبال از کاربر غیرتست.",
      "«Retention ندارید» → حلقهٔ شب‌کاری + تأیید صبح؛ سند یک‌بار مصرف نیست.",
    ],
  };
}

export function fallbackNightShift(snapshot: ProjectSnapshot): NightShiftOutput {
  const research = fallbackResearch(snapshot);
  const execution = fallbackExecution(snapshot);
  const growth = fallbackGrowth(snapshot);
  const includeCapital = snapshot.projectType === "startup";
  const capital = includeCapital ? fallbackCapital(snapshot) : undefined;
  const whatAgentsDid = [
    `تحقیق: ${research.headline}`,
    `اجرا: ${execution.weekTheme}`,
    `رشد: ${growth.posts.length} پیش‌نویس پست`,
  ];
  if (capital) whatAgentsDid.push(`سرمایه: وان‌لاینر آماده شد`);

  return {
    kind: "night_shift",
    greeting: `صبح بخیر — ${snapshot.projectName} شب بیکار نبود`,
    todayFocus: execution.missions[0]?.title || execution.weekTheme,
    decision: execution.decisionForFounder,
    whatAgentsDid,
    children: {
      research,
      execution,
      growth,
      ...(capital ? { capital } : {}),
    },
  };
}
