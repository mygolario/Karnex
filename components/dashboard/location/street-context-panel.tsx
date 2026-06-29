"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "./location-context";
import { Camera, ExternalLink, MapPin, Eye } from "lucide-react";
import { ConfidenceBadge } from "./confidence-badge";
import { cn } from "@/lib/utils";

const DEFAULT_CHECKLIST = [
  { id: "signage", label: "زاویه دید تابلو از خیابان اصلی" },
  { id: "parking", label: "خط دید پارکینگ / توقف" },
  { id: "entrance", label: "دسترسی ورودی بدون مانع" },
  { id: "evening", label: "نور کافی در ساعات شب" },
];

export function StreetContextPanel() {
  const { analysis, updateStorefrontPhoto, toggleOnSiteCheck } = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = analysis?.osmMeta;
  const storefront = analysis?.storefront;
  const checklist = storefront?.onSiteChecklist?.length
    ? storefront.onSiteChecklist
    : DEFAULT_CHECKLIST.map((c) => ({ ...c, checked: false }));

  return (
    <Card className="p-5 border-white/5 bg-card/30 dir-rtl space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          <h3 className="font-bold text-sm">زمینه خیابانی</h3>
          <ConfidenceBadge level="real" />
        </div>
        {meta?.mapillaryUrl && (
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
            <a href={meta.mapillaryUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={12} />
              نمای خیابان (Mapillary)
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <p>
            <span className="text-muted-foreground">محله: </span>
            {meta?.landmark || analysis?.anchorLandmark || "—"}
          </p>
          {meta?.buildingTags && meta.buildingTags.length > 0 && (
            <p>
              <span className="text-muted-foreground">ساختمان: </span>
              {meta.buildingTags.join("، ")}
            </p>
          )}
          {storefront?.visibilityAssessment && (
            <p className="leading-relaxed text-muted-foreground">
              <Eye size={12} className="inline ml-1" />
              {storefront.visibilityAssessment}
            </p>
          )}
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => updateStorefrontPhoto(reader.result as string);
              reader.readAsDataURL(file);
            }}
          />
          <div
            className={cn(
              "rounded-xl border border-dashed border-white/10 min-h-[120px] flex flex-col items-center justify-center gap-2 overflow-hidden",
              storefront?.photoDataUrl && "border-solid p-0"
            )}
          >
            {storefront?.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storefront.photoDataUrl}
                alt="نمای مغازه"
                className="w-full h-32 object-cover"
              />
            ) : (
              <>
                <Camera className="text-muted-foreground/50" size={28} />
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => fileRef.current?.click()}
                >
                  آپلود عکس ویترین
                </Button>
              </>
            )}
          </div>
          {storefront?.photoDataUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] mt-1 w-full"
              onClick={() => fileRef.current?.click()}
            >
              تغییر عکس
            </Button>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold mb-2 text-muted-foreground">چک‌لیست بازدید حضوری</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleOnSiteCheck(item.id)}
              className={cn(
                "text-right text-[11px] p-2.5 rounded-lg border transition-colors",
                item.checked
                  ? "border-emerald-500/30 bg-emerald-500/5 line-through text-muted-foreground"
                  : "border-white/5 hover:border-white/10"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
