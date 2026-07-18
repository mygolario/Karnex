"use client";

import { RecurringTemplate } from "@/lib/db";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RepeatIcon, Plus, Trash2 } from "lucide-react";
import { PLATFORMS, CONTENT_TYPES, JALALI_DAY_NAMES } from "./constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RecurringManagerProps {
  templates: RecurringTemplate[];
  onChange: (templates: RecurringTemplate[]) => void;
}

const DEFAULT_TEMPLATE: Partial<RecurringTemplate> = {
  dayOfWeek: 5, // Friday
  platform: "instagram",
  type: "reel",
  defaultTitle: "",
  defaultTags: [],
  isActive: true,
};

export function RecurringManager({ templates, onChange }: RecurringManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<RecurringTemplate>>(DEFAULT_TEMPLATE);

  const addTemplate = () => {
    if (!newTemplate.platform || newTemplate.dayOfWeek === undefined) {
      toast.error("پلتفرم و روز هفته الزامی است");
      return;
    }
    const template: RecurringTemplate = {
      id: `rt-${Date.now()}`,
      dayOfWeek: newTemplate.dayOfWeek as RecurringTemplate["dayOfWeek"],
      platform: newTemplate.platform as RecurringTemplate["platform"],
      type: (newTemplate.type || "post") as RecurringTemplate["type"],
      defaultTitle: newTemplate.defaultTitle,
      defaultTags: newTemplate.defaultTags,
      isActive: true,
    };
    onChange([...templates, template]);
    setNewTemplate(DEFAULT_TEMPLATE);
    toast.success("قالب تکرارشونده اضافه شد");
  };

  const toggleTemplate = (id: string, active: boolean) => {
    onChange(templates.map((t) => (t.id === id ? { ...t, isActive: active } : t)));
  };

  const deleteTemplate = (id: string) => {
    onChange(templates.filter((t) => t.id !== id));
    toast.success("قالب حذف شد");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-1.5"
        >
          <RepeatIcon className="w-3.5 h-3.5" />
          قالب‌های تکرارشونده
          {templates.filter((t) => t.isActive).length > 0 && (
            <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-0 text-[10px] h-4 px-1">
              {templates.filter((t) => t.isActive).length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full sm:w-[420px] bg-background/95 backdrop-blur-2xl border-l border-white/10"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-right flex items-center gap-2 justify-end">
            <span>قالب‌های تکرارشونده</span>
            <RepeatIcon className="w-5 h-5 text-violet-400" />
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Existing templates */}
          {templates.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground text-right block">قالب‌های فعال</Label>
              {templates.map((t) => {
                const platform = PLATFORMS.find((p) => p.id === t.platform);
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      t.isActive
                        ? "bg-violet-500/10 border-violet-500/20"
                        : "bg-white/3 border-white/10 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteTemplate(t.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Switch
                        checked={t.isActive}
                        onCheckedChange={(v) => toggleTemplate(t.id, v)}
                      />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end mb-0.5">
                        {platform && (
                          <platform.Icon className={cn("w-3.5 h-3.5", platform.color)} />
                        )}
                        <span className="text-sm font-bold">
                          {t.defaultTitle || `${platform?.label} ${JALALI_DAY_NAMES[t.dayOfWeek]}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        هر {JALALI_DAY_NAMES[t.dayOfWeek]} · {platform?.label} · {t.type}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new template */}
          <div className="space-y-4 p-4 rounded-xl bg-white/3 border border-white/10">
            <Label className="text-xs font-bold text-right block">افزودن قالب جدید</Label>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">روز هفته</Label>
              <Select
                value={String(newTemplate.dayOfWeek ?? 5)}
                onValueChange={(v) => setNewTemplate({ ...newTemplate, dayOfWeek: parseInt(v) as RecurringTemplate["dayOfWeek"] })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JALALI_DAY_NAMES.map((day, i) => (
                    <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">نوع محتوا</Label>
                <Select
                  value={newTemplate.type || "reel"}
                  onValueChange={(v: any) => setNewTemplate({ ...newTemplate, type: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">پلتفرم</Label>
                <Select
                  value={newTemplate.platform || "instagram"}
                  onValueChange={(v: any) => setNewTemplate({ ...newTemplate, platform: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <p.Icon className={cn("w-3.5 h-3.5", p.color)} />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">عنوان پیش‌فرض (اختیاری)</Label>
              <Input
                value={newTemplate.defaultTitle || ""}
                onChange={(e) => setNewTemplate({ ...newTemplate, defaultTitle: e.target.value })}
                placeholder="مثلاً: پست انگیزشی جمعه"
                className="bg-white/5 border-white/10 text-right"
              />
            </div>

            <Button
              onClick={addTemplate}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 border-0"
            >
              <Plus className="w-4 h-4 ml-2" />
              افزودن قالب
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
