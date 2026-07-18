"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Save,
  RefreshCw,
  Play,
  Download,
  Link2,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface WorkspaceToolbarProps {
  onBack: () => void;
  onSync: () => void;
  onPresent: () => void;
  onPresenterCockpit: () => void;
  onExportPptx: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  onSave: () => void;
  saveStatus: SaveStatus;
  downloading: boolean;
  sharing: boolean;
  hasSlides: boolean;
  className?: string;
}

export function WorkspaceToolbar({
  onBack,
  onSync,
  onPresent,
  onPresenterCockpit,
  onExportPptx,
  onExportPdf,
  onShare,
  onSave,
  saveStatus,
  downloading,
  sharing,
  hasSlides,
  className,
}: WorkspaceToolbarProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-border/50 pb-4 md:flex-row md:items-center md:justify-between",
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowRight size={16} className="ms-2" />
          نمای کلی
        </Button>
        <span className="hidden text-border md:inline">|</span>
        <h2 className="hidden text-sm font-bold md:block">کارگاه پیچ‌دک</h2>
        <SaveBadge status={saveStatus} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          className="h-10 rounded-xl"
          disabled={!hasSlides}
        >
          <RefreshCw size={14} className="ms-2" />
          همگام‌سازی
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPresenterCockpit}
          className="h-10 rounded-xl"
          disabled={!hasSlides}
        >
          <Play size={14} className="ms-2" />
          کابین پرزنتر
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPresent}
          className="h-10 rounded-xl"
          disabled={!hasSlides}
        >
          <Play size={14} className="ms-2" />
          ارائه
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="h-10 rounded-xl"
          disabled={!hasSlides || sharing}
        >
          {sharing ? <Loader2 size={14} className="ms-2 animate-spin" /> : <Link2 size={14} className="ms-2" />}
          لینک مشاهده
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          className="h-10 rounded-xl"
          disabled={!hasSlides}
        >
          <Download size={14} className="ms-2" />
          PDF
        </Button>
        <Button
          size="sm"
          onClick={onExportPptx}
          disabled={!hasSlides || downloading}
          className="h-10 rounded-xl bg-gradient-to-l from-primary to-orange-500 px-5 font-bold text-white shadow-md shadow-primary/20"
        >
          {downloading ? (
            <Loader2 size={14} className="ms-2 animate-spin" />
          ) : (
            <Download size={14} className="ms-2" />
          )}
          دانلود PPTX
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={saveStatus === "saving"}
          className="h-10 rounded-xl"
        >
          <Save size={14} className="ms-2" />
          ذخیره
        </Button>
      </div>
    </header>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Loader2 size={12} className="animate-spin" /> در حال ذخیره...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
        <Check size={12} /> ذخیره شد
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-rose-500">
      <AlertCircle size={12} /> خطا در ذخیره
    </span>
  );
}
