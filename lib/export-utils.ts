import { BusinessPlan, RoadmapPhase } from "@/lib/db";

/**
 * Export brand colors as a CSS/SCSS snippet
 */
export function exportBrandColorsAsCSS(plan: BusinessPlan): string {
  return `:root {
  --brand-primary: ${plan.brandKit.primaryColorHex};
  --brand-secondary: ${plan.brandKit.secondaryColorHex};
  --brand-font: '${plan.brandKit.suggestedFont}', sans-serif;
}

/* Usage */
.btn-primary { background-color: var(--brand-primary); }
.btn-secondary { background-color: var(--brand-secondary); }
`;
}

/**
 * Export roadmap to ICS calendar format
 */
export function exportRoadmapToICS(plan: BusinessPlan): string {
  const now = new Date();
  let dayOffset = 0;
  
  const events = plan.roadmap.flatMap((phase: RoadmapPhase, phaseIdx: number) => {
    return phase.steps.map((step: string | any, stepIdx: number) => {
      const stepName = typeof step === 'string' ? step : step.title;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + dayOffset);
      dayOffset += 7; // Each task is 1 week apart
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      return `BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${stepName}
DESCRIPTION:فاز: ${phase.phase} | پروژه: ${plan.projectName}
STATUS:${plan.completedSteps?.includes(stepName) ? 'COMPLETED' : 'TENTATIVE'}
UID:${plan.id || 'project'}-${phaseIdx}-${stepIdx}@karnex.ir
END:VEVENT`;
    });
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Karnex//Roadmap Export//FA
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${plan.projectName} - نقشه راه
${events.join('\n')}
END:VCALENDAR`;
}

/**
 * Download helper function
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export brand kit as JSON
 */
export function exportBrandKitAsJSON(plan: BusinessPlan): string {
  const brandData = {
    projectName: plan.projectName,
    colors: {
      primary: plan.brandKit.primaryColorHex,
      secondary: plan.brandKit.secondaryColorHex,
      psychology: plan.brandKit.colorPsychology
    },
    typography: {
      font: plan.brandKit.suggestedFont
    },
    logoConcepts: plan.brandKit.logoConcepts,
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(brandData, null, 2);
}

/**
 * Export marketing strategy as markdown
 */
export function exportMarketingAsMarkdown(plan: BusinessPlan): string {
  let md = `# استراتژی بازاریابی ${plan.projectName}\n\n`;
  md += `مخاطب هدف: ${plan.audience}\n\n`;
  md += `## تکتیک‌ها\n\n`;
  
  plan.marketingStrategy.forEach((tactic, i) => {
    md += `${i + 1}. ${tactic}\n`;
  });
  
  if (plan.competitors?.length > 0) {
    md += `\n## تحلیل رقبا\n\n`;
    md += `| نام | نقطه قوت | نقطه ضعف | کانال |\n`;
    md += `|-----|----------|----------|-------|\n`;
    plan.competitors.forEach(c => {
      md += `| ${c.name} | ${c.strength} | ${c.weakness} | ${c.channel} |\n`;
    });
  }
  
  return md;
}
