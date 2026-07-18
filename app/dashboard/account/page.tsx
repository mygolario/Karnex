"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ACCOUNT_SECTIONS, ACCOUNT_GROUP_LABELS, type AccountSectionId } from "@/components/dashboard/account/sections";
import { ProfileAvatar, PlanBadge } from "@/components/dashboard/account/account-primitives";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { UserSettings, UserProfileData } from "@/lib/account/types";

import { AccountOverview } from "@/components/dashboard/account/sections/account-overview";
import { AccountProfile } from "@/components/dashboard/account/sections/account-profile";
import { AccountAI } from "@/components/dashboard/account/sections/account-ai";
import { AccountBilling } from "@/components/dashboard/account/sections/account-billing";
import { AccountUsage } from "@/components/dashboard/account/sections/account-usage";
import { AccountNotifications } from "@/components/dashboard/account/sections/account-notifications";
import { AccountPreferences } from "@/components/dashboard/account/sections/account-preferences";
import { AccountIntegrations } from "@/components/dashboard/account/sections/account-integrations";
import { AccountSecurity } from "@/components/dashboard/account/sections/account-security";
import { AccountData } from "@/components/dashboard/account/sections/account-data";
import { AccountDanger } from "@/components/dashboard/account/sections/account-danger";

export interface CopilotProfileSummary {
  role?: string | null;
  industry?: string | null;
  businessStage?: string | null;
  goals?: string[] | null;
  preferredTone?: string;
  expertiseLevel?: string;
  language?: string;
}

export interface SubscriptionSummary {
  planId: string;
  status: string;
  billingCycle?: string | null;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  provider?: string | null;
}

export interface IntegrationSummary {
  id: string;
  provider: string;
  providerAccountId: string | null;
  isConnected: boolean;
  metadata: unknown;
  connectedAt: string;
}

export interface ApiKeySummary {
  id: string;
  label: string;
  prefix: string;
  scopes: string[] | null;
  lastUsed: string | null;
  createdAt: string;
  revokedAt?: string | null;
}

export interface SessionSummary {
  id: string;
  device: string | null;
  platform: string | null;
  ip: string | null;
  location: string | null;
  lastActive: string;
  createdAt: string;
}

export interface AccountBundle {
  account: {
    id: string;
    email: string | null;
    role: string;
    name: string | null;
    image: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    birthDate: string | null;
    bio: string | null;
    twoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
  profile: UserProfileData;
  settings: UserSettings;
  copilotProfile: CopilotProfileSummary | null;
  subscription: SubscriptionSummary | null;
  integrations: IntegrationSummary[];
  apiKeys: ApiKeySummary[];
  sessions: SessionSummary[];
}

export default function AccountPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as AccountSectionId) || "overview";
  const [active, setActive] = useState<AccountSectionId>(initialSection);
  const [bundle, setBundle] = useState<AccountBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Keep active section in sync with ?section= deep links
  useEffect(() => {
    const s = searchParams.get("section") as AccountSectionId | null;
    if (s) setActive(s);
  }, [searchParams]);

  const fetchBundle = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        setLoadError("بارگذاری تنظیمات حساب ناموفق بود. لطفاً دوباره تلاش کنید.");
        return;
      }
      const data = await res.json();
      setBundle(data as AccountBundle);
    } catch (e) {
      console.error("Failed to load account bundle", e);
      setLoadError("خطا در اتصال به سرور. اتصال اینترنت خود را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchBundle(), refreshProfile()]);
  }, [fetchBundle, refreshProfile]);

  if (loading && !bundle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  const planId = bundle?.subscription?.planId || userProfile?.subscription?.planId || "free";
  const displayName =
    bundle?.account?.firstName || bundle?.account?.name || user?.email || "کاربر کارنکس";

  const grouped = (["account", "settings", "danger"] as const).map((group) => ({
    group,
    items: ACCOUNT_SECTIONS.filter((s) => s.group === group),
  }));

  const renderSection = () => {
    const props = { bundle: bundle!, refresh };
    switch (active) {
      case "overview":
        return <AccountOverview {...props} onNavigate={setActive} />;
      case "profile":
        return <AccountProfile {...props} />;
      case "ai":
        return <AccountAI {...props} />;
      case "billing":
        return <AccountBilling {...props} />;
      case "usage":
        return <AccountUsage {...props} />;
      case "notifications":
        return <AccountNotifications {...props} />;
      case "preferences":
        return <AccountPreferences {...props} />;
      case "integrations":
        return <AccountIntegrations {...props} />;
      case "security":
        return <AccountSecurity {...props} />;
      case "data":
        return <AccountData {...props} />;
      case "danger":
        return <AccountDanger {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in-up">
      {/* Brand-aligned gradient header (replaces indigo/slate heroes) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-purple-600 to-brand-secondary text-white shadow-2xl shadow-primary/20 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />
        <div className="absolute top-0 start-0 w-72 h-72 bg-white/15 rounded-full blur-[90px] -translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <ProfileAvatar
            name={displayName}
            src={bundle?.account?.image || userProfile?.avatar_url}
            size={84}
            ring
            className="ring-white/30"
          />
        </div>
        <div className="relative z-10 flex-1 text-center md:text-start">
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">مرکز حساب کاربری</h1>
            <PlanBadge planId={planId} />
          </div>
          <p className="text-white/80 text-base mt-2 max-w-2xl leading-relaxed">
            حساب کاربری، تنظیمات، شخصی‌سازی و امنیت خود را در یک پنل یکپارچه مدیریت کنید.
          </p>
        </div>
        <Link
          href="/dashboard/overview"
          className="relative z-10 hidden md:inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl backdrop-blur-md transition-colors"
        >
          بازگشت به داشبورد
          <ChevronLeft size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left rail */}
        <div className="lg:col-span-3">
          <Card
            variant="glass"
            className="p-3 lg:sticky lg:top-24 max-h-none lg:max-h-[calc(100vh-7rem)] overflow-y-auto"
          >
            {/* Rail header */}
            <div className="px-2 py-3 mb-2 border-b border-border/40">
              <div className="text-xs text-muted-foreground">ورود به عنوان</div>
              <div className="font-bold text-sm text-foreground truncate" dir="ltr">
                {user?.email}
              </div>
            </div>

            {/* Mobile: horizontal section chips */}
            <nav className="lg:hidden flex gap-2 overflow-x-auto mobile-scroll-x pb-2 -mx-1 px-1">
              {grouped.flatMap(({ items }) => items).map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "shrink-0 flex items-center gap-2 px-3 py-2.5 min-h-11 rounded-xl text-sm transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <nav className="hidden lg:block space-y-4">
              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {ACCOUNT_GROUP_LABELS[group]}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = active === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActive(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 relative text-start group",
                            isActive
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="account-rail-active"
                              className="absolute end-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <item.icon size={18} className="shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          {loadError && !bundle ? (
            <Card variant="glass" className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">{loadError}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void fetchBundle();
                }}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
              >
                تلاش مجدد
              </button>
            </Card>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {bundle ? renderSection() : null}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
