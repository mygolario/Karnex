import { describe, it, expect } from "vitest";
import {
  migratePitchDeck,
  normalizeSlide,
  snapshotVersion,
  isPitchDeckV2,
} from "@/lib/pitch-deck/migrate";
import { syncDeckFromProject } from "@/lib/pitch-deck/sync-engine";
import { computeReadiness } from "@/lib/pitch-deck/readiness";

describe("Pitch Deck V2 migrate", () => {
  it("migrates legacy slide arrays to V2", () => {
    const legacy = [
      { id: "1", type: "title", title: "تست", bullets: ["a", "b"] },
      { id: "2", type: "problem", title: "مشکل", bullets: ["x"] },
    ];
    const deck = migratePitchDeck(legacy);
    expect(isPitchDeckV2(deck)).toBe(true);
    expect(deck.slides).toHaveLength(2);
    expect(deck.slides[0].blocks?.length).toBeGreaterThan(0);
    expect(deck.slides[0].theme).toBe("karnex_light");
  });

  it("maps legacy theme ids", () => {
    const slide = normalizeSlide({
      type: "title",
      title: "t",
      bullets: [],
      metadata: { theme: "midnight_cyan" },
    });
    expect(slide.theme).toBe("karnex_stage");
    expect(slide.metadata?.theme).toBe("karnex_stage");
  });

  it("snapshots versions with cap behavior", () => {
    let deck = migratePitchDeck([]);
    deck.slides = [normalizeSlide({ type: "title", title: "A", bullets: ["1"] })];
    deck = snapshotVersion(deck, "v1");
    expect(deck.versions).toHaveLength(1);
    expect(deck.versions[0].label).toBe("v1");
  });
});

describe("Pitch Deck sync engine", () => {
  it("syncs competitors into competition slide", () => {
    const deck = migratePitchDeck([
      { id: "c1", type: "competition", title: "رقبا", bullets: [] },
    ]);
    const { deck: next, changed } = syncDeckFromProject(deck, {
      competitors: [{ name: "رقیب الف", strength: "برند", weakness: "قیمت" }],
    });
    expect(changed).toBe(true);
    expect(next.slides[0].metadata?.competitors?.[0]?.name).toBe("رقیب الف");
  });

  it("respects userOverrides", () => {
    const deck = migratePitchDeck([
      {
        id: "c1",
        type: "competition",
        title: "رقبا",
        bullets: [],
        metadata: { competitors: [{ name: "دستی", strength: "x", weakness: "y" }] },
        userOverrides: ["competitors"],
      },
    ]);
    const { deck: next, changed } = syncDeckFromProject(deck, {
      competitors: [{ name: "جدید", strength: "a", weakness: "b" }],
    });
    expect(next.slides[0].metadata?.competitors?.[0]?.name).toBe("دستی");
    expect(changed).toBe(false);
  });
});

describe("Pitch Deck readiness", () => {
  it("returns gentle tips and a bounded score", () => {
    const deck = migratePitchDeck([
      { id: "1", type: "title", title: "عنوان", bullets: ["تگ", "نکته"] },
      { id: "2", type: "ask", title: "Ask", bullets: ["مصرف"], metadata: { amount: "۱ میلیارد" } },
    ]);
    const r = computeReadiness(deck);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.tips.length).toBeGreaterThan(0);
  });
});
