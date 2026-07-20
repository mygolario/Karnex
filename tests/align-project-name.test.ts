import { describe, it, expect } from "vitest";
import {
  alignPlanToUserProjectName,
  detectInventedBrandName,
  repairMisalignedProjectName,
  replaceProjectNameInText,
} from "@/lib/roadmap/align-project-name";

describe("align-project-name", () => {
  it("replaces ZWNJ and spaced brand variants in text", () => {
    expect(
      replaceProjectNameInText(
        "ارزش پیشنهادی سلامت‌خور برای کاربر",
        "سلامت‌خور",
        "فیت بار"
      )
    ).toBe("ارزش پیشنهادی فیت بار برای کاربر");

    expect(
      replaceProjectNameInText(
        "برند سلامت خور آماده است",
        "سلامت‌خور",
        "فیت بار"
      )
    ).toBe("برند فیت بار آماده است");
  });

  it("prefers the user project name over an AI-invented brand in the plan", () => {
    const aligned = alignPlanToUserProjectName(
      {
        projectName: "سلامت‌خور",
        overview: "سلامت‌خور یک استارتاپ سلامت است.",
        roadmap: [
          {
            weekNumber: 1,
            steps: [
              {
                title: "تعریف دقیق ایده و ارزش پیشنهادی سلامت‌خور",
                description: "تمرکز روی سلامت‌خور",
              },
            ],
          },
        ],
      },
      "فیت بار",
      "سلامت‌خور"
    );

    expect(aligned.projectName).toBe("فیت بار");
    expect(aligned.overview).toContain("فیت بار");
    expect(aligned.overview).not.toContain("سلامت‌خور");
    expect(JSON.stringify(aligned.roadmap)).toContain("فیت بار");
    expect(JSON.stringify(aligned.roadmap)).not.toContain("سلامت‌خور");
  });

  it("detects an invented brand when roadmap lacks the real project name", () => {
    const invented = detectInventedBrandName({
      projectName: "فیت بار",
      overview: "سلامت‌خور یک پلتفرم تغذیه سالم است.",
      tagline: "سلامت‌خور، انتخاب هوشمند",
      roadmap: [
        {
          steps: [
            { title: "تعریف دقیق ایده و ارزش پیشنهادی سلامت‌خور" },
            { title: "تحقیق بازار برای سلامت‌خور" },
          ],
        },
      ],
    });

    expect(invented).toBe("سلامت‌خور");
  });

  it("repairs a saved plan whose sidebar name and roadmap brand diverged", () => {
    const { plan, changed, inventedName } = repairMisalignedProjectName({
      projectName: "فیت بار",
      overview: "سلامت‌خور یک پلتفرم تغذیه سالم است.",
      tagline: "با سلامت‌خور شروع کن",
      roadmap: [
        {
          steps: [
            {
              title: "تعریف دقیق ایده و ارزش پیشنهادی سلامت‌خور",
              description: "این گام برای سلامت‌خور حیاتی است.",
            },
          ],
        },
      ],
    });

    expect(changed).toBe(true);
    expect(inventedName).toBe("سلامت‌خور");
    expect(plan.projectName).toBe("فیت بار");
    expect(JSON.stringify(plan.roadmap)).toContain("فیت بار");
    expect(JSON.stringify(plan.roadmap)).not.toContain("سلامت‌خور");
  });

  it("does nothing when roadmap already uses the real project name", () => {
    const { changed } = repairMisalignedProjectName({
      projectName: "فیت بار",
      overview: "فیت بار یک پلتفرم تغذیه سالم است.",
      roadmap: [{ steps: [{ title: "تعریف ایده فیت بار" }] }],
    });

    expect(changed).toBe(false);
  });
});
