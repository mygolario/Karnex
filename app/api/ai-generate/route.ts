import { NextResponse } from "next/server";
import { callOpenRouter, parseJsonFromAI, TIER_FAST, TIER_REASONING } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { auth } from "@/lib/auth/session";
import { resolveAssembledPrompt } from "@/lib/ai/prompt-service";
import { runWithAiUsage } from "@/lib/ai-usage-context";
import {
  buildGenerateContext,
  handleContentBrief,
  handleContentIdeas,
  handleContentStrategy,
  handleFullCanvas,
  handleCanvasCritique,
  handleHealthDiagnosis,
  handleMarketResearch,
  handlePnLNarrative,
  handleMonthlyReview,
  handlePitchSlideAI,
  handleRepurpose,
  handleScriptWriter,
  handleSectionCards,
  handleValidateIdea,
  handleValidateIdeaRescore,
  handleValidateIdeaScript,
} from "@/lib/ai/generate-handlers";

export const maxDuration = 120;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let rollback = async () => {};
  try {
    const body = await req.json();
    const {
      action,
      prompt,
      systemPrompt,
      maxTokens = 2000,
      businessIdea,
      projectName,
      modelOverride,
      activeProject,
      modifier,
      deep,
    } = body;

    const creditFeature =
      deep &&
      (action === "market-research" || action === "generate-market-research")
        ? "market-research-deep"
        : typeof action === "string"
          ? action
          : "default";

    const limitResult = await checkAILimit(creditFeature);
    if (limitResult.errorResponse) return limitResult.errorResponse;
    rollback = limitResult.rollback;

    const session = await auth();
    const userId = session?.user?.id;

    const genCtx = buildGenerateContext(activeProject, userId, modifier);

    // Wrap the dispatch in a request-scoped AiUsageContext so every
    // callOpenRouter inside handlers auto-records token/cost to AiUsage.
    const feature = (action as string) || (body.featureKey as string) || "ai-generate";
    return await runWithAiUsage(
      { userId: userId || "anonymous", projectId: genCtx.projectId, feature },
      async () => {
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
        modelOverride: TIER_REASONING,
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
        const { validationBrief, businessStage } = body;
        const out = await handleValidateIdea({
          ...genCtx,
          businessIdea: businessIdea || "",
          validationBrief,
          businessStage,
        });
        return NextResponse.json({ success: true, ...out });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "validate-idea-rescore") {
      try {
        const {
          validationBrief,
          priorReport,
          evidenceEntries,
          assumptionStatuses,
          competitorsSummary,
          marketSummary,
        } = body;
        const out = await handleValidateIdeaRescore({
          ...genCtx,
          validationBrief,
          priorReport,
          evidenceEntries,
          assumptionStatuses,
          competitorsSummary,
          marketSummary,
        });
        return NextResponse.json({ success: true, ...out });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "validate-idea-script") {
      try {
        const { problem, whoSuffers, assumptionText } = body;
        const out = await handleValidateIdeaScript({
          ...genCtx,
          problem,
          whoSuffers,
          assumptionText,
        });
        return NextResponse.json({ success: true, ...out });
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
      const { slideContent, mode, slideType } = body;
      if (!slideContent || !mode) {
        return NextResponse.json({ error: "slideContent and mode required" }, { status: 400 });
      }
      try {
        const result = await handlePitchSlideAI({
          ...genCtx,
          slideContent,
          mode,
          slideType,
        });
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

    if (action === "health-diagnosis") {
      const { report } = body;
      if (!report) {
        return NextResponse.json({ error: "report required" }, { status: 400 });
      }
      try {
        const diagnosis = await handleHealthDiagnosis({ ...genCtx, report });
        return NextResponse.json({ success: true, diagnosis });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "pnl-narrative") {
      const { pnl } = body;
      if (!pnl) {
        return NextResponse.json({ error: "pnl required" }, { status: 400 });
      }
      try {
        const narrative = await handlePnLNarrative({ ...genCtx, pnl });
        return NextResponse.json({ success: true, narrative });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: String(e) }, { status: 500 });
      }
    }

    if (action === "monthly-review") {
      const { report } = body;
      if (!report) {
        return NextResponse.json({ error: "report required" }, { status: 400 });
      }
      try {
        const narrative = await handleMonthlyReview({ ...genCtx, report });
        return NextResponse.json({ success: true, narrative });
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
      modelOverride:
        modelOverride ||
        (action === "refine-text" || action === "enhance-bio"
          ? TIER_FAST
          : undefined),
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
