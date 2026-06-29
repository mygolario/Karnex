import { NextResponse } from "next/server";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { auth } from "@/lib/auth/session";
import { resolveAssembledPrompt } from "@/lib/ai/prompt-service";
import { fetchLocationOsmData } from "@/lib/location/data-adapters/osm-adapter";
import {
  buildLocationProjectContextBlock,
  computeCannibalization,
} from "@/lib/location/project-context-block";
import {
  buildGenerateContext,
  handleAnalyzeLocation,
  handleContentBrief,
  handleContentIdeas,
  handleContentStrategy,
  handleFullCanvas,
  handleGrowthPlan,
  handleRepurpose,
  handleScriptWriter,
  handleSectionCards,
  handleValidateIdea,
} from "@/lib/ai/generate-handlers";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let rollback = async () => {};
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

    if (action === "analyze-location") {
      const {
        radius: requestedRadius,
        priceTier = "mid",
        footfallDependency = "high",
        rentBudget = 0,
        businessCategory = "",
        businessDescription = "",
      } = body;

      const osm = await fetchLocationOsmData({
        city,
        address,
        businessDescription: businessDescription || String(activeProject?.overview || ""),
        businessCategory,
        radius: requestedRadius,
      });

      const projectContextBlock = buildLocationProjectContextBlock(activeProject);

      try {
        const json = await handleAnalyzeLocation(
          {
            ...genCtx,
            city,
            address,
            radius: osm.radius,
            priceTier,
            footfallDependency,
            rentBudget,
            businessCategory: osm.categorySlug,
            businessDescription: businessDescription || String(activeProject?.overview || ""),
            osmDataBlock: osm.osmDataBlock,
            projectContextBlock,
          },
          modelOverride
        );
        json.coordinates = osm.centerCoordinates;
        json.osmMeta = {
          landmark: osm.landmark,
          buildingTags: osm.buildingTags,
          mapillaryUrl: osm.mapillaryUrl,
          categorySlug: osm.categorySlug,
        };
        if (!json.catchment) {
          json.catchment = {
            radiusM: osm.radius,
            poiDensity: osm.poiDensity,
            transitStops: osm.transitStops,
            confidence: "real",
          };
        }
        const cann = computeCannibalization(
          osm.centerCoordinates.lat,
          osm.centerCoordinates.lon,
          activeProject?.locationHistory as import("@/lib/db").LocationAnalysis[] | undefined
        );
        if (!json.cannibalization) {
          json.cannibalization = { ...cann, confidence: "inferred" };
        }
        return NextResponse.json({ success: true, analysis: json });
      } catch (e) {
        console.error("Location analysis error:", e);
        await rollback();
        return NextResponse.json(
          { error: "Failed to parse location analysis" },
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
        modelOverride: modelOverride || "google/gemini-2.5-flash",
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
  } catch (error) {
    console.error("AI Generate Error:", error);
    await rollback();
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
