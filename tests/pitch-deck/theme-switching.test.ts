import { describe, it, expect } from "vitest";
import { SlideThemes, PRIMARY_THEME_KEYS, resolveTheme } from "@/lib/pitch-deck";

describe("Pitch Deck Themes", () => {
  it("should define three primary Karnex themes", () => {
    expect(PRIMARY_THEME_KEYS).toEqual([
      "karnex_pink",
      "midnight_pro",
      "clean_light",
    ]);
    for (const key of PRIMARY_THEME_KEYS) {
      expect(SlideThemes[key]).toBeDefined();
    }
  });

  it("should keep legacy themes for existing decks", () => {
    expect(SlideThemes.midnight_cyan).toBeDefined();
    expect(SlideThemes.amethyst_glow).toBeDefined();
    expect(SlideThemes.sleek_slate).toBeDefined();
  });

  it("should map Karnex Pink properties correctly", () => {
    const theme = SlideThemes.karnex_pink;
    expect(theme.bg).toBe("#1a0612");
    expect(theme.primary).toBe("#EC4899");
    expect(theme.secondary).toBe("#FB923C");
  });

  it("should map Midnight Pro properties correctly", () => {
    const theme = SlideThemes.midnight_pro;
    expect(theme.bg).toBe("#0B1220");
    expect(theme.primary).toBe("#F472B6");
  });

  it("should map Clean Light as a light theme", () => {
    const theme = SlideThemes.clean_light;
    expect(theme.isLight).toBe(true);
    expect(theme.bg).toBe("#FAFAFA");
    expect(theme.fg).toBe("#18181B");
  });

  it("should resolve unknown theme to Karnex Pink", () => {
    expect(resolveTheme("nope").id).toBe("karnex_pink");
  });

  it("should preserve legacy Midnight Cyan mapping", () => {
    const theme = SlideThemes.midnight_cyan;
    expect(theme.bg).toBe("#020617");
    expect(theme.primary).toBe("#22D3EE");
    expect(theme.secondary).toBe("#60A5FA");
  });
});
