"use client";

import Link from "next/link";
import { Rocket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when dashboard feature pages load without an active project. */
export function EmptyProjectState({
  title = "اولین پروژه‌ات را بساز",
  description = "با نقشه راه و هم‌بنیان‌گذار هوشمند کارنکس شروع کن.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md relative">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-50" />
        <div className="relative z-10 glass-panel p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="w-24 h-24 bg-gradient-to-tr from-primary to-violet-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
            <Rocket size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">{title}</h2>
          <p className="text-muted-foreground mb-8 text-base">{description}</p>
          <Link href="/new-project">
            <Button size="lg" className="w-full text-base h-12 rounded-xl font-bold">
              <Plus size={20} className="ms-2" />
              ساخت پروژه جدید
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
