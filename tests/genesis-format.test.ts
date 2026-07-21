import { describe, expect, it } from "vitest";
import {
  buildIdeaFromAnswers,
  estimateGenesisCredits,
  formatGenesisAnswersForPrompt,
  labeledGenesisAnswers,
  resolveAudience,
  resolveBudget,
  scoreGenesisConfidence,
} from "@/lib/genesis/format";
import {
  GENESIS_ASSIST_CAP,
  GENESIS_CORE_CREDITS,
  GENESIS_ROADMAP_CREDITS,
} from "@/lib/genesis/intake-constants";

describe("genesis format helpers", () => {
  it("labels answers in Persian for prompts", () => {
    const labeled = labeledGenesisAnswers({
      stage: "idea",
      budget: "low",
      problem: "نوبت پزشک سخت است",
    });
    expect(labeled["مرحله"]).toBe("فقط ایده");
    expect(labeled["بودجه"]).toContain("۵۰");
    expect(labeled["مشکل"]).toContain("نوبت");
  });

  it("formats prompt block", () => {
    const block = formatGenesisAnswersForPrompt({
      stage: "mvp",
      audience_who: "مادران شاغل",
    });
    expect(block).toContain("مرحله");
    expect(block).toContain("مخاطب");
    expect(block).not.toContain("stage:");
  });

  it("builds idea and resolves audience/budget", () => {
    const answers = {
      problem: "فروش کم است",
      solution: "اپ فروشگاهی ساده",
      audience_who: "صاحب مغازه",
      budget: "mid",
    };
    const idea = buildIdeaFromAnswers(answers, "توضیح اضافه");
    expect(idea).toContain("مشکل");
    expect(idea).toContain("توضیح اضافه");
    expect(resolveAudience(answers)).toBe("صاحب مغازه");
    expect(resolveBudget(answers).length).toBeGreaterThan(2);
  });

  it("scores confidence and credits honestly", () => {
    const weak = scoreGenesisConfidence({}, "", "");
    expect(weak.level).toBe("weak");

    const strong = scoreGenesisConfidence(
      {
        problem: "پیدا کردن نوبت پزشک در تهران خیلی طول می‌کشد و خسته‌کننده است",
        solution:
          "اپی می‌سازیم که نوبت را سریع رزرو کند و یادآوری بفرستد برای بیماران",
        audience_who: "بیماران تهرانی",
        stage: "idea",
        budget: "low",
        geo: "online",
        goal: "validate",
      },
      "نسخه اول روی موبایل",
      "نوبت‌یار"
    );
    expect(strong.score).toBeGreaterThanOrEqual(70);
    expect(strong.level).toBe("strong");

    const credits = estimateGenesisCredits(2);
    expect(credits.core).toBe(GENESIS_CORE_CREDITS);
    expect(credits.roadmap).toBe(GENESIS_ROADMAP_CREDITS);
    expect(credits.total).toBe(GENESIS_CORE_CREDITS + GENESIS_ROADMAP_CREDITS + 2);
    expect(GENESIS_ASSIST_CAP).toBe(3);
  });
});
