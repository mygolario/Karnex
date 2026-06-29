"use client";

import { LocationDnaCard } from "../location-dna-card";
import { SwotGrid } from "../swot-grid";
import { MarketGapCards } from "../market-gap-cards";
import { SmartAlternatives } from "../smart-alternatives";
import { RecommendationsList } from "../recommendations-list";
import { StreetIntelligence } from "../street-intelligence";

export function StrategyTab() {
  return (
    <div className="space-y-6 dir-rtl">
      <LocationDnaCard />
      <StreetIntelligence />
      <SwotGrid />
      <MarketGapCards />
      <SmartAlternatives />
      <RecommendationsList />
    </div>
  );
}
