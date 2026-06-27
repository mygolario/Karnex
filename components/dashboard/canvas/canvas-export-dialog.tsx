"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FileImage, FileText, FileType, FileJson, FileCode, Loader2, Download,
} from "lucide-react";
import { useCanvasStore } from "@/lib/canvas/store";
import {
  exportCanvasAsImage, exportCanvasAsPDF, exportCanvasAsJSON, exportCanvasAsMarkdown,
} from "@/lib/canvas/export";
import { toast } from "sonner";

const EXPORT_FORMATS = [
  { id: "png", label: "PNG", desc: "تصویر با کیفیت بالا", icon: FileImage },
  { id: "jpeg", label: "JPEG", desc: "تصویر فشرده", icon: FileImage },
  { id: "svg", label: "SVG", desc: "وکتور مقیاس‌پذیر", icon: FileText },
  { id: "pdf", label: "PDF", desc: "مستند قابل چاپ", icon: FileType },
  { id: "json", label: "JSON", desc: "داده خام بوم", icon: FileJson },
  { id: "markdown", label: "Markdown", desc: "متن ساختاریافته", icon: FileCode },
] as const;

export function CanvasExportDialog() {
  const open = useCanvasStore((s) => s.exportDialogOpen);
  const setOpen = useCanvasStore((s) => s.setExportDialogOpen);
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const canvasName = useCanvasStore((s) => s.canvasName);
  const [selectedFormat, setSelectedFormat] = useState<string>("png");
  const [fileName, setFileName] = useState(canvasName);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const element = document.getElementById("bmc-canvas-content");
      if (!element && (selectedFormat === "png" || selectedFormat === "jpeg" || selectedFormat === "svg" || selectedFormat === "pdf")) {
        toast.error("بوم یافت نشد");
        return;
      }

      const name = fileName || "canvas";

      if (selectedFormat === "png") {
        await exportCanvasAsImage(element!, "png", name);
      } else if (selectedFormat === "jpeg") {
        await exportCanvasAsImage(element!, "jpeg", name);
      } else if (selectedFormat === "svg") {
        await exportCanvasAsImage(element!, "svg", name);
      } else if (selectedFormat === "pdf") {
        await exportCanvasAsPDF(element!, name);
      } else if (selectedFormat === "json") {
        exportCanvasAsJSON(canvasState, canvasType, name);
      } else if (selectedFormat === "markdown") {
        exportCanvasAsMarkdown(canvasState, canvasType, name);
      }

      toast.success("خروجی با موفقیت ساخته شد");
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("خطا در ساخت خروجی");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={18} />
            خروجی گرفتن از بوم
          </DialogTitle>
          <DialogDescription>فرمت مورد نظر را انتخاب کنید</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">نام فایل</label>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="نام فایل" className="text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {EXPORT_FORMATS.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-start",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{fmt.label}</div>
                    <div className="text-[10px] text-muted-foreground">{fmt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <Button className="w-full" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <><Loader2 size={16} className="animate-spin" /> در حال ساخت...</>
            ) : (
              <><Download size={16} /> دانلود</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
