"use client";

import { useState } from "react";
import { ContentPost, HashtagSet } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2, Save, Sparkles, Loader2, Link2, Plus, X,
  Hash, Image, Users, FileText, Zap, Copy, CheckCheck,
  ArrowUp, ArrowRight, ArrowDown,
} from "lucide-react";
import { PLATFORMS, CONTENT_TYPES, STATUSES } from "./constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useProject } from "@/contexts/project-context";

interface PostPanelProps {
  isOpen: boolean;
  onClose: () => void;
  event: ContentPost | null;
  formData: Partial<ContentPost>;
  onFormChange: (data: Partial<ContentPost>) => void;
  onSave: () => void;
  onDelete: () => void;
  hashtagBank: HashtagSet[];
  onUpdateHashtagBank: (bank: HashtagSet[]) => void;
  projectNiche?: string;
}

// ── AI Helper Hook (calls API) ─────────────────────────────────────────────
function useAIAction(activeProject?: Record<string, unknown>) {
  const [loading, setLoading] = useState(false);
  const call = async (
    requestType: string,
    context: string,
    requestInstructions: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "content-brief",
          requestType,
          context,
          requestInstructions,
          activeProject,
        }),
      });
      const data = await res.json();
      if (data.success && data.result?.content) return data.result.content;
      return data.success ? data.content : null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };
  return { loading, call };
}

// ── Checklist Section ──────────────────────────────────────────────────────
function ChecklistSection({
  checklist,
  onChange,
}: {
  checklist: ContentPost["checklist"];
  onChange: (c: ContentPost["checklist"]) => void;
}) {
  const items: { key: keyof NonNullable<ContentPost["checklist"]>; label: string }[] = [
    { key: "script", label: "سناریو نوشته شد" },
    { key: "filmed", label: "ضبط انجام شد" },
    { key: "edited", label: "تدوین تمام شد" },
    { key: "captionReady", label: "کپشن آماده است" },
    { key: "hashtagsReady", label: "هشتگ‌ها آماده‌اند" },
    { key: "thumbnailReady", label: "تامبنیل / کاور آماده است" },
  ];

  const defaultChecklist: NonNullable<ContentPost["checklist"]> = {
    script: false,
    filmed: false,
    edited: false,
    captionReady: false,
    hashtagsReady: false,
    thumbnailReady: false,
  };

  const current = checklist || defaultChecklist;
  const done = Object.values(current).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{done}/{items.length} کامل شده</span>
        <div className="flex-1 mx-3 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {items.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2.5 group">
            <Checkbox
              id={key}
              checked={current[key]}
              onCheckedChange={(checked) =>
                onChange({ ...current, [key]: !!checked })
              }
              className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
            <label
              htmlFor={key}
              className={cn(
                "text-sm cursor-pointer transition-all",
                current[key] ? "line-through text-muted-foreground" : "text-foreground"
              )}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hashtag Bank Section ───────────────────────────────────────────────────
function HashtagBankSection({
  bank,
  activeHashtags,
  onUpdateBank,
  onApplySet,
}: {
  bank: HashtagSet[];
  activeHashtags: string[];
  onUpdateBank: (bank: HashtagSet[]) => void;
  onApplySet: (tags: string[]) => void;
}) {
  const [newSetName, setNewSetName] = useState("");
  const [copied, setCopied] = useState(false);

  const copyHashtags = () => {
    const text = activeHashtags.map((t) => `#${t}`).join(" ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCurrentAsSet = () => {
    if (!newSetName || activeHashtags.length === 0) return;
    const newSet: HashtagSet = {
      id: `hs-${Date.now()}`,
      name: newSetName,
      tags: activeHashtags,
    };
    onUpdateBank([...bank, newSet]);
    setNewSetName("");
    toast.success("ست هشتگ ذخیره شد");
  };

  return (
    <div className="space-y-4">
      {/* Active hashtags for this post */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={copyHashtags} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
            {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "کپی شد!" : "کپی همه"}
          </button>
          <Label className="text-xs">هشتگ‌های این پست</Label>
        </div>
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-white/10 bg-white/3 min-h-[50px] justify-end">
          {(activeHashtags || []).map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
          {(!activeHashtags || activeHashtags.length === 0) && (
            <span className="text-xs text-muted-foreground">هشتگ‌ها از بانک اعمال کنید</span>
          )}
        </div>
      </div>

      {/* Saved sets */}
      {bank.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">ست‌های ذخیره‌شده</Label>
          {bank.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const updated = bank.filter((s) => s.id !== set.id);
                    onUpdateBank(updated);
                  }}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
                <Button size="sm" variant="ghost" onClick={() => onApplySet(set.tags)}
                  className="h-6 text-xs text-violet-400 hover:text-violet-300 px-2">
                  اعمال
                </Button>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium">{set.name}</div>
                <div className="text-[10px] text-muted-foreground">{set.tags.length} هشتگ</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save current as set */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={saveCurrentAsSet}
          className="shrink-0 bg-white/5 border-white/10 hover:bg-white/10 text-xs">
          <Plus className="w-3 h-3 ml-1" />
          ذخیره
        </Button>
        <Input
          value={newSetName}
          onChange={(e) => setNewSetName(e.target.value)}
          placeholder="نام ست جدید..."
          className="text-xs h-8 bg-white/5 border-white/10 text-right"
        />
      </div>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────
export function PostPanel({
  isOpen,
  onClose,
  event,
  formData,
  onFormChange,
  onSave,
  onDelete,
  hashtagBank,
  onUpdateHashtagBank,
  projectNiche,
}: PostPanelProps) {
  const { activeProject } = useProject();
  const aiCaption = useAIAction(activeProject as unknown as Record<string, unknown> | undefined);
  const aiHooks = useAIAction(activeProject as unknown as Record<string, unknown> | undefined);
  const aiHashtags = useAIAction(activeProject as unknown as Record<string, unknown> | undefined);
  const aiRepurpose = useAIAction(activeProject as unknown as Record<string, unknown> | undefined);
  const [hooks, setHooks] = useState<string[]>([]);
  const [repurposeResult, setRepurposeResult] = useState("");

  const isEditing = !!event;

  const generateCaption = async () => {
    if (!formData.title) { toast.error("ابتدا عنوان را وارد کنید"); return; }
    const result = await aiCaption.call(
      "caption",
      formData.title,
      `پلتفرم: ${formData.platform}, نوع: ${formData.type}, نیچ: ${projectNiche || "عمومی"}, یادداشت: ${formData.notes || "ندارد"}`
    );
    if (result) onFormChange({ ...formData, caption: result });
  };

  const generateHooks = async () => {
    if (!formData.title) { toast.error("ابتدا عنوان را وارد کنید"); return; }
    const result = await aiHooks.call(
      "hooks",
      formData.title,
      `پلتفرم: ${formData.platform} — ۳ هوک یک خطی`
    );
    if (result) setHooks(result.split("\n").filter((l: string) => l.trim()).slice(0, 3));
  };

  const generateHashtags = async () => {
    if (!formData.title) { toast.error("ابتدا عنوان را وارد کنید"); return; }
    const result = await aiHashtags.call(
      "hashtags",
      formData.title,
      `پلتفرم: ${formData.platform}, نیچ: ${projectNiche || "عمومی"} — ۲۰ هشتگ`
    );
    if (result) {
      const tags = result.split("\n").map((t: string) => t.trim().replace(/^#/, "")).filter((t: string) => t && !t.includes(" "));
      onFormChange({ ...formData, hashtags: tags });
    }
  };

  const generateRepurpose = async () => {
    if (!formData.title) { toast.error("ابتدا عنوان را وارد کنید"); return; }
    const result = await aiRepurpose.call(
      "repurpose",
      formData.title,
      `پلتفرم اصلی: ${formData.platform} — پیشنهاد برای ۳ پلتفرم`
    );
    if (result) setRepurposeResult(result);
  };

  // Best time to post (rule-based)
  const bestTimes: Record<string, string> = {
    instagram: "۱۸:۳۰ – ۲۱:۰۰",
    youtube: "۱۷:۰۰ – ۲۰:۰۰",
    tiktok: "۱۹:۰۰ – ۲۳:۰۰",
    linkedin: "۰۸:۰۰ – ۱۰:۰۰",
    twitter: "۱۲:۰۰ – ۱۵:۰۰",
    telegram: "۱۹:۰۰ – ۲۱:۰۰",
    blog: "۱۰:۰۰ – ۱۲:۰۰",
    podcast: "۰۷:۰۰ – ۰۹:۰۰",
  };

  const [activeTab, setActiveTab] = useState("details");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-full sm:w-[500px] lg:w-[560px] bg-background/95 backdrop-blur-2xl border-l border-white/10 p-0 overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={onSave}
                size="sm"
                className="bg-gradient-to-r from-pink-600 to-violet-600 border-0 shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"
              >
                <Save className="w-4 h-4 ml-1.5" />
                ذخیره
              </Button>
            </div>
            <SheetTitle className="text-right text-base font-bold">
              {isEditing ? "ویرایش محتوا" : "محتوای جدید"}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 mx-6 mt-4 mb-0 bg-white/5 border border-white/10 p-0.5 rounded-xl shrink-0">
            <TabsTrigger value="details" className="text-xs rounded-lg data-[state=active]:bg-white/10">
              <FileText className="w-3.5 h-3.5 ml-1" />
              جزئیات
            </TabsTrigger>
            <TabsTrigger value="production" className="text-xs rounded-lg data-[state=active]:bg-white/10">
              <CheckCheck className="w-3.5 h-3.5 ml-1" />
              تولید
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs rounded-lg data-[state=active]:bg-white/10">
              <FileText className="w-3.5 h-3.5 ml-1" />
              محتوا
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs rounded-lg data-[state=active]:bg-white/10">
              <Zap className="w-3.5 h-3.5 ml-1" />
              هوش مصنوعی
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Details ─────────────────────────────── */}
          <TabsContent value="details" className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">عنوان محتوا</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
                placeholder="مثلاً: آموزش ساخت ریلز حرفه‌ای در ۵ دقیقه"
                className="bg-white/5 border-white/10 focus:border-violet-500/50 text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">پلتفرم</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v: any) => onFormChange({ ...formData, platform: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <p.Icon className={cn("w-4 h-4", p.color)} />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">نوع محتوا</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: any) => onFormChange({ ...formData, type: v })}
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">وضعیت</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => onFormChange({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">اولویت</Label>
                <Select
                  value={formData.priority || "medium"}
                  onValueChange={(v: any) => onFormChange({ ...formData, priority: v })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <ArrowUp className="w-3.5 h-3.5 text-red-400" />فوری
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />معمولی
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <ArrowDown className="w-3.5 h-3.5 text-slate-400" />کم‌اولویت
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">ساعت انتشار</Label>
                <Input
                  type="time"
                  value={formData.publishTime || ""}
                  onChange={(e) => onFormChange({ ...formData, publishTime: e.target.value })}
                  className="bg-white/5 border-white/10 text-right"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground text-right block">زمان تخمینی (ساعت)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ""}
                  onChange={(e) => onFormChange({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                  placeholder="e.g. 2.5"
                  className="bg-white/5 border-white/10 text-right"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">برچسب‌ها (Tags)</Label>
              <TagInput
                tags={formData.tags || []}
                onChange={(tags) => onFormChange({ ...formData, tags })}
              />
            </div>

            {/* Collaborator */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">همکار / مسئول</Label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  value={formData.collaborator || ""}
                  onChange={(e) => onFormChange({ ...formData, collaborator: e.target.value })}
                  placeholder="نام همکار..."
                  className="bg-white/5 border-white/10 text-right"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">یادداشت‌ها</Label>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
                placeholder="جزئیات، ایده‌ها، منابع..."
                className="bg-white/5 border-white/10 text-right min-h-[80px] resize-none"
              />
            </div>
          </TabsContent>

          {/* ── Tab: Production ──────────────────────────── */}
          <TabsContent value="production" className="flex-1 px-6 py-4 space-y-5 overflow-y-auto">
            <div>
              <Label className="text-xs text-muted-foreground mb-3 text-right block">چک‌لیست تولید</Label>
              <ChecklistSection
                checklist={formData.checklist}
                onChange={(c) => onFormChange({ ...formData, checklist: c })}
              />
            </div>

            {/* Script link */}
            <div className="p-3 rounded-xl bg-white/3 border border-white/10 flex items-center justify-between">
              <Link href="/dashboard/scripts">
                <Button variant="outline" size="sm"
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-xs">
                  <Link2 className="w-3.5 h-3.5 ml-1.5" />
                  باز کردن نویسنده سناریو
                </Button>
              </Link>
              <span className="text-xs font-medium text-right">نوشتن سناریو</span>
            </div>

            {/* Thumbnail */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground text-right block">لینک تامبنیل / کاور</Label>
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  value={formData.thumbnailUrl || ""}
                  onChange={(e) => onFormChange({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-left"
                  dir="ltr"
                />
              </div>
              {formData.thumbnailUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 aspect-video">
                  <img
                    src={formData.thumbnailUrl}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Content ─────────────────────────────── */}
          <TabsContent value="content" className="flex-1 px-6 py-4 space-y-5 overflow-y-auto">
            {/* Caption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateCaption}
                  disabled={aiCaption.loading}
                  className="bg-gradient-to-r from-pink-600/20 to-violet-600/20 border-pink-500/30 hover:from-pink-600/30 text-xs"
                >
                  {aiCaption.loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
                    : <Sparkles className="w-3.5 h-3.5 ml-1 text-pink-400" />}
                  تولید کپشن با AI
                </Button>
                <Label className="text-xs text-muted-foreground">کپشن</Label>
              </div>
              <Textarea
                value={formData.caption || ""}
                onChange={(e) => onFormChange({ ...formData, caption: e.target.value })}
                placeholder="کپشن خود را بنویسید یا با AI بسازید..."
                className="bg-white/5 border-white/10 text-right min-h-[120px] resize-none"
              />
            </div>

            {/* Hooks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateHooks}
                  disabled={aiHooks.loading}
                  className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/30 hover:from-amber-600/30 text-xs"
                >
                  {aiHooks.loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
                    : <Zap className="w-3.5 h-3.5 ml-1 text-amber-400" />}
                  پیشنهاد هوک
                </Button>
                <Label className="text-xs text-muted-foreground">هوک‌های ویروسی</Label>
              </div>
              {hooks.length > 0 && (
                <div className="space-y-2">
                  {hooks.map((hook, i) => (
                    <div
                      key={i}
                      onClick={() => onFormChange({ ...formData, caption: hook + "\n\n" + (formData.caption || "") })}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-right cursor-pointer hover:bg-amber-500/15 transition-colors"
                    >
                      {hook}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hashtag Bank */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground text-right block">بانک هشتگ</Label>
              <HashtagBankSection
                bank={hashtagBank}
                activeHashtags={formData.hashtags || []}
                onUpdateBank={onUpdateHashtagBank}
                onApplySet={(tags) => onFormChange({ ...formData, hashtags: tags })}
              />
            </div>
          </TabsContent>

          {/* ── Tab: AI ──────────────────────────────────── */}
          <TabsContent value="ai" className="flex-1 px-6 py-4 space-y-5 overflow-y-auto">
            {/* Best time */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20">
              <div className="text-right mb-1">
                <span className="text-xs font-bold text-sky-400">بهترین زمان انتشار</span>
              </div>
              <div className="text-2xl font-black text-right text-foreground">
                {bestTimes[formData.platform || "instagram"] || "۱۸:۳۰ – ۲۱:۰۰"}
              </div>
              <p className="text-[11px] text-muted-foreground text-right mt-1">
                برای {PLATFORMS.find((p) => p.id === formData.platform)?.label} بر اساس الگوی مخاطبان ایرانی
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 text-sky-400 text-xs px-0"
                onClick={() => {
                  const best = bestTimes[formData.platform || "instagram"] || "18:30";
                  const time = best.split("–")[0].trim().replace(":", ":").replace("۰", "0").replace("۱", "1").replace("۸", "8").replace("۳", "3");
                  onFormChange({ ...formData, publishTime: "18:30" });
                }}
              >
                اعمال این زمان ←
              </Button>
            </div>

            {/* Hashtag AI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateHashtags}
                  disabled={aiHashtags.loading}
                  className="bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 text-xs"
                >
                  {aiHashtags.loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
                    : <Hash className="w-3.5 h-3.5 ml-1 text-violet-400" />}
                  پیشنهاد هشتگ با AI
                </Button>
                <Label className="text-xs text-muted-foreground">هشتگ‌های هوشمند</Label>
              </div>
              {(formData.hashtags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/3 border border-white/10 justify-end">
                  {formData.hashtags!.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onFormChange({ ...formData, hashtags: formData.hashtags!.filter((t) => t !== tag) })}
                      className="flex items-center gap-1 text-[11px] bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-colors"
                    >
                      #{tag}
                      <X className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Repurpose */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateRepurpose}
                  disabled={aiRepurpose.loading}
                  className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-xs"
                >
                  {aiRepurpose.loading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
                    : <Sparkles className="w-3.5 h-3.5 ml-1 text-emerald-400" />}
                  بازتولید برای پلتفرم‌ها
                </Button>
                <Label className="text-xs text-muted-foreground">Repurpose Engine</Label>
              </div>
              {repurposeResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-right whitespace-pre-wrap leading-relaxed">
                  {repurposeResult}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ── Tag Input Component ─────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-white/10 bg-white/3 min-h-[44px] justify-end">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">
            #{tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={addTag}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-xs shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder="برچسب جدید... (Enter)"
          className="bg-white/5 border-white/10 text-right text-xs h-8"
        />
      </div>
    </div>
  );
}
