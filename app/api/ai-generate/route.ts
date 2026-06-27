import { NextResponse } from 'next/server';
import { callOpenRouter, parseJsonFromAI } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';

export const maxDuration = 60; // Allow 60 seconds for AI generation
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Canvas generation prompt template - explicit Persian
const CANVAS_GENERATION_PROMPT = `ایده: {businessIdea}
نام: {projectName}

یک بوم کسب‌وکار ۹ بخشی به فارسی بنویس.
فقط JSON خروجی بده، بدون توضیح:

{{
  "keyPartners": "• شریک ۱\\n• شریک ۲\\n• شریک ۳",
  "keyActivities": "• فعالیت ۱\\n• فعالیت ۲\\n• فعالیت ۳",
  "keyResources": "• منبع ۱\\n• منبع ۲\\n• منبع ۳",
  "uniqueValue": "• ارزش ۱\\n• ارزش ۲\\n• ارزش ۳",
  "customerRelations": "• رابطه ۱\\n• رابطه ۲\\n• رابطه ۳",
  "channels": "• کانال ۱\\n• کانال ۲\\n• کانال ۳",
  "customerSegments": "• مشتری ۱\\n• مشتری ۲\\n• مشتری ۳",
  "costStructure": "• هزینه ۱\\n• هزینه ۲\\n• هزینه ۳",
  "revenueStream": "• درآمد ۱\\n• درآمد ۲\\n• درآمد ۳"
}}`;

export async function POST(req: Request) {
  let rollback = async () => {};
  try {
    // === AI Usage Limit Check ===
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return limitResult.errorResponse;
    rollback = limitResult.rollback;

    const body = await req.json();
    const { action, prompt, systemPrompt, maxTokens = 2000, businessIdea, projectName, modelOverride, city, address, activeProject } = body;


    // Handle Competitor Search (OSM Integration) - MOVED TO TOP to prevent generic handler from catching it
    if (action === 'analyze-location') {
       const { radius = 500, priceTier = 'mid', footfallDependency = 'high', rentBudget = 0 } = body;
       console.log("📍 Analyze Location Request:", { city, address, projectType: activeProject?.projectType, radius, priceTier, footfallDependency, rentBudget });
       
       // 1. Geocode
       const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', ' + city + ', Iran')}&format=json&limit=1`;
       let geoData: any = null;
       try {
           const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'Karnex-App/1.0' } });
           if (geoRes.ok) {
               geoData = await geoRes.json();
           } else {
               console.error("❌ Nominatim Geocoding API Error:", geoRes.status);
           }
       } catch (e) {
           console.error("❌ Geocoding fetch failed:", e);
       }
       console.log("🌍 Geocoding Result:", geoData?.[0] ? "Found" : "Not Found");
       
       let osmData = "No real-time data available.";
       let centerCoordinates = { lat: 35.6892, lon: 51.3890 }; // Fallback to Tehran coords
       let competitorsList: any[] = [];
       let transitList: any[] = [];
       let anchorsList: any[] = [];
       
       if (geoData && geoData.length > 0) {
          const lat = parseFloat(geoData[0].lat);
          const lon = parseFloat(geoData[0].lon);
          centerCoordinates = { lat, lon };
          
          // 2. Identify Category to Search
          let osmTag = 'amenity="cafe"'; // default
          const type = activeProject?.projectType?.toLowerCase() || '';
          if (type.includes('rest') || type.includes('food')) osmTag = 'amenity="restaurant"';
          else if (type.includes('cloth') || type.includes('fash')) osmTag = 'shop="clothes"';
          else if (type.includes('super') || type.includes('grocer')) osmTag = 'shop="supermarket"';
          else if (type.includes('tech') || type.includes('mobile')) osmTag = 'shop="mobile_phone"';
          else if (type.includes('beau') || type.includes('salon')) osmTag = 'shop="beauty"';

          // 3. Overpass Query
          const query = `
            [out:json][timeout:25];
            (
              node[${osmTag}](around:${radius},${lat},${lon});
              way[${osmTag}](around:${radius},${lat},${lon});
              relation[${osmTag}](around:${radius},${lat},${lon});
              
              node[railway=station](around:${radius},${lat},${lon});
              node[amenity=bus_station](around:${radius},${lat},${lon});
              node[shop=mall](around:${radius},${lat},${lon});
              way[shop=mall](around:${radius},${lat},${lon});
              node[amenity=university](around:${radius},${lat},${lon});
              way[amenity=university](around:${radius},${lat},${lon});
            );
            out center;
          `;
          
          try {
              const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
                  method: "POST",
                  body: query
              });
              
              if (overpassRes.ok) {
                  const overpassJson = await overpassRes.json();
                  if (overpassJson.elements) {
                      overpassJson.elements.forEach((el: any) => {
                          const name = el.tags?.['name:fa'] || el.tags?.name || el.tags?.operator;
                          if (!name) return;
                          
                          const elLat = el.lat || el.center?.lat || lat;
                          const elLon = el.lon || el.center?.lon || lon;
                          
                          const tagKey = osmTag.split('=')[0];
                          const tagVal = osmTag.split('=')[1].replace(/"/g, '');
                          
                          const isCompetitor = el.tags?.[tagKey] === tagVal;
                          const isTransit = el.tags?.railway === 'station' || el.tags?.amenity === 'bus_station';
                          const isAnchor = el.tags?.shop === 'mall' || el.tags?.amenity === 'university';
                          
                          const item = {
                              name,
                              lat: elLat,
                              lon: elLon,
                              type: el.tags?.amenity || el.tags?.shop || el.tags?.railway || 'POI'
                          };
                          
                          if (isCompetitor) {
                              competitorsList.push(item);
                          } else if (isTransit) {
                              transitList.push(item);
                          } else if (isAnchor) {
                              anchorsList.push(item);
                          }
                      });
                      
                      const competitorDataStr = competitorsList.slice(0, 8).map(c => `- ${c.name} (موقعیت: ${c.lat}, ${c.lon})`).join('\n');
                      const transitDataStr = transitList.slice(0, 5).map(t => `- ${t.name} (${t.type})`).join('\n');
                      const anchorsDataStr = anchorsList.slice(0, 5).map(a => `- ${a.name} (${a.type})`).join('\n');
                      
                      osmData = `
رقبا:
${competitorDataStr || "رقیب مستقیمی در این محدوده پیدا نشد."}

مراکز حمل و نقل نزدیک:
${transitDataStr || "ایستگاه مترو یا اتوبوس مهمی نزدیک نیست."}

مراکز جاذبه ترافیکی (شاپینگ سنترها/دانشگاه‌ها):
${anchorsDataStr || "جاذبه ترافیکی عمده‌ای نزدیک نیست."}
`;
                  }
              } else {
                  console.error("❌ Overpass API Error:", overpassRes.status);
              }
          } catch (e) {
              console.error("OSM Fetch Error:", e);
          }
       }

       const enhancedPrompt = `
       ${prompt}
       
       [IMPORTANT MAP DATA]
       We fetched real-time POIs from OpenStreetMap for location coordinates (Lat: ${centerCoordinates.lat}, Lon: ${centerCoordinates.lon}) and radius ${radius} meters:
       ${osmData}
       
       [PERSONALIZED BUSINESS CRITERIA]
       - Footfall Dependency: ${footfallDependency === 'high' ? 'پاخورمحور (خیلی وابسته به تردد عابر)' : 'مقصدمحور (کشش محلی مهم‌تر است)'}
       - Price Tier: ${priceTier === 'budget' ? 'اقتصادی و ارزان' : priceTier === 'mid' ? 'متوسط و میان‌رده' : 'لوکس و گران‌قیمت'}
       - Monthly Rent Budget: ${rentBudget ? rentBudget.toLocaleString('fa-IR') + ' تومان' : 'ثبت نشده'}
       
       INSTRUCTIONS:
       1. Calculate the 'score' (0-10) critical value taking into account how well the socioeconomic level of the location matches the business Price Tier and Footfall Dependency. For example:
          - A premium store in a low spending power neighborhood should get a score under 5.0.
          - A high footfall dependency store in a low traffic neighborhood should get a score under 5.0.
       2. In "directCompetitors", include the competitors from the real-time data above with their name, coordinates (lat/lon) as provided, and estimate their strengths/weaknesses and axis scores.
       3. Populate "hourlyFootfall" as a 24-hour traffic array representing estimated footfall index (0-100) per hour in Iran for this location (e.g. from 08:00 to 23:00).
       4. Under "financialSim", estimate:
          - "breakEvenTransactions" (number of daily transactions needed to cover rent budget and default operating costs in this neighborhood).
          - "rentToRevenueRatio" (what percentage of estimated monthly revenue is the rent budget, e.g. 15% or 40%).
          - "estimatedMonthlyRevenue" (estimated revenue range, e.g., 60 to 90 million Tomans).
       5. Populate "legalChecklist" with 3-4 realistic permits, municipal guidelines, or trade union distances needed in Iran for this business type.
       6. Return prioritizedRecommendations with unique "id" for each recommendation, and include "cost" ("کم‌هزینه" | "متوسط" | "سرمایه‌گذاری").
       7. Output ONLY valid JSON in Persian. Ensure all text values are in Persian.
       `;
       
       const result = await callOpenRouter(enhancedPrompt, {
          systemPrompt: 'You are a GIS retail location strategy specialist. Return ONLY valid JSON in Persian.',
          maxTokens: 3500,
          temperature: 0.3,
          modelOverride: modelOverride || 'google/gemini-3.5-flash'
       });
       
        if (!result.success) {
           console.error("❌ AI Generation Failed:", result.error);
           await rollback();
           return NextResponse.json({ error: result.error }, { status: 503 });
        }
    
        try {
            const json = parseJsonFromAI(result.content!);
            
            // Add geocoded coordinates to the final response
            json.coordinates = centerCoordinates;
            
            return NextResponse.json({ success: true, analysis: json });
        } catch (e) {
            console.error("❌ JSON Parse Error (Location Analysis):", e);
            console.error("Raw Content:", result.content);
            await rollback();
            return NextResponse.json({ error: 'Failed to parse location analysis' }, { status: 500 });
        }
    }

    // Handle full canvas generation
    if (action === 'generate-full-canvas') {
      if (!businessIdea) {
        return NextResponse.json({ error: 'Business idea is required' }, { status: 400 });
      }

      const canvasPrompt = CANVAS_GENERATION_PROMPT
        .replace('{businessIdea}', businessIdea)
        .replace('{projectName}', projectName || 'پروژه جدید');

      const result = await callOpenRouter(canvasPrompt, {
        systemPrompt: 'تو متخصص کسب‌وکار هستی. فقط JSON فارسی خروجی بده. توضیحات هر بخش را کامل و قابل فهم برای مبتدی بنویس - حداقل ۲ جمله در هر فیلد.',
        maxTokens: 2000,
        temperature: 0.5,
        modelOverride
      });

      if (!result.success) {
        await rollback();
        return NextResponse.json({ error: result.error }, { status: 503 });
      }

      try {
        const canvas = parseJsonFromAI(result.content!);
        return NextResponse.json({
          success: true,
          model: result.model,
          canvas,
        });
      } catch (parseError) {
        console.error('Failed to parse canvas JSON:', parseError);
        await rollback();
        return NextResponse.json({
          success: false,
          error: 'Failed to parse canvas response',
          rawContent: result.content,
        }, { status: 500 });
      }
    }

    // Handle section card generation
    if (action === 'generate-section-cards') {
      const { prompt } = body;
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }

      const result = await callOpenRouter(prompt, {
        systemPrompt: 'تو متخصص کسب‌وکار هستی. فقط یک آرایه JSON از رشته‌ها خروجی بده - هر رشته یک ایده کوتاه. بدون توضیح اضافه. فرمت: ["ایده ۱", "ایده ۲", "ایده ۳"]',
        maxTokens: 500,
        temperature: 0.7,
      });

      if (!result.success) {
        await rollback();
        return NextResponse.json({ error: result.error }, { status: 503 });
      }

      try {
        const cards = parseJsonFromAI(result.content!);
        return NextResponse.json({ success: true, cards });
      } catch (parseError) {
        const lines = result.content!.split('\n').filter((l: string) => l.trim().startsWith('•') || l.trim().startsWith('-')).map((l: string) => l.replace(/^[•\-]\s*/, '').trim()).filter(Boolean);
        return NextResponse.json({ success: true, cards: lines.length > 0 ? lines : ['ایده پیشنهادی'] });
      }
    }

    // Handle Pitch Deck Generation
    if (action === 'generate-pitch-deck') {
      const pitchPrompt = `
      Create a 10-slide startup pitch deck structure based on:
      Project Name: ${projectName}
      Business Idea: ${businessIdea}

      Slides to generate:
      1. Title Slide (Tagline)
      2. Problem (The Pain)
      3. Solution (The Product)
      4. Why Now? (Timing)
      5. Market Size (TAM/SAM/SOM)
      6. Competition (Unfair Advantage)
      7. Business Model (Revenue)
      8. Go-to-Market (Strategy)
      9. Team (Founders)
      10. Ask (Funding/Requirements)

      For each slide, provide:
      - title: Persian title (descriptive, not just a keyword)
      - type: slide type id
      - bullets: Array of 3-4 complete, explanatory Persian bullet points (not just keywords - each should be a full sentence that a beginner can understand).

      Return ONLY valid JSON array of objects:
      [
        { "type": "title", "title": "عنوان", "bullets": ["..."] },
        ...
      ]
      `;

      const result = await callOpenRouter(pitchPrompt, {
        systemPrompt: 'You are a Pitch Deck Expert. Return only valid JSON array.',
        maxTokens: 3000,
        temperature: 0.7,
      });

      if (!result.success) {
        await rollback();
        return NextResponse.json({ error: result.error }, { status: 503 });
      }

      try {
        const slides = parseJsonFromAI(result.content!);
        return NextResponse.json({ success: true, slides });
      } catch (e) {
        await rollback();
        return NextResponse.json({ error: 'Failed to parse slides' }, { status: 500 });
      }
    }

    // Handle Idea Validation (Roast & Experiments)
    if (action === 'validate-idea') {
      const validationPrompt = `
      Act as a brutal Y Combinator partner. Critically analyze this startup idea:
      Project: ${projectName}
      Description: ${businessIdea}

      1. ROAST: Give a brutal but constructive critique in Persian. Identify the biggest weakness. Explain WHY it's a weakness in 2-3 sentences so beginners understand.
      2. ASSUMPTIONS: List 6 core assumptions this business is making in Persian. Each assumption should be a complete sentence with brief explanation.
      3. EXPERIMENTS: Suggest 3 cheap, fast ways to test the riskiest assumption in Persian. Each experiment should include step-by-step instructions that a beginner can follow. Include estimated cost and time for each.

      Return ONLY valid JSON:
      {
        "critique": {
          "score": 65,
          "summary": "Brutal one-line summary in Persian.",
          "strengths": ["Strength 1 in Persian"],
          "weaknesses": ["Weakness 1 in Persian", "Weakness 2 in Persian"]
        },
        "assumptions": [
          { "id": "1", "text": "Assumption 1 in Persian", "risk": "critical" },
          { "id": "2", "text": "Assumption 2 in Persian", "risk": "critical" },
          { "id": "3", "text": "Assumption 3 in Persian", "risk": "minor" },
          { "id": "4", "text": "Assumption 4 in Persian", "risk": "minor" }
        ],
        "experiments": [
          { "title": "Experiment Title in Persian", "steps": "Step 1, Step 2 in Persian...", "metric": "Success metric in Persian" },
          ...
        ]
      }
      `;

      const result = await callOpenRouter(validationPrompt, {
         systemPrompt: 'You are a cynical VC. Return ONLY JSON. ALL TEXT VALUES MUST BE IN PERSIAN (FARSI).',
         temperature: 0.8,
         maxTokens: 2000
      });

       if (!result.success) {
         await rollback();
         return NextResponse.json({ error: result.error }, { status: 503 });
       }
       
       try {
          const validationData = parseJsonFromAI(result.content!);
          return NextResponse.json({ success: true, validation: validationData });
       } catch (e) {
          await rollback();
          return NextResponse.json({ error: 'Failed to parse validation data' }, { status: 500 });
       }
    }
    
    // Handle Growth Planning (Roshdnama 2.0)
    if (action === 'generate-growth-plan') {
       const { planType, stage } = body; // planType: 'north-star' | 'experiments'
       
       let growthPrompt = "";
       
       if (planType === 'north-star') {
          growthPrompt = `
          Analyze this startup to find its North Star Metric (NSM):
          Project: ${projectName}
          Description: ${businessIdea}

          Return ONLY valid JSON in Persian:
          {
            "northStarMetric": "The single key metric (e.g., Weekly Active Paid Users) - explain in simple Persian what this means",
            "why": "At least 2 sentences explaining why this metric matters for beginners",
            "inputMetrics": [
               { "name": "Input 1 (e.g., New Signups) - with brief explanation", "target": "Target value" },
               { "name": "Input 2 (e.g., Retention %) - with brief explanation", "target": "Target value" },
               { "name": "Input 3 - with brief explanation", "target": "Target value" }
            ]
          }`;
       } else if (planType === 'experiments') {
          growthPrompt = `
          Suggest 3 Growth Hacking experiments for the "${stage || 'Acquisition'}" stage of the AAARRR funnel.
          Project: ${projectName}
          Description: ${businessIdea}

          Return ONLY valid JSON in Persian:
          [
            {
              "title": "Experiment Title (e.g., LinkedIn Viral Loop)",
              "description": "Detailed execution plan - at least 3 sentences explaining HOW to do it step by step for a beginner",
              "ice_score": 8,
              "difficulty": "Easy/Medium/Hard"
            },
            ...
          ]
          `;
       }

       const result = await callOpenRouter(growthPrompt, {
         systemPrompt: 'You are a Growth Hacker like Sean Ellis. Return ONLY JSON in Persian.',
         temperature: 0.8,
         maxTokens: 1500
      });

       if (!result.success) {
         await rollback();
         return NextResponse.json({ error: result.error }, { status: 503 });
       }

       try {
         const growthData = parseJsonFromAI(result.content!);
         return NextResponse.json({ success: true, data: growthData });
       } catch (e) {
         await rollback();
         return NextResponse.json({ error: 'Failed to parse growth data' }, { status: 500 });
       }
     }

    // Handle regular text generation
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await callOpenRouter(`${prompt}\n\n(پاسخ فارسی بده)`, {
      systemPrompt: systemPrompt || 'فقط به فارسی پاسخ بده.',
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
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
