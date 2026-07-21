"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Map, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "karnex_genesis_first_run_coach";
const DISMISSED_KEY = "karnex_genesis_first_run_dismissed";

/**
 * Lightweight post-Genesis handoff: points beginners to roadmap week 1.
 */
export function GenesisFirstRunCoach() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
      const fromQuery = searchParams.get("genesisCoach") === "1";
      const fromFlag = localStorage.getItem(STORAGE_KEY) === "1";
      if (fromQuery || fromFlag) {
        setOpen(true);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    // Clean query without full reload
    if (searchParams.get("genesisCoach")) {
      router.replace("/dashboard/overview");
    }
  };

  const goRoadmap = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setOpen(false);
    router.push("/dashboard/roadmap");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-4 end-4 text-muted-foreground hover:text-foreground"
          aria-label="بستن"
        >
          <X className="w-4 h-4" />
        </button>
        <DialogHeader className="text-center items-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <DialogTitle className="text-xl font-bold">
            پروژه‌ات آماده است
          </DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            برای ۱۰ دقیقه اول، از هفته ۱ نقشه راه شروع کن — کوچک‌ترین قدم بعدی
            همان‌جاست.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-2">
          <Button
            onClick={goRoadmap}
            className="w-full gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
          >
            <Map className="w-4 h-4" />
            برو به هفته ۱ نقشه راه
          </Button>
          <Button variant="ghost" onClick={dismiss} className="w-full">
            بعداً خودم می‌گردم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
