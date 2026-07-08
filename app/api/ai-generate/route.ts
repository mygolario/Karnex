import { NextResponse } from "next/server";
import { callOpenRouter, parseJsonFromAI, TIER_LOCATION } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { auth } from "@/lib/auth/session";
import { resolveAssembledPrompt } from "@/lib/ai/prompt-service";
import { runWithAiUsage } from "@/lib/ai-usage-context";
import { runLocationAnalysis } from "@/lib/location/analyze-pipeline";
import {
  buildGenerateContext,
  handleContentBrief,
  handleContentIdeas,
  handleContentStrategy,
  handleFullCanvas,
  handleGrowthPlan,
  handleCanvasCritique,
  handleMarketResearch,
  handlePitchSlideAI,
  handleRepurpose,
  handleScriptWriter,
  handleSectionCards,
  handleValidateIdea,
} from "@/lib/ai/generate-handlers";

export const maxDuration = 120;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let rollback = async () => {};
  const reqStart = Date.now();
  try {
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return limitResult.errorResponse;
    rollback = limitResult.rollback;

    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const {
      action,
      prompt,
      systemPrompt,
      maxTokens = 2000,
      businessIdea,
      projectName,
      modelOverride,
      city,
      address,
      activeProject,
      modifier,
    } = body;

    const genCtx = buildGenerateContext(activeProject, userId, modifier);

    // Wrap the dispatch in a request-scoped AiUsageContext so every
    // callOpenRouter inside handlers auto-records token/cost to AiUsage.
    const feature = (action as string) || (body.featureKey as string) || "ai-generate";
    return await runWithAiUsage(
      { userId: userId || "anonymous", projectId: genCtx.projectId, feature },
      async () => {
    if (action === "analyze-location") {
      const {
        radius: requestedRadius,
        priceTier = "mid",
        footfallDependency = "high",
        rentBudget = 0,
        businessCategory = "",
        businessDescription = "",
        lat,
        lon,
      } = body;

      try {
        const json = await runLocationAnalysis({
          city,
          address,
          businessDescription: businessDescription || String(activeProject?.overview || ""),
          businessCategory,
          radius: requestedRadius,
          priceTier,
          footfallDependency,
          rentBudget,
          activeProject,
          userId,
          projectId: genCtx.projectId,
          modelOverride,
          coordinates:
            typeof lat === "number" && typeof lon === "number" ? { lat, lon } : undefined,
        });
        return NextResponse.json({ success: true, analysis: json });
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        console.error("[analyze-location] failed", { error: detail, totalMs: Date.now() - reqStart });
        await rollback();
        return NextResponse.json(
          { error: "Failed to parse location analysis", detail },
          { status: 500 }
        );
      }
    }

    if (action === "location-chat") {
      const { locationAnalysis, prompt: userPrompt } = body;
      if (!userPrompt) {
        return NextResponse.json({ error: "prompt required" }, { status: 400 });
      }
      const system = `تو تحلیل‌گر مکان Karnex هستی. فقط بر اساس گزارش تحلیل و پروفایل پروژه پاسخ بده. فارسی، کوتاه و عملی.`;
      const user = `گزارش تحلیل:\n${JSON.stringify(locationAnalysis || {}, null, 0).slice(0, 6000)}\n\nسؤال کاربر: ${userPrompt}`;
      const result = await callOpenRouter(user, {
        systemPrompt: system,
        maxTokens: 800,
        temperature: 0.4,
        modelOverride: modelOverride || TIER_LOCATION,
      });
      if (!result.success) {
        await rollback();
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ success: true, content: result.content, reply: result.content });
    }

    if (action === "generate-full-canvas") {
      if (!businessIdea) {
        return NextResponse.json(
          { error: "Business idea is required" },
          { status: 400 }
        );
      }
      try {
        const canvas = await handleFullCanvas({
          ...genCtx,
          businessIdea,
        });
        return NextResponse.json({ success: true, canvas });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "generate-section-cards") {
      const { sectionTitle } = body;
      if (!sectionTitle) {
        return NextResponse.json({ error: "sectionTitle required" }, { status: 400 });
      }
      try {
        const cards = await handleSectionCards({ ...genCtx, sectionTitle });
        return NextResponse.json({ success: true, cards });
      } catch {
        await rollback();
        return NextResponse.json({ success: true, cards: ["ایده پیشنهادی"] });
      }
    }

    if (action === "generate-pitch-deck") {
      const { system, user } = await resolveAssembledPrompt({
        featureKey: "generatePitchDeck",
        projectType: genCtx.projectType,
        projectName: projectName || genCtx.projectName,
        projectData: genCtx.projectData,
        userId,
        projectId: genCtx.projectId,
        variables: {
          idea: businessIdea || "",
          projectContextBlock: "",
          wizardAnswersBlock: "",
        },
      });
      const result = await callOpenRouter(user, {
        systemPrompt: system,
        maxTokens: 3000,
        temperature: 0.7,
      });
      if (!result.success) {
        await rollback();
        return NextResponse.json({ error: result.error }, { status: 503 });
      }
      const slides = parseJsonFromAI(result.content!);
      return NextResponse.json({ success: true, slides });
    }

    if (action === "validate-idea") {
      try {
        const out = await handleValidateIdea({
          ...genCtx,
          businessIdea: businessIdea || "",
        });
        return NextResponse.json({ success: true, ...out });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "generate-growth-plan") {
      const { planType, stage } = body;
      try {
        const data = await handleGrowthPlan({
          ...genCtx,
          planType,
          stage,
          businessIdea: businessIdea || "",
        });
        return NextResponse.json({ success: true, data });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "generate-content-ideas") {
      const { topic } = body;
      try {
        const ideas = await handleContentIdeas({ ...genCtx, topic });
        return NextResponse.json({ success: true, ideas, reasoning: (ideas as { reasoning?: string }).reasoning });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "repurpose-content") {
      const { topic, url, tone = "professional" } = body;
      try {
        const content = await handleRepurpose({ ...genCtx, topic, url, tone });
        return NextResponse.json({ success: true, content });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "script-writer") {
      const { title, audience, duration, tone, template } = body;
      try {
        const script = await handleScriptWriter({
          ...genCtx,
          title,
          audience,
          duration,
          tone,
          template,
        });
        return NextResponse.json({ success: true, script });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "content-brief") {
      const { requestType, context, requestInstructions } = body;
      try {
        const result = await handleContentBrief({
          ...genCtx,
          requestType,
          context,
          requestInstructions,
        });
        return NextResponse.json({ success: true, result });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "content-strategy") {
      const { platforms, weeks = 2 } = body;
      try {
        const calendar = await handleContentStrategy({
          ...genCtx,
          platforms,
          weeks,
        });
        return NextResponse.json({ success: true, calendar });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "generate-canvas-critique") {
      const { canvasSummary } = body;
      if (!canvasSummary) {
        return NextResponse.json({ error: "canvasSummary required" }, { status: 400 });
      }
      try {
        const critique = await handleCanvasCritique({ ...genCtx, canvasSummary });
        return NextResponse.json({ success: true, critique });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "pitch-slide-ai") {
      const { slideContent, mode } = body;
      if (!slideContent || !mode) {
        return NextResponse.json({ error: "slideContent and mode required" }, { status: 400 });
      }
      try {
        const result = await handlePitchSlideAI({ ...genCtx, slideContent, mode });
        return NextResponse.json({ success: true, result });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "generate-market-research") {
      const { researchType, geography, deep } = body;
      if (!researchType) {
        return NextResponse.json({ error: "researchType required" }, { status: 400 });
      }
      try {
        const research = await handleMarketResearch({
          ...genCtx,
          businessIdea: businessIdea || genCtx.projectDescription || "",
          geography,
          researchType,
          deep: !!deep,
        });
        return NextResponse.json({ success: true, research });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    // Generic fallback — still use base prompt when featureKey provided
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let finalSystem = systemPrompt;
    if (!finalSystem && body.featureKey) {
      const assembled = await resolveAssembledPrompt({
        featureKey: body.featureKey,
        projectType: genCtx.projectType,
        projectData: genCtx.projectData,
        userId,
        projectId: genCtx.projectId,
        variables: body.variables || {},
        modifier: modifier as any,
      });
      finalSystem = assembled.system;
    }

    const result = await callOpenRouter(`${prompt}\n\n(پاسخ فارسی بده)`, {
      systemPrompt: finalSystem || "فقط به فارسی پاسخ بده.",
      maxTokens,
      temperature: 0.5,
      modelOverride,
    });

    if (!result.success) {
      await rollback();
      return NextResponse.json({ error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      model: result.model,
      content: result.content,
    });
      }
    );

  } catch (error) {
    console.error("AI Generate Error:", error);
    await rollback();
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
