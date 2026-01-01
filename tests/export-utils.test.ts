import { describe, it, expect } from 'vitest'
import { 
  exportBrandColorsAsCSS, 
  exportRoadmapToICS, 
  exportBrandKitAsJSON,
  exportMarketingAsMarkdown 
} from '@/lib/export-utils'
import { BusinessPlan } from '@/lib/db'

const mockPlan: BusinessPlan = {
  id: 'test-123',
  projectName: 'تست پروژه',
  tagline: 'تست تگ لاین',
  overview: 'این یک پروژه تستی است',
  leanCanvas: {
    problem: 'مشکل تست',
    solution: 'راه حل تست',
    uniqueValue: 'ارزش تست',
    revenueStream: 'درآمد تست'
  },
  brandKit: {
    primaryColorHex: '#3B82F6',
    secondaryColorHex: '#10B981',
    colorPsychology: 'رنگ آبی اعتماد می‌سازد',
    suggestedFont: 'Vazirmatn',
    logoConcepts: [{ conceptName: 'لوگو ۱', description: 'توضیح لوگو' }]
  },
  roadmap: [
    { phase: 'فاز ۱', steps: ['قدم ۱', 'قدم ۲'] },
    { phase: 'فاز ۲', steps: ['قدم ۳'] }
  ],
  marketingStrategy: ['استراتژی ۱', 'استراتژی ۲'],
  competitors: [
    { name: 'رقیب ۱', strength: 'قوت', weakness: 'ضعف', channel: 'اینستاگرام' }
  ],
  budget: 'کم',
  audience: 'جوانان',
  createdAt: '2024-01-01T00:00:00Z'
}

describe('Export Utils', () => {
  describe('exportBrandColorsAsCSS', () => {
    it('should generate valid CSS with brand colors', () => {
      const css = exportBrandColorsAsCSS(mockPlan)
      
      expect(css).toContain('--brand-primary: #3B82F6')
      expect(css).toContain('--brand-secondary: #10B981')
      expect(css).toContain('Vazirmatn')
    })
  })

  describe('exportRoadmapToICS', () => {
    it('should generate valid ICS calendar format', () => {
      const ics = exportRoadmapToICS(mockPlan)
      
      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('END:VCALENDAR')
      expect(ics).toContain('BEGIN:VEVENT')
      expect(ics).toContain('SUMMARY:قدم ۱')
      expect(ics).toContain('تست پروژه')
    })
  })

  describe('exportBrandKitAsJSON', () => {
    it('should return valid JSON with brand data', () => {
      const json = exportBrandKitAsJSON(mockPlan)
      const parsed = JSON.parse(json)
      
      expect(parsed.projectName).toBe('تست پروژه')
      expect(parsed.colors.primary).toBe('#3B82F6')
      expect(parsed.typography.font).toBe('Vazirmatn')
    })
  })

  describe('exportMarketingAsMarkdown', () => {
    it('should generate markdown with strategies and competitors', () => {
      const md = exportMarketingAsMarkdown(mockPlan)
      
      expect(md).toContain('# استراتژی بازاریابی تست پروژه')
      expect(md).toContain('استراتژی ۱')
      expect(md).toContain('رقیب ۱')
      expect(md).toContain('## تحلیل رقبا')
    })
  })
})
