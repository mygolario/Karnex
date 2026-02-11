"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Landmark, Clock, DollarSign, Users } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";

export function NeighborhoodCard() {
  const { analysis } = useLocation();

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-card/50 to-purple-500/5 border-primary/10 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{analysis.address}</h3>
              <p className="text-[11px] text-muted-foreground">{analysis.city}</p>
            </div>
          </div>
          {analysis.locationConfidence && (
            <Badge
              variant="outline"
              className={
                analysis.locationConfidence === "High"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                  : analysis.locationConfidence === "Medium"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]"
                  : "bg-red-500/10 text-red-500 border-red-500/20 text-[10px]"
              }
            >
              اطمینان: {analysis.locationConfidence === "High" ? "بالا" : analysis.locationConfidence === "Medium" ? "متوسط" : "پایین"}
            </Badge>
          )}
        </div>

        {/* Neighborhood Profile */}
        {analysis.neighborhoodProfile && (
          <p className="text-sm leading-relaxed text-muted-foreground mb-5 text-justify border-r-2 border-primary/30 pr-3">
            {analysis.neighborhoodProfile}
          </p>
        )}

        {/* Quick Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {analysis.anchorLandmark && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.03] rounded-lg p-2.5">
              <Landmark size={14} className="text-purple-400 shrink-0" />
              <span className="truncate">{analysis.anchorLandmark}</span>
            </div>
          )}
          {analysis.population && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.03] rounded-lg p-2.5">
              <Users size={14} className="text-blue-400 shrink-0" />
              <span className="truncate">{analysis.population}</span>
            </div>
          )}
          {analysis.rentEstimate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.03] rounded-lg p-2.5">
              <DollarSign size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">{analysis.rentEstimate}</span>
            </div>
          )}
          {analysis.peakHours && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/[0.03] rounded-lg p-2.5">
              <Clock size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">{analysis.peakHours}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
