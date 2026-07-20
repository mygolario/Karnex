"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderKanban, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";

export type LimitReachedKind = "ai" | "project";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limit?: number;
  used?: number;
  message?: string;
  zIndex?: number;
  /** Defaults to AI credit exhaustion copy */
  kind?: LimitReachedKind;
}

const COPY: Record<
  LimitReachedKind,
  { title: string; fallbackMessage: string; continueHint: string; icon: typeof XCircle }
> = {
  ai: {
    title: "پایان اعتبار هوش مصنوعی",
    fallbackMessage: "شما به سقف استفاده از هوش مصنوعی در پلن فعلی خود رسیده‌اید.",
    continueHint: "برای ادامه استفاده از امکانات هوش مصنوعی، لطفاً پلن خود را ارتقا دهید.",
    icon: XCircle,
  },
  project: {
    title: "سقف تعداد پروژه",
    fallbackMessage: "شما به سقف تعداد پروژه‌های فعال در پلن فعلی خود رسیده‌اید.",
    continueHint: "برای ساخت پروژه جدید، پلن خود را ارتقا دهید یا یک پروژه فعال را حذف کنید.",
    icon: FolderKanban,
  },
};

export function LimitReachedModal({
  isOpen,
  onClose,
  limit,
  used,
  message,
  zIndex,
  kind = "ai",
}: LimitReachedModalProps) {
  const copy = COPY[kind];
  const Icon = copy.icon;
  const bodyMessage = message || copy.fallbackMessage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl" style={{ zIndex: zIndex }}>
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <Icon className="w-8 h-8 text-destructive" />
            </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {copy.title}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground leading-relaxed">
            {bodyMessage}
            <br />
            {copy.continueHint}
          </DialogDescription>
        </DialogHeader>

        {limit !== undefined && used !== undefined && (
            <div className="bg-muted/50 p-4 rounded-lg text-sm flex justify-between items-center my-2">
                <span className="text-muted-foreground">مصرف شما:</span>
                <span className="font-mono font-bold text-foreground">{used} / {limit}</span>
            </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
           <Link href="/pricing" className="w-full sm:w-auto flex-1">
              <Button className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" />
                ارتقای پلن
              </Button>
           </Link>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            متوجه شدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
