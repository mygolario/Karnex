"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowUp, ArrowDown, Film, Mic } from "lucide-react";

type Scene = {
  id: string;
  visual: string;
  audio: string;
};

interface AudioVideoScriptProps {
  scenes: Scene[];
  onChange: (scenes: Scene[]) => void;
}

export function AudioVideoScript({ scenes, onChange }: AudioVideoScriptProps) {
  const updateScene = (id: string, field: "visual" | "audio", value: string) => {
    const updated = scenes.map((scene) =>
      scene.id === id ? { ...scene, [field]: value } : scene
    );
    onChange(updated);
  };

  const addScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      visual: "",
      audio: "",
    };
    onChange([...scenes, newScene]);
  };

  const deleteScene = (id: string) => {
    if (scenes.length <= 1) return;
    const updated = scenes.filter((scene) => scene.id !== id);
    onChange(updated);
  };

  const moveScene = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;
    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          <Film className="text-red-500 w-5 h-5" />
          <span className="text-sm font-bold">حالت دوقابله کارگردان (A/V Mode)</span>
        </div>
        <Button size="sm" onClick={addScene} className="gap-1 bg-red-600 hover:bg-red-700 text-white">
          <Plus size={14} />
          افزودن سکانس
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card divide-y">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-muted/50 p-3 text-xs font-bold text-muted-foreground gap-4">
          <div className="col-span-1 text-center">ترتیب</div>
          <div className="col-span-5 flex items-center gap-1.5">
            <Film size={14} />
            بخش بصری (تصویر / B-Roll)
          </div>
          <div className="col-span-5 flex items-center gap-1.5">
            <Mic size={14} />
            بخش صوتی (دیالوگ / گوینده)
          </div>
          <div className="col-span-1 text-center">عملیات</div>
        </div>

        {/* Table Body */}
        {scenes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            هیچ سکانسی ثبت نشده است. روی دکمه افزودن سکانس کلیک کنید.
          </div>
        ) : (
          scenes.map((scene, index) => (
            <div key={scene.id} className="grid grid-cols-12 p-3 gap-4 items-start hover:bg-muted/10 transition-colors">
              {/* Reordering Controls */}
              <div className="col-span-1 flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => moveScene(index, "up")}
                >
                  <ArrowUp size={14} />
                </Button>
                <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded-full">
                  {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === scenes.length - 1}
                  onClick={() => moveScene(index, "down")}
                >
                  <ArrowDown size={14} />
                </Button>
              </div>

              {/* Visual Description */}
              <div className="col-span-5">
                <Textarea
                  placeholder="مثال: [نمای بسته از محصول با نورپردازی ملایم]"
                  className="min-h-[80px] bg-background/40 border-slate-200 focus-visible:ring-red-500 font-sans text-sm resize-none"
                  value={scene.visual}
                  onChange={(e) => updateScene(scene.id, "visual", e.target.value)}
                  dir="rtl"
                />
              </div>

              {/* Audio / Voiceover */}
              <div className="col-span-5">
                <Textarea
                  placeholder="مثال: این محصول جدیدیه که می‌تونه زندگی فریلنسرها رو متحول کنه..."
                  className="min-h-[80px] bg-background/40 border-slate-200 focus-visible:ring-red-500 font-sans text-sm resize-none"
                  value={scene.audio}
                  onChange={(e) => updateScene(scene.id, "audio", e.target.value)}
                  dir="rtl"
                />
              </div>

              {/* Action Operations */}
              <div className="col-span-1 flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  disabled={scenes.length <= 1}
                  onClick={() => deleteScene(scene.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
