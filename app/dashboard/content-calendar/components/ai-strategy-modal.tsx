"use client";

import { useState } from "react";
import { ContentPost, BusinessPlan } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2 } from "lucide-react";
import { PLATFORMS } from "./constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AIStrategyModalProps {
  plan: BusinessPlan;
  onEventsGenerated: (events: ContentPost[]) => void;
}

const GOALS = [
  {
    id: "growth" as const,
    label: "رشد سریع",
    sublabel: "محتوای وایرال و جذب فالوور",
    emoji: "🚀",
    color: "border-green-500/50 bg-green-500/10 text-green-300",
    activeColor: "border-green-500 bg-green-500/20 shadow-green-500/20",
  },
  {
    id: "sales" as const,
    label: "فروش و تبدیل",
    sublabel: "محصول، اعتمادسازی، CTA قوی",
    emoji: "💰",
    color: "border-blue-500/50 bg-blue-500/10 text-blue-300",
    activeColor: "border-blue-500 bg-blue-500/20 shadow-blue-500/20",
  },
  {
    id: "trust" as const,
    label: "اعتمادسازی",
    sublabel: "پشت‌صحنه، آموزش، داستان برند",
    emoji: "🤝",
    color: "border-purple-500/50 bg-purple-500/10 text-purple-300",
    activeColor: "border-purple-500 bg-purple-500/20 shadow-purple-500/20",
  },
];

export function AIStrategyModal({ plan, onEventsGenerated }: AIStrategyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [goal, setGoal] = useState<"growth" | "sales" | "trust">("growth");
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);

  const togglePlatform = (pid: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  };

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("حداقل یک پلتفرم انتخاب کنید");
      return;
    }
    setIsLoading(true);

    const goalDescriptions = {
      growth: "Focus on viral trends, high-energy hooks, and shareable content. Goal: Reach new audiences.",
      sales: "Focus on product benefits, social proof, testimonials, and clear CTAs. Goal: Conversion.",
      trust: "Focus on behind-the-scenes, educational value, and personal stories. Goal: Deepen connection.",
    };

    const prompt = `Generate a ${durationWeeks}-week content calendar for a Persian content creator.

strategy Goal: ${goal}
Project: ${plan.projectName}
Niche: ${plan.brandCanvas?.niche || "General"}
Platforms to use: ${selectedPlatforms.join(", ")}

Rules:
- Distribute content across all selected platforms evenly
- Each "title" should be descriptive and action-oriented in PERSIAN (not just a keyword)
- Each "notes" should be 2 sentences explaining WHY and HOW to create it in simple Persian
- Include practical tips for beginners in the notes
- Tags should be Persian content topic labels (e.g., آموزشی, ترند, فروش, پشت‌صحنه)

Return ONLY a valid JSON array:
[
  {
    "title": "عنوان کامل فارسی",
    "platform": "${selectedPlatforms.join(" | ")}",
    "type": "post | reel | story | video | thread | short | episode | article",
    "dayOffset": 1,
    "notes": "توضیح حداقل ۲ جمله به فارسی",
    "tags": ["تگ۱", "تگ۲"],
    "priority": "high"
  }
]`;

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON. No markdown." }),
      });

      if (response.status === 429) {
        toast.error("محدودیت استفاده. لطفاً بعداً دوباره امتحان کنید.");
        return;
      }

      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed)) {
          const newEvents: ContentPost[] = parsed.map((item: any) => {
            const d = new Date();
            d.setDate(d.getDate() + (item.dayOffset || 1));
            return {
              id: `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              title: item.title,
              date: d.toISOString(),
              platform: item.platform || "instagram",
              type: item.type || "post",
              status: "idea",
              notes: item.notes || "",
              tags: item.tags || [],
              priority: item.priority || "medium",
            };
          });
          onEventsGenerated(newEvents);
          setIsOpen(false);
          toast.success(`${newEvents.length} ایده استراتژیک اضافه شد! 🚀`);
        }
      }
    } catch {
      toast.error("خطا در تولید استراتژی. لطفاً دوباره امتحان کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={isLoading}
          data-tour-id="ai-strategy-btn"
          className="bg-gradient-to-r from-pink-600 to-violet-600 border-0 shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          ) : (
            <Sparkles className="w-4 h-4 ml-2" />
          )}
          استراتژی با کارنکس AI
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-2xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2 justify-end">
            <span>ساخت استراتژی محتوا با AI</span>
            <Sparkles className="w-5 h-5 text-pink-400" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Goal Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground text-right block">هدف استراتژی شما</Label>
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border text-right transition-all",
                    goal === g.id
                      ? `${g.activeColor} shadow-lg border-2`
                      : `${g.color} hover:opacity-80`
                  )}
                >
                  <span className="text-2xl shrink-0">{g.emoji}</span>
                  <div>
                    <div className="font-bold text-sm">{g.label}</div>
                    <div className="text-xs opacity-70">{g.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-white/10">
                {durationWeeks} هفته
              </Badge>
              <Label className="text-xs text-muted-foreground">مدت برنامه‌ریزی</Label>
            </div>
            <Slider
              value={[durationWeeks]}
              onValueChange={([v]) => setDurationWeeks(v)}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>۱ هفته</span>
              <span>۲ هفته</span>
              <span>۳ هفته</span>
              <span>۴ هفته</span>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground text-right block">پلتفرم‌های هدف</Label>
            <div className="flex flex-wrap gap-2 justify-end">
              {PLATFORMS.map((p) => {
                const isActive = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all",
                      isActive
                        ? `${p.chipClass} scale-105 shadow-sm`
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    <p.Icon className="w-3.5 h-3.5" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || selectedPlatforms.length === 0}
            className="w-full bg-gradient-to-r from-pink-600 to-violet-600 border-0 shadow-lg h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                در حال ساخت برنامه...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 ml-2" />
                شروع تولید برنامه {durationWeeks}-هفته‌ای
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
