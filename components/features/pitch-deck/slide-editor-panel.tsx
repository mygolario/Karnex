"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { PitchDeckSlide } from "@/lib/db";
import {
  SLIDE_TYPE_OPTIONS,
  PRIMARY_THEME_KEYS,
  SlideThemes,
  convertPersianArabicDigits,
} from "@/lib/pitch-deck";

interface SlideEditorPanelProps {
  slide: PitchDeckSlide;
  slides: PitchDeckSlide[];
  onUpdateField: (field: keyof PitchDeckSlide, value: unknown) => void;
  onUpdateMetadata: (key: string, value: unknown) => void;
  onApplyThemeToAll: (theme: string) => void;
}

export function SlideEditorPanel({
  slide,
  onUpdateField,
  onUpdateMetadata,
  onApplyThemeToAll,
}: SlideEditorPanelProps) {
  const addArrayItem = (arrayName: string, defaultValue: unknown) => {
    const list = [...(slide.metadata?.[arrayName] || [])];
    list.push(defaultValue);
    onUpdateMetadata(arrayName, list);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2" dir="rtl">
      <Card className="flex flex-col space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-primary">
            عنوان اسلاید
          </label>
          <Input
            value={slide.title || ""}
            onChange={(e) => onUpdateField("title", e.target.value)}
            className="rounded-xl text-lg font-bold"
            placeholder="عنوان را بنویسید..."
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-primary">
            نکات کلیدی
          </label>
          <div className="max-h-[160px] space-y-2 overflow-y-auto pe-1">
            {(slide.bullets || []).map((bullet, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 font-mono text-xs text-muted-foreground">{i + 1}</span>
                <Input
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...(slide.bullets || [])];
                    newBullets[i] = e.target.value;
                    onUpdateField("bullets", newBullets);
                  }}
                  className="h-9 flex-1 rounded-xl text-xs"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateField(
                      "bullets",
                      (slide.bullets || []).filter((_, idx) => idx !== i)
                    );
                  }}
                  className="p-1 text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => onUpdateField("bullets", [...(slide.bullets || []), ""])}
            className="mt-2 h-9 w-full rounded-xl border border-dashed border-border text-xs"
          >
            <Plus size={12} className="ms-1" /> افزودن نکته
          </Button>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-primary">
            یادداشت سخنران
          </label>
          <Textarea
            value={slide.notes || ""}
            onChange={(e) => onUpdateField("notes", e.target.value)}
            placeholder="نکاتی که هنگام ارائه می‌گویید..."
            className="min-h-[80px] resize-none rounded-xl text-xs"
            dir="rtl"
          />
        </div>
      </Card>

      <Card className="flex flex-col space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5">
        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-primary">
            نوع اسلاید
          </label>
          <select
            value={slide.type || "generic"}
            onChange={(e) => onUpdateField("type", e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
          >
            {SLIDE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-primary">
            پوسته اسلاید
          </label>
          <div className="flex gap-2">
            <select
              value={slide.metadata?.theme || "karnex_pink"}
              onChange={(e) => onUpdateMetadata("theme", e.target.value)}
              className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-xs"
            >
              {PRIMARY_THEME_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SlideThemes[key].label}
                </option>
              ))}
              <option value="midnight_cyan">Midnight Cyan (قدیمی)</option>
              <option value="amethyst_glow">Amethyst Glow (قدیمی)</option>
              <option value="sleek_slate">Sleek Slate (قدیمی)</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onApplyThemeToAll(slide.metadata?.theme || "karnex_pink")
              }
              className="h-10 shrink-0 rounded-xl text-xs"
            >
              اعمال به همه
            </Button>
          </div>
        </div>

        <div className="max-h-[220px] flex-1 space-y-3 overflow-y-auto pe-1 text-xs">
          {(slide.type === "market" || slide.type === "market_size") && (
            <MarketFields slide={slide} onUpdateMetadata={onUpdateMetadata} />
          )}
          {slide.type === "ask" && (
            <AskFields
              slide={slide}
              onUpdateMetadata={onUpdateMetadata}
              addArrayItem={addArrayItem}
            />
          )}
          {slide.type === "business_model" && (
            <ArrayFields
              title="جریان‌های درآمدی"
              items={slide.metadata?.models || []}
              fields={[
                { key: "title", placeholder: "عنوان" },
                { key: "desc", placeholder: "توضیح", flex: 2 },
              ]}
              onChange={(models) => onUpdateMetadata("models", models)}
              onAdd={() =>
                addArrayItem("models", { title: "مدل جدید", desc: "نحوه کسب درآمد" })
              }
            />
          )}
          {slide.type === "competition" && (
            <ArrayFields
              title="رقبای کلیدی"
              items={slide.metadata?.competitors || []}
              fields={[
                { key: "name", placeholder: "رقیب" },
                { key: "strength", placeholder: "قوت" },
                { key: "weakness", placeholder: "ضعف" },
              ]}
              onChange={(competitors) => onUpdateMetadata("competitors", competitors)}
              onAdd={() =>
                addArrayItem("competitors", {
                  name: "نام رقیب",
                  strength: "مزیت",
                  weakness: "شکاف",
                })
              }
            />
          )}
          {slide.type === "roadmap" && (
            <ArrayFields
              title="نقشه راه زمانی"
              items={slide.metadata?.phases || []}
              fields={[
                { key: "phase", placeholder: "فاز" },
                { key: "title", placeholder: "هدف", flex: 2 },
                { key: "date", placeholder: "تاریخ" },
              ]}
              onChange={(phases) => onUpdateMetadata("phases", phases)}
              onAdd={() =>
                addArrayItem("phases", {
                  phase: "فاز جدید",
                  title: "عنوان دستاورد",
                  date: "زمان",
                })
              }
            />
          )}
          {slide.type === "team" && (
            <ArrayFields
              title="معرفی اعضا"
              items={slide.metadata?.team || slide.metadata?.members || []}
              fields={[
                { key: "name", placeholder: "نام" },
                { key: "role", placeholder: "سمت" },
              ]}
              onChange={(team) => onUpdateMetadata("team", team)}
              onAdd={() =>
                addArrayItem("team", { name: "عضو جدید", role: "نقش او" })
              }
            />
          )}
          {slide.type === "traction" && (
            <ArrayFields
              title="شاخص‌های تراکشن"
              items={slide.metadata?.metrics || []}
              fields={[
                { key: "value", placeholder: "مقدار" },
                { key: "label", placeholder: "عنوان" },
                { key: "note", placeholder: "توضیح" },
              ]}
              onChange={(metrics) => onUpdateMetadata("metrics", metrics)}
              onAdd={() =>
                addArrayItem("metrics", {
                  value: "۰",
                  label: "کاربران فعال",
                  note: "",
                })
              }
            />
          )}
          {["title", "problem", "solution", "generic"].includes(slide.type || "") && (
            <p className="py-6 text-center text-muted-foreground">
              این نوع اسلاید فیلد ساختاری خاصی ندارد. عنوان و نکات را از پنل سمت راست ویرایش کنید.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function MarketFields({
  slide,
  onUpdateMetadata,
}: {
  slide: PitchDeckSlide;
  onUpdateMetadata: (key: string, value: unknown) => void;
}) {
  const numOrKeep = (val: string) => {
    const cleaned = convertPersianArabicDigits(val).replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? val : parsed;
  };

  return (
    <div className="space-y-2">
      <span className="mb-1 block text-[10px] font-bold text-muted-foreground">
        اندازه بازار:
      </span>
      <div className="grid grid-cols-3 gap-2">
        {(["tam", "sam", "som"] as const).map((key) => (
          <Input
            key={key}
            placeholder={key.toUpperCase()}
            value={slide.metadata?.[key] ?? ""}
            onChange={(e) => onUpdateMetadata(key, numOrKeep(e.target.value))}
            className="h-8 rounded-lg text-xs"
          />
        ))}
      </div>
      {(["tamDesc", "samDesc", "somDesc"] as const).map((key) => (
        <Input
          key={key}
          placeholder={`توضیح ${key.replace("Desc", "").toUpperCase()}`}
          value={slide.metadata?.[key] || ""}
          onChange={(e) => onUpdateMetadata(key, e.target.value)}
          className="mt-1 h-8 rounded-lg text-xs"
        />
      ))}
    </div>
  );
}

function AskFields({
  slide,
  onUpdateMetadata,
  addArrayItem,
}: {
  slide: PitchDeckSlide;
  onUpdateMetadata: (key: string, value: unknown) => void;
  addArrayItem: (name: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-2">
      <Input
        placeholder="مبلغ درخواستی"
        value={slide.metadata?.amount || ""}
        onChange={(e) => onUpdateMetadata("amount", e.target.value)}
        className="h-8 rounded-lg text-xs"
      />
      <Input
        placeholder="مدت بقای مالی (Runway)"
        value={slide.metadata?.runway || ""}
        onChange={(e) => onUpdateMetadata("runway", e.target.value)}
        className="h-8 rounded-lg text-xs"
      />
      <Input
        placeholder="محل مصرف بودجه"
        value={slide.metadata?.use || ""}
        onChange={(e) => onUpdateMetadata("use", e.target.value)}
        className="h-8 rounded-lg text-xs"
      />
      <ArrayFields
        title="تخصیص بودجه"
        items={slide.metadata?.budget || []}
        fields={[
          { key: "category", placeholder: "دسته", flex: 2 },
          { key: "percentage", placeholder: "درصد" },
        ]}
        onChange={(budget) => onUpdateMetadata("budget", budget)}
        onAdd={() =>
          addArrayItem("budget", { category: "دسته جدید", amount: 0, percentage: 0 })
        }
      />
    </div>
  );
}

function ArrayFields({
  title,
  items,
  fields,
  onChange,
  onAdd,
}: {
  title: string;
  items: Record<string, unknown>[];
  fields: { key: string; placeholder: string; flex?: number }[];
  onChange: (items: Record<string, unknown>[]) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground">{title}:</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-primary"
          onClick={onAdd}
        >
          <Plus size={12} />
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="mb-1 flex items-center gap-1">
          {fields.map((f) => (
            <Input
              key={f.key}
              placeholder={f.placeholder}
              value={(item[f.key] as string | number | undefined) ?? ""}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], [f.key]: e.target.value };
                onChange(next);
              }}
              className="h-7 rounded-lg text-[10px]"
              style={{ flex: f.flex ?? 1 }}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="text-muted-foreground hover:text-rose-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
