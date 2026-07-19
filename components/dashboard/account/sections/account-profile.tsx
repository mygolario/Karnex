"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AccountSectionHeader, SettingsCard, ProfileAvatar } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { JalaliDatePicker } from "@/components/ui/date-picker";
import { Camera, CheckCircle2, Loader2, MapPin, Youtube, Instagram, Send, Globe } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";

export function AccountProfile({ bundle, refresh }: AccountSectionProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: bundle.account.firstName || "",
    lastName: bundle.account.lastName || "",
    phoneNumber: bundle.account.phoneNumber || "",
    birthDate: bundle.account.birthDate ? bundle.account.birthDate.slice(0, 10) : "",
    bio: bundle.account.bio || "",
  });
  const [links, setLinks] = useState({
    youtube: bundle.profile?.channelLinks?.youtube || "",
    instagram: bundle.profile?.channelLinks?.instagram || "",
    telegram: bundle.profile?.channelLinks?.telegram || "",
    website: bundle.profile?.channelLinks?.website || "",
  });
  const [extra, setExtra] = useState({
    location: bundle.profile?.location || "",
    niche: bundle.profile?.niche || "",
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیشتر از ۲ مگابایت باشد");
      return;
    }
    const t = toast.loading("در حال آپلود تصویر...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        await refresh();
        toast.dismiss(t);
        toast.success("تصویر پروفایل به‌روزرسانی شد");
      } catch {
        toast.dismiss(t);
        toast.error("خطا در آپلود تصویر");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const birthDate = form.birthDate ? new Date(form.birthDate) : null;
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          name: fullName,
          phoneNumber: form.phoneNumber,
          bio: form.bio,
          birthDate: birthDate ? birthDate.toISOString() : null,
          profileData: {
            channelLinks: links,
            location: extra.location,
            niche: extra.niche,
          },
        }),
      });
      await refresh();
      toast.success("پروفایل ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره تغییرات");
    } finally {
      setSaving(false);
    }
  };

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.email || "کاربر کارنکس";

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="پروفایل"
        subtitle="هویت شما در کارنکس — اطلاعات شخصی، کانال‌های سازنده و تصویر پروفایل."
        icon={Camera}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live preview */}
        <SettingsCard className="lg:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById("avatar-upload")?.click()}>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <ProfileAvatar name={displayName} src={bundle.account.image} size={120} />
              <div className="absolute inset-0 rounded-[1.75rem] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                <Camera size={28} className="text-white" />
              </div>
            </div>
            <div>
              <div className="font-black text-foreground text-lg">{displayName}</div>
              <div className="text-xs text-muted-foreground" dir="ltr">{bundle.account.email}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 px-4 py-2 rounded-xl bg-muted/40 w-full">
              این تصویر و نام در سراسر کارنکس و در همکاری‌های پروژه نمایش داده می‌شود.
            </div>
          </div>
        </SettingsCard>

        {/* Personal info */}
        <SettingsCard title="اطلاعات شخصی" className="lg:col-span-2" accent="primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>نام کوچک</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="نام" />
            </div>
            <div className="space-y-1.5">
              <Label>نام خانوادگی</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="نام خانوادگی" />
            </div>
            <div className="space-y-1.5">
              <Label>شماره تماس</Label>
              <Input value={form.phoneNumber} dir="ltr" onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="0912..." />
            </div>
            <div className="space-y-1.5">
              <Label>تاریخ تولد</Label>
              <JalaliDatePicker value={form.birthDate} onChange={(d) => setForm({ ...form, birthDate: d })} placeholder="تاریخ تولد" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>درباره من</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="مختصری درباره تخصص‌ها و علایق خود..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
        </SettingsCard>

        {/* Social / web links */}
        <SettingsCard title="لینک‌ها" description="شبکه‌های اجتماعی و وب‌سایت (اختیاری)." icon={Youtube} className="lg:col-span-2" accent="amber">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Youtube size={14} /> یوتیوب</Label>
              <Input value={links.youtube} dir="ltr" onChange={(e) => setLinks({ ...links, youtube: e.target.value })} placeholder="https://youtube.com/@channel" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Instagram size={14} /> اینستاگرام</Label>
              <Input value={links.instagram} dir="ltr" onChange={(e) => setLinks({ ...links, instagram: e.target.value })} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Send size={14} /> تلگرام</Label>
              <Input value={links.telegram} dir="ltr" onChange={(e) => setLinks({ ...links, telegram: e.target.value })} placeholder="https://t.me/..." />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Globe size={14} /> وب‌سایت</Label>
              <Input value={links.website} dir="ltr" onChange={(e) => setLinks({ ...links, website: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        </SettingsCard>

        {/* Extra */}
        <SettingsCard title="اطلاعات تکمیلی" icon={MapPin} accent="emerald">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>شهر / موقعیت</Label>
              <Input value={extra.location} onChange={(e) => setExtra({ ...extra, location: e.target.value })} placeholder="مثلاً تهران" />
            </div>
            <div className="space-y-1.5">
              <Label>حوزه فعالیت</Label>
              <Input value={extra.niche} onChange={(e) => setExtra({ ...extra, niche: e.target.value })} placeholder="مثلاً تکنولوژی، آشپزی، آموزش..." />
            </div>
          </div>
        </SettingsCard>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={saving} className="rounded-xl px-8 shadow-lg shadow-primary/25">
          {saving ? <Loader2 className="animate-spin me-2" /> : <CheckCircle2 size={18} className="me-2" />}
          ذخیره تغییرات
        </Button>
      </div>
    </div>
  );
}
