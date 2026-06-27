"use client";

import { useState } from "react";
import { AccountSectionHeader, SettingsCard } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, Youtube, Calendar, Instagram, Send, Zap, Key, Copy, Trash2, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";

const PROVIDERS = [
  { id: "youtube", label: "یوتیوب", icon: Youtube, color: "from-red-500 to-rose-600", desc: "اتصال کانال برای تحلیل و خط تولید محتوا" },
  { id: "google_calendar", label: "گوگل کلندر", icon: Calendar, color: "from-blue-500 to-cyan-600", desc: "هماهنگ‌سازی نقشه راه و پست‌ها" },
  { id: "instagram", label: "اینستاگرام", icon: Instagram, color: "from-pink-500 to-purple-600", desc: "آمار مخاطب برای تعرفه و مدیا کیت" },
  { id: "telegram", label: "تلگرام", icon: Send, color: "from-sky-500 to-blue-600", desc: "اتصال کانال و ربات مشتری" },
  { id: "zapier", label: "Zapier", icon: Zap, color: "from-orange-500 to-amber-600", desc: "اتصال به هزاران اپ دیگر" },
];

export function AccountIntegrations({ bundle, refresh }: AccountSectionProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const connected = new Map(bundle.integrations.map((i) => [i.provider, i]));

  const connect = async (provider: string) => {
    setConnecting(provider);
    try {
      // NOTE: real OAuth flow would redirect here. We simulate a connection.
      await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, metadata: { connectedAt: new Date().toISOString() } }),
      });
      await refresh();
      toast.success("اتصال برقرار شد");
    } catch {
      toast.error("خطا در اتصال");
    } finally {
      setConnecting(null);
    }
  };

  const disconnect = async (provider: string) => {
    if (!confirm("اتصال قطع شود؟")) return;
    await fetch(`/api/user/integrations?provider=${provider}`, { method: "DELETE" });
    await refresh();
    toast.success("اتصال قطع شد");
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="یکپارچه‌سازی‌ها"
        subtitle="کارنکس را به سرویس‌های بیرونی متصل کنید تا داده‌ها هماهنگ بمانند."
        icon={Plug}
        accent="emerald"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDERS.map((p) => {
          const conn = connected.get(p.id);
          return (
            <SettingsCard key={p.id} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                <p.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{p.label}</span>
                  {conn?.isConnected && <Badge variant="success" size="sm" dot>متصل</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.desc}</p>
              </div>
              {conn?.isConnected ? (
                <Button variant="outline" size="sm" onClick={() => disconnect(p.id)} className="text-destructive hover:text-destructive">
                  قطع
                </Button>
              ) : (
                <Button size="sm" onClick={() => connect(p.id)} disabled={connecting === p.id}>
                  {connecting === p.id ? "..." : "اتصال"}
                </Button>
              )}
            </SettingsCard>
          );
        })}
      </div>

      {/* API Keys */}
      <ApiKeysSection bundle={bundle} refresh={refresh} />
    </div>
  );
}

function ApiKeysSection({ bundle, refresh }: AccountSectionProps) {
  const [label, setLabel] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!label.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      setCreated(data.key);
      setLabel("");
      await refresh();
      toast.success("کلید ساخته شد — فقط یکبار نمایش داده می‌شود");
    } catch {
      toast.error("خطا در ساخت کلید");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("کلید باطل شود؟")) return;
    await fetch(`/api/user/api-keys?id=${id}`, { method: "DELETE" });
    await refresh();
    toast.success("کلید باطل شد");
  };

  return (
    <SettingsCard title="کلیدهای API" description="برای دسترسی برنامه‌ای به کارنکس (طرح‌های Pro و Ultra)." icon={Key} accent="emerald">
      {created && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2">
            <CheckCircle2 size={16} /> کلید جدید — فقط یکبار نمایش داده می‌شود
          </div>
          <div className="flex items-center gap-2">
            <code dir="ltr" className="flex-1 bg-background px-3 py-2 rounded-lg text-xs font-mono break-all">{created}</code>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(created); toast.success("کپی شد"); }}>
              <Copy size={14} />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="نام کلید (مثلاً Build Script)"
          className="flex-1 h-10 px-3 rounded-xl bg-background border border-border text-sm"
        />
        <Button onClick={create} disabled={creating || !label.trim()}>
          <Plus size={16} className="me-1" /> ساخت کلید
        </Button>
      </div>

      {bundle.apiKeys?.length ? (
        <div className="divide-y divide-border/40">
          {bundle.apiKeys.map((k) => (
            <div key={k.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-bold text-sm">{k.label}</div>
                <code dir="ltr" className="text-xs text-muted-foreground font-mono">{k.prefix}••••••••</code>
              </div>
              <Button variant="ghost" size="sm" onClick={() => revoke(k.id)} className="text-destructive hover:text-destructive">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">هنوز کلیدی نساخته‌اید.</p>
      )}
    </SettingsCard>
  );
}
