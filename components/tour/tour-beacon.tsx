"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TourMascotPeek } from "./tour-mascot";

interface TourBeaconProps {
  targetId: string;
  label?: string;
  onClick: () => void;
  className?: string;
}

export function TourBeacon({ targetId, label, onClick, className }: TourBeaconProps) {
  return (
    <button
      type="button"
      data-beacon-for={targetId}
      onClick={onClick}
      className={cn(
        "absolute z-30 flex items-center justify-center group",
        className
      )}
      title={label ?? "راهنما"}
      aria-label={label ?? "شروع راهنمای این بخش"}
    >
      <span className="absolute w-8 h-8 rounded-full bg-primary/30 animate-ping" />
      <motion.span
        className="relative flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
      >
        <TourMascotPeek />
      </motion.span>
      {label && (
        <span className="absolute top-full mt-1 whitespace-nowrap text-[10px] font-medium bg-card border border-border px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          {label}
        </span>
      )}
    </button>
  );
}
