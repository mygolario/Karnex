import { describe, it, expect } from 'vitest'
import { SlideThemes } from '@/components/features/pitch-deck/slide-templates'

describe('Pitch Deck Themes', () => {
  it('should define three distinct themes', () => {
    expect(SlideThemes.midnight_cyan).toBeDefined()
    expect(SlideThemes.amethyst_glow).toBeDefined()
    expect(SlideThemes.sleek_slate).toBeDefined()
  })

  it('should map Midnight Cyan properties correctly', () => {
    const theme = SlideThemes.midnight_cyan
    expect(theme.bg).toBe('#020617')
    expect(theme.primary).toBe('#22D3EE')
    expect(theme.secondary).toBe('#60A5FA')
  })

  it('should map Amethyst Glow properties correctly', () => {
    const theme = SlideThemes.amethyst_glow
    expect(theme.bg).toBe('#09090B')
    expect(theme.primary).toBe('#C084FC')
    expect(theme.secondary).toBe('#F472B6')
  })

  it('should map Sleek Slate properties correctly', () => {
    const theme = SlideThemes.sleek_slate
    expect(theme.bg).toBe('#0B0F10')
    expect(theme.primary).toBe('#34D399')
    expect(theme.secondary).toBe('#94A3B8')
  })
})
