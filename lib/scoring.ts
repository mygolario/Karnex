import { BusinessPlan } from "./db";

export interface ScoreResult {
  total: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    foundation: number; // Max 20
    strategy: number;   // Max 30
    market: number;     // Max 30
    execution: number;  // Max 20
  };
  suggestions: string[];
}

export const calculateProjectScore = (plan: BusinessPlan): ScoreResult => {
  let foundation = 0;
  let strategy = 0;
  let market = 0;
  let execution = 0;
  const suggestions: string[] = [];

  // 1. Foundation (20 pts)
  if (plan.projectName && plan.projectName.length > 2) foundation += 5;
  else suggestions.push("نام پروژه را مشخص کنید.");

  if (plan.overview && plan.overview.length > 50) foundation += 5;
  else suggestions.push("توضیحات کلی پروژه را کامل‌تر بنویسید (حداقل ۵۰ کاراکتر).");

  if (plan.audience && plan.audience.length > 5) foundation += 5;
  else suggestions.push("مخاطبان هدف خود را مشخص کنید.");

  if (plan.budget && plan.budget.length > 2) foundation += 5;
  else suggestions.push("بودجه اولیه را تعیین کنید.");


  // 2. Strategy Engine (30 pts)
  // Check based on project type
  let canvasFilledCount = 0;
  const totalCanvasFields = 4; // We check 4 key fields

  if (plan.projectType === 'startup') {
    if (plan.leanCanvas?.keyPartners) canvasFilledCount++;
    if (plan.leanCanvas?.keyActivities) canvasFilledCount++;
    if (plan.leanCanvas?.uniqueValue) canvasFilledCount++;
    if (plan.leanCanvas?.revenueStream) canvasFilledCount++;
    
    if (canvasFilledCount < 4) suggestions.push("بوم مدل کسب‌وکار را کامل کنید.");

  } else if (plan.projectType === 'traditional') {
    if (plan.swotAnalysis?.strengths) canvasFilledCount++;
    if (plan.swotAnalysis?.weaknesses) canvasFilledCount++;
    if (plan.swotAnalysis?.opportunities) canvasFilledCount++;
    if (plan.swotAnalysis?.threats) canvasFilledCount++;

     if (canvasFilledCount < 4) suggestions.push("تحلیل SWOT را کامل کنید.");

  } else if (plan.projectType === 'creator') {
    if (plan.brandCanvas?.niche) canvasFilledCount++;
    if (plan.brandCanvas?.audienceAvatar) canvasFilledCount++;
    if (plan.brandCanvas?.contentPillars) canvasFilledCount++;
    if (plan.brandCanvas?.revenueChannels) canvasFilledCount++;

     if (canvasFilledCount < 4) suggestions.push("بوم برند (Brand Canvas) را کامل کنید.");
  } else {
     // Fallback if type not set or legacy
     if (plan.leanCanvas?.problem) canvasFilledCount++;
  }
  
  strategy = (canvasFilledCount / totalCanvasFields) * 30;


  // 3. Market & Money (30 pts)
  // Competitors (10)
  if (plan.competitors && plan.competitors.length > 0) market += 10;
  else suggestions.push("حداقل یک رقیب را تحلیل کنید.");

  // Marketing (10)
  if (plan.marketingStrategy && plan.marketingStrategy.length >= 2) market += 10;
  else suggestions.push("استراتژی بازاریابی (حداقل ۲ مورد) را مشخص کنید.");

  // Financials (10) - Check if any financial tool is used
  const hasFinancials = 
    (plan.financials?.runway?.monthlyBurn || 0) > 0 ||
    (plan.financials?.breakEven?.fixedCosts || 0) > 0 ||
    (plan.financials?.rateCard?.packages?.length || 0) > 0;

  if (hasFinancials) market += 10;
  else suggestions.push("ابزارهای مالی (نقطه سربه‌سر، نرخ‌نامه یا Runway) را استفاده کنید.");


  // 4. Execution (20 pts)
  const totalSteps = plan.roadmap?.reduce((acc, p) => acc + p.steps.length, 0) || 1;
  const completedSteps = plan.completedSteps?.length || 0;
  const progressRatio = Math.min(1, completedSteps / totalSteps);
  
  execution = Math.round(progressRatio * 20);
  
  if (progressRatio < 0.1) suggestions.push("اولین قدم از نقشه راه را تیک بزنید!");


  // Total & Grade
  const total = Math.round(foundation + strategy + market + execution);
  
  let grade: ScoreResult['grade'] = 'D';
  if (total >= 90) grade = 'S';
  else if (total >= 80) grade = 'A';
  else if (total >= 60) grade = 'B';
  else if (total >= 40) grade = 'C';

  return {
    total,
    grade,
    breakdown: {
      foundation,
      strategy,
      market,
      execution
    },
    suggestions: suggestions.slice(0, 3) // Return top 3 suggestions
  };
};
