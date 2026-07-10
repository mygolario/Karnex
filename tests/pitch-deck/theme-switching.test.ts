import { describe, it, expect } from "vitest";
import { SlideThemes, resolveTheme, LEGACY_THEME_MAP } from "@/lib/pitch-deck/themes";

describe("Pitch Deck Karnex Themes", () => {
  it("should define four Karnex themes", () => {
    expect(SlideThemes.karnex_light).toBeDefined();
    expect(SlideThemes.karnex_glass).toBeDefined();
    expect(SlideThemes.karnex_stage).toBeDefined();
    expect(SlideThemes.karnex_minimal).toBeDefined();
  });

  it("should use Karnex pink/orange brand colors on light theme", () => {
    const theme = SlideThemes.karnex_light;
    expect(theme.primary.toLowerCase()).toBe("#ec4899");
    expect(theme.secondary.toLowerCase()).toBe("#f97316");
    expect(theme.isDark).toBe(false);
  });

  it("should map legacy themes to Karnex themes", () => {
    expect(LEGACY_THEME_MAP.midnight_cyan).toBe("karnex_stage");
    expect(LEGACY_THEME_MAP.amethyst_glow).toBe("karnex_glass");
    expect(LEGACY_THEME_MAP.sleek_slate).toBe("karnex_minimal");
    expect(resolveTheme("midnight_cyan").id).toBe("karnex_stage");
  });

  it("should resolve unknown themes to default light", () => {
    expect(resolveTheme("nope").id).toBe("karnex_light");
  });
});
