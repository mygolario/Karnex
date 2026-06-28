import { NextResponse } from "next/server";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { auth } from "@/lib/auth/session";
import { resolveAssembledPrompt } from "@/lib/ai/prompt-service";
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

async function fetchOsmBlock(
  city: string,
  address: string,
  radius: number,
  activeProject: Record<string, unknown> | undefined
) {
  let osmData = "No real-time data available.";
  let centerCoordinates = { lat: 35.6892, lon: 51.3890 };
  const competitorsList: { name: string; lat: number; lon: number }[] = [];

  const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", " + city + ", Iran")}&format=json&limit=1`;
  let geoData: { lat: string; lon: string }[] | null = null;
  try {
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "Karnex-App/1.0" },
    });
    if (geoRes.ok) geoData = await geoRes.json();
  } catch (e) {
    console.error("Geocoding failed:", e);
  }

  if (geoData?.length) {
    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    centerCoordinates = { lat, lon };

    let osmTag = 'amenity="cafe"';
    const type = String(activeProject?.projectType || "").toLowerCase();
    if (type.includes("rest") || type.includes("food"))
      osmTag = 'amenity="restaurant"';
    else if (type.includes("cloth") || type.includes("fash"))
      osmTag = 'shop="clothes"';
    else if (type.includes("super") || type.includes("grocer"))
      osmTag = 'shop="supermarket"';

    const query = `[out:json][timeout:25];(node[${osmTag}](around:${radius},${lat},${lon}););out center;`;
    try {
      const overpassRes = await fetch(
        "https://overpass-api.de/api/interpreter",
        { method: "POST", body: query }
      );
      if (overpassRes.ok) {
        const overpassJson = await overpassRes.json();
        overpassJson.elements?.forEach((el: Record<string, unknown>) => {
          const tags = el.tags as Record<string, string> | undefined;
          const name = tags?.["name:fa"] || tags?.name;
          if (!name) return;
          competitorsList.push({
            name,
            lat: (el.lat as number) || (el.center as { lat: number })?.lat || lat,
            lon: (el.lon as number) || (el.center as { lon: number })?.lon || lon,
          });
        });
        osmData = competitorsList
          .slice(0, 8)
          .map((c) => `- ${c.name} (${c.lat}, ${c.lon})`)
          .join("\n");
      }
    } catch (e) {
      console.error("OSM fetch error:", e);
    }
  }

  return {
    osmDataBlock: `[داده نقشه OSM]\nمختصات: ${centerCoordinates.lat}, ${centerCoordinates.lon}\nرقبا:\n${osmData}`,
    centerCoordinates,
  };
}

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
        radius = 500,
        priceTier = "mid",
        footfallDependency = "high",
        rentBudget = 0,
        businessCategory = "",
      } = body;

      const { osmDataBlock, centerCoordinates } = await fetchOsmBlock(
        city,
        address,
        radius,
        activeProject
      );

      try {
        const json = await handleAnalyzeLocation(
          {
            ...genCtx,
            city,
            address,
            radius,
            priceTier,
            footfallDependency,
            rentBudget,
            businessCategory,
            osmDataBlock,
          },
          modelOverride
        );
        json.coordinates = centerCoordinates;
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
