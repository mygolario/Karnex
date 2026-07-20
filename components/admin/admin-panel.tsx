"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  Activity,
  MessageSquare,
  Flag,
  BarChart3,
  Search,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { getPlanById } from "@/lib/payment/pricing";
import { toPersianDigits } from "@/lib/utils";
import type { AdminUserRow } from "@/lib/admin-actions";
import type { EffectiveLaunchConfig, LaunchOverrides } from "@/lib/launch/config";
import type { ProjectType } from "@/app/new-project/genesis-constants";

type TabId =
  | "overview"
  | "users"
  | "payments"
  | "support"
  | "feedback"
  | "launch"
  | "analytics";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "نمای کلی", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "users", label: "کاربران", icon: <Users className="w-4 h-4" /> },
  { id: "payments", label: "پرداخت‌ها", icon: <DollarSign className="w-4 h-4" /> },
  { id: "support", label: "پشتیبانی", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "feedback", label: "بازخورد", icon: <Activity className="w-4 h-4" /> },
  { id: "launch", label: "لانچ", icon: <Flag className="w-4 h-4" /> },
  { id: "analytics", label: "آمار", icon: <BarChart3 className="w-4 h-4" /> },
];

type Analytics = {
  totalUsers: number;
  activePaidSubs: number;
  openTickets: number;
  signups30d: number;
  totalRevenue: number;
  completedTxCount: number;
  feedbackCount: number;
  planBreakdown: { planId: string; count: number }[];
};

type TxRow = {
  id: string;
  email: string | null;
  planId: string | null;
  amount: number;
  status: string;
  trackId: string | null;
  createdAt: string;
};

type TicketRow = {
  id: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

type FeedbackRow = {
  id: string;
  email: string | null;
  name: string | null;
  message: string;
  createdAt: string;
};

function formatMoney(amount: number) {
  if (amount >= 1_000_000) {
    return `${toPersianDigits((amount / 1_000_000).toFixed(1))} M`;
  }
  return toPersianDigits(Math.round(amount).toLocaleString("en-US"));
}

function planLabel(planId: string) {
  return getPlanById(planId)?.name || planId;
}

export function AdminPanel() {
  const { success, error } = useToast();
  const [tab, setTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [txStatus, setTxStatus] = useState("");
  const [recoverTrackId, setRecoverTrackId] = useState("");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [ticketFilter, setTicketFilter] = useState("");
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [launchConfig, setLaunchConfig] = useState<EffectiveLaunchConfig | null>(null);
  const [launchOverrides, setLaunchOverridesState] = useState<LaunchOverrides>({});
  const [busy, setBusy] = useState(false);

  const loadOverview = useCallback(async () => {
    const { getAdminAnalytics } = await import("@/lib/admin-actions");
    const res = await getAdminAnalytics();
    if (res.error) throw new Error(res.error);
    setAnalytics(res.analytics!);
  }, []);

  const loadUsers = useCallback(async () => {
    const { getAdminUsers } = await import("@/lib/admin-actions");
    const res = await getAdminUsers({
      search: userSearch || undefined,
      includeDeleted,
      pageSize: 100,
    });
    if (res.error) throw new Error(res.error);
    setUsers(res.users || []);
  }, [userSearch, includeDeleted]);

  const loadPayments = useCallback(async () => {
    const { getAdminTransactions } = await import("@/lib/admin-actions");
    const res = await getAdminTransactions({
      status: txStatus || undefined,
      pageSize: 100,
    });
    if (res.error) throw new Error(res.error);
    setTransactions(res.transactions || []);
  }, [txStatus]);

  const loadSupport = useCallback(async () => {
    const { getAdminSupportTickets } = await import("@/lib/admin-actions");
    const res = await getAdminSupportTickets({
      status: ticketFilter || undefined,
      pageSize: 100,
    });
    if (res.error) throw new Error(res.error);
    setTickets(res.tickets || []);
  }, [ticketFilter]);

  const loadFeedback = useCallback(async () => {
    const { getAdminFeedback } = await import("@/lib/admin-actions");
    const res = await getAdminFeedback({ pageSize: 100 });
    if (res.error) throw new Error(res.error);
    setFeedback(res.items || []);
  }, []);

  const loadLaunch = useCallback(async () => {
    const { getAdminLaunchFlags } = await import("@/lib/admin-actions");
    const res = await getAdminLaunchFlags();
    if (res.error) throw new Error(res.error);
    setLaunchConfig(res.config!);
    setLaunchOverridesState(res.overrides || {});
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview" || tab === "analytics") await loadOverview();
      if (tab === "users") await loadUsers();
      if (tab === "payments") await loadPayments();
      if (tab === "support") await loadSupport();
      if (tab === "feedback") await loadFeedback();
      if (tab === "launch") await loadLaunch();
    } catch (e: unknown) {
      error("خطا", e instanceof Error ? e.message : "بارگذاری ناموفق");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast helpers are stable enough; avoid refresh loops
  }, [tab, loadOverview, loadUsers, loadPayments, loadSupport, loadFeedback, loadLaunch]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      success("انجام شد", "تغییرات ذخیره شد.");
      await refresh();
    } catch (e: unknown) {
      error("خطا", e instanceof Error ? e.message : "عملیات ناموفق");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-8" dir="rtl">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            پنل مدیریت
          </h1>
          <p className="text-muted-foreground mt-1">
            مدیریت کاربران، پرداخت‌ها، پشتیبانی و تنظیمات لانچ
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading || busy}>
          <RefreshCw className={`w-4 h-4 ms-2 ${loading ? "animate-spin" : ""}`} />
          بروزرسانی
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading && !analytics && tab === "overview" ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : null}

      {tab === "overview" && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="کاربران فعال" value={toPersianDigits(analytics.totalUsers)} icon={<Users className="text-blue-500" />} />
          <StatCard title="اشتراک پولی" value={toPersianDigits(analytics.activePaidSubs)} icon={<DollarSign className="text-green-500" />} />
          <StatCard
            title="درآمد تکمیل‌شده"
            value={formatMoney(analytics.totalRevenue)}
            sub="تومان"
            icon={<DollarSign className="text-amber-500" />}
          />
          <StatCard title="تیکت‌های باز" value={toPersianDigits(analytics.openTickets)} icon={<MessageSquare className="text-red-500" />} />
          <StatCard title="ثبت‌نام ۳۰ روز" value={toPersianDigits(analytics.signups30d)} icon={<Activity className="text-primary" />} />
          <StatCard title="تراکنش موفق" value={toPersianDigits(analytics.completedTxCount)} icon={<BarChart3 className="text-primary" />} />
          <StatCard title="بازخوردها" value={toPersianDigits(analytics.feedbackCount)} icon={<Activity className="text-teal-500" />} />
        </div>
      )}

      {tab === "users" && (
        <UsersTab
          users={users}
          search={userSearch}
          onSearchChange={setUserSearch}
          includeDeleted={includeDeleted}
          onIncludeDeletedChange={setIncludeDeleted}
          onSearch={() => void loadUsers()}
          busy={busy}
          onSetPlan={(userId, planId) =>
            runAction(async () => {
              const { setAdminUserPlan } = await import("@/lib/admin-actions");
              const res = await setAdminUserPlan(userId, planId);
              if (res.error) throw new Error(res.error);
            })
          }
          onSetRole={(userId, role) =>
            runAction(async () => {
              const { setAdminUserRole } = await import("@/lib/admin-actions");
              const res = await setAdminUserRole(userId, role);
              if (res.error) throw new Error(res.error);
            })
          }
          onSetCredits={(userId, aiTokens) =>
            runAction(async () => {
              const { setAdminUserCredits } = await import("@/lib/admin-actions");
              const res = await setAdminUserCredits(userId, aiTokens);
              if (res.error) throw new Error(res.error);
            })
          }
          onSoftDelete={(userId) =>
            runAction(async () => {
              const { softDeleteAdminUser } = await import("@/lib/admin-actions");
              const res = await softDeleteAdminUser(userId);
              if (res.error) throw new Error(res.error);
            })
          }
          onRestore={(userId) =>
            runAction(async () => {
              const { restoreAdminUser } = await import("@/lib/admin-actions");
              const res = await restoreAdminUser(userId);
              if (res.error) throw new Error(res.error);
            })
          }
        />
      )}

      {tab === "payments" && (
        <PaymentsTab
          transactions={transactions}
          status={txStatus}
          onStatusChange={setTxStatus}
          onReload={() => void loadPayments()}
          recoverTrackId={recoverTrackId}
          onRecoverTrackIdChange={setRecoverTrackId}
          busy={busy}
          onRecover={() =>
            runAction(async () => {
              const { recoverAdminPayment } = await import("@/lib/admin-actions");
              const res = await recoverAdminPayment(recoverTrackId.trim());
              if (res.error) throw new Error(res.error);
              setRecoverTrackId("");
            })
          }
        />
      )}

      {tab === "support" && (
        <SupportTab
          tickets={tickets}
          filter={ticketFilter}
          onFilterChange={setTicketFilter}
          onReload={() => void loadSupport()}
          busy={busy}
          onUpdate={(id, data) =>
            runAction(async () => {
              const { updateAdminSupportTicket } = await import("@/lib/admin-actions");
              const res = await updateAdminSupportTicket(id, data);
              if (res.error) throw new Error(res.error);
            })
          }
        />
      )}

      {tab === "feedback" && <FeedbackTab items={feedback} />}

      {tab === "launch" && launchConfig && (
        <LaunchTab
          config={launchConfig}
          overrides={launchOverrides}
          busy={busy}
          onSave={(next) =>
            runAction(async () => {
              const { updateAdminLaunchFlags } = await import("@/lib/admin-actions");
              const res = await updateAdminLaunchFlags(next);
              if (res.error) throw new Error(res.error);
              // Re-hydrate client launch config for nav/genesis
              try {
                const { hydrateLaunchOverrides } = await import("@/lib/launch/config");
                hydrateLaunchOverrides(res.overrides ?? null);
                window.dispatchEvent(new Event("karnex:launch-config"));
              } catch {
                /* ignore */
              }
            })
          }
        />
      )}

      {tab === "analytics" && analytics && <AnalyticsTab analytics={analytics} />}
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="default" className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-black">{value}</h3>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">{icon}</div>
    </Card>
  );
}

function UsersTab(props: {
  users: AdminUserRow[];
  search: string;
  onSearchChange: (v: string) => void;
  includeDeleted: boolean;
  onIncludeDeletedChange: (v: boolean) => void;
  onSearch: () => void;
  busy: boolean;
  onSetPlan: (id: string, planId: string) => void;
  onSetRole: (id: string, role: "user" | "admin") => void;
  onSetCredits: (id: string, n: number) => void;
  onSoftDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
        <h3 className="font-bold">لیست کاربران</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={props.includeDeleted}
              onChange={(e) => props.onIncludeDeletedChange(e.target.checked)}
            />
            حذف‌شده‌ها
          </label>
          <div className="relative w-56">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              className="input-premium w-full pr-9 py-1.5 text-sm"
              placeholder="جستجو ایمیل یا نام..."
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && props.onSearch()}
            />
          </div>
          <Button size="sm" variant="outline" onClick={props.onSearch}>
            جستجو
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-3">کاربر</th>
              <th className="p-3">نقش</th>
              <th className="p-3">طرح</th>
              <th className="p-3">اعتبار AI</th>
              <th className="p-3">پروژه</th>
              <th className="p-3">عضویت</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {props.users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="p-3">
                  <div className="font-bold">{u.full_name || "بدون نام"}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">
                    {u.email}
                  </div>
                  {u.deleted_at && (
                    <Badge variant="outline" className="mt-1 text-destructive">
                      حذف‌شده
                    </Badge>
                  )}
                </td>
                <td className="p-3">
                  <select
                    className="input-premium text-xs py-1"
                    disabled={props.busy}
                    value={u.role || "user"}
                    onChange={(e) =>
                      props.onSetRole(u.id, e.target.value as "user" | "admin")
                    }
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    className="input-premium text-xs py-1"
                    disabled={props.busy}
                    value={u.subscription.planId}
                    onChange={(e) => props.onSetPlan(u.id, e.target.value)}
                  >
                    <option value="free">رایگان</option>
                    <option value="plus">پرو</option>
                    <option value="pro">تیم</option>
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    min={0}
                    className="input-premium w-20 text-xs py-1"
                    dir="ltr"
                    defaultValue={u.credits.aiTokens}
                    disabled={props.busy}
                    onBlur={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isFinite(n) && n !== u.credits.aiTokens) {
                        props.onSetCredits(u.id, n);
                      }
                    }}
                  />
                </td>
                <td className="p-3">{toPersianDigits(u.projectCount)}</td>
                <td className="p-3 text-muted-foreground" dir="ltr">
                  {new Date(u.created_at).toLocaleDateString("fa-IR")}
                </td>
                <td className="p-3">
                  {u.deleted_at ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={props.busy}
                      onClick={() => props.onRestore(u.id)}
                    >
                      بازگردانی
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={props.busy}
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("حذف نرم این کاربر؟")) props.onSoftDelete(u.id);
                      }}
                    >
                      حذف
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {props.users.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  کاربری یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PaymentsTab(props: {
  transactions: TxRow[];
  status: string;
  onStatusChange: (v: string) => void;
  onReload: () => void;
  recoverTrackId: string;
  onRecoverTrackIdChange: (v: string) => void;
  busy: boolean;
  onRecover: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="font-bold">بازیابی پرداخت</h3>
        <p className="text-xs text-muted-foreground">
          trackId زیبال را وارد کنید تا تراکنش pending/failed دوباره verify شود.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input
            dir="ltr"
            placeholder="trackId"
            value={props.recoverTrackId}
            onChange={(e) => props.onRecoverTrackIdChange(e.target.value)}
          />
          <Button disabled={props.busy || !props.recoverTrackId.trim()} onClick={props.onRecover}>
            بازیابی
          </Button>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-2 items-center justify-between">
          <h3 className="font-bold">تراکنش‌ها</h3>
          <div className="flex gap-2">
            <select
              className="input-premium text-sm py-1"
              value={props.status}
              onChange={(e) => props.onStatusChange(e.target.value)}
            >
              <option value="">همه</option>
              <option value="completed">completed</option>
              <option value="pending">pending</option>
              <option value="failed">failed</option>
            </select>
            <Button size="sm" variant="outline" onClick={props.onReload}>
              فیلتر
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-3">کاربر</th>
                <th className="p-3">طرح</th>
                <th className="p-3">مبلغ</th>
                <th className="p-3">وضعیت</th>
                <th className="p-3">trackId</th>
                <th className="p-3">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {props.transactions.map((t) => (
                <tr key={t.id}>
                  <td className="p-3" dir="ltr">
                    {t.email || "—"}
                  </td>
                  <td className="p-3">{t.planId ? planLabel(t.planId) : "—"}</td>
                  <td className="p-3">{formatMoney(t.amount)}</td>
                  <td className="p-3">
                    <Badge variant={t.status === "completed" ? "secondary" : "outline"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-xs" dir="ltr">
                    {t.trackId || "—"}
                  </td>
                  <td className="p-3" dir="ltr">
                    {new Date(t.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SupportTab(props: {
  tickets: TicketRow[];
  filter: string;
  onFilterChange: (v: string) => void;
  onReload: () => void;
  busy: boolean;
  onUpdate: (id: string, data: { status?: string; adminNote?: string }) => void;
}) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 border-b flex flex-wrap gap-2 justify-between items-center">
        <h3 className="font-bold">تیکت‌های پشتیبانی</h3>
        <div className="flex gap-2">
          <select
            className="input-premium text-sm py-1"
            value={props.filter}
            onChange={(e) => props.onFilterChange(e.target.value)}
          >
            <option value="">همه</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
          </select>
          <Button size="sm" variant="outline" onClick={props.onReload}>
            فیلتر
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {props.tickets.map((t) => (
          <div key={t.id} className="p-4 space-y-3">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <div className="font-bold">{t.subject}</div>
                <div className="text-xs text-muted-foreground" dir="ltr">
                  {t.email} · {t.category} · {t.priority}
                </div>
              </div>
              <Badge variant="outline">{t.status}</Badge>
            </div>
            <p className="text-sm whitespace-pre-wrap">{t.message}</p>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">وضعیت</Label>
                <select
                  className="input-premium text-sm py-1"
                  disabled={props.busy}
                  value={t.status}
                  onChange={(e) => props.onUpdate(t.id, { status: e.target.value })}
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px] space-y-1">
                <Label className="text-xs">یادداشت ادمین</Label>
                <Textarea
                  className="min-h-[60px]"
                  defaultValue={t.adminNote || ""}
                  disabled={props.busy}
                  onBlur={(e) => {
                    if (e.target.value !== (t.adminNote || "")) {
                      props.onUpdate(t.id, { adminNote: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {props.tickets.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">تیکتی نیست</div>
        )}
      </div>
    </Card>
  );
}

function FeedbackTab({ items }: { items: FeedbackRow[] }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold">صندوق بازخورد</h3>
      </div>
      <div className="divide-y divide-border">
        {items.map((f) => {
          let pretty = f.message;
          try {
            const parsed = JSON.parse(f.message) as Record<string, unknown>;
            pretty = [
              parsed.rating != null ? `امتیاز: ${parsed.rating}` : null,
              parsed.category ? `دسته: ${parsed.category}` : null,
              parsed.comment ? String(parsed.comment) : null,
              parsed.page ? `صفحه: ${parsed.page}` : null,
            ]
              .filter(Boolean)
              .join("\n");
          } catch {
            /* raw message */
          }
          return (
            <div key={f.id} className="p-4">
              <div className="text-xs text-muted-foreground mb-1" dir="ltr">
                {f.email || "ناشناس"} · {new Date(f.createdAt).toLocaleString("fa-IR")}
              </div>
              <p className="text-sm whitespace-pre-wrap">{pretty}</p>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">بازخوردی نیست</div>
        )}
      </div>
    </Card>
  );
}

function LaunchTab(props: {
  config: EffectiveLaunchConfig;
  overrides: LaunchOverrides;
  busy: boolean;
  onSave: (next: LaunchOverrides) => void;
}) {
  const [traditional, setTraditional] = useState(
    props.config.availablePillars.includes("traditional"),
  );
  const [creator, setCreator] = useState(
    props.config.availablePillars.includes("creator"),
  );
  const [marketingOnly, setMarketingOnly] = useState(props.config.marketingStartupOnly);
  const [hideXp, setHideXp] = useState(props.config.hideGamification);

  useEffect(() => {
    setTraditional(props.config.availablePillars.includes("traditional"));
    setCreator(props.config.availablePillars.includes("creator"));
    setMarketingOnly(props.config.marketingStartupOnly);
    setHideXp(props.config.hideGamification);
  }, [props.config]);

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-bold text-lg">پرچم‌های لانچ</h3>
        <p className="text-sm text-muted-foreground mt-1">
          این تنظیمات بدون دیپلوی، در دسترس بودن ستون‌ها و ظاهر مارکتینگ را عوض می‌کنند.
        </p>
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" checked disabled />
        <span>استارتاپ (همیشه فعال)</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={traditional}
          onChange={(e) => setTraditional(e.target.checked)}
        />
        <span>فعال‌سازی ستون سنتی</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={creator}
          onChange={(e) => setCreator(e.target.checked)}
        />
        <span>فعال‌سازی ستون سازنده محتوا</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={marketingOnly}
          onChange={(e) => setMarketingOnly(e.target.checked)}
        />
        <span>مارکتینگ فقط استارتاپ</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={hideXp}
          onChange={(e) => setHideXp(e.target.checked)}
        />
        <span>مخفی کردن گیمیفیکیشن نقشه راه</span>
      </label>
      <Button
        disabled={props.busy}
        onClick={() => {
          const availablePillars: ProjectType[] = ["startup"];
          if (traditional) availablePillars.push("traditional");
          if (creator) availablePillars.push("creator");
          props.onSave({
            availablePillars,
            marketingStartupOnly: marketingOnly,
            hideGamification: hideXp,
          });
        }}
      >
        ذخیره تنظیمات لانچ
      </Button>
    </Card>
  );
}

function AnalyticsTab({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="کاربران" value={toPersianDigits(analytics.totalUsers)} icon={<Users className="text-blue-500" />} />
        <StatCard title="درآمد" value={formatMoney(analytics.totalRevenue)} sub="تومان" icon={<DollarSign className="text-amber-500" />} />
        <StatCard title="ثبت‌نام ۳۰ روز" value={toPersianDigits(analytics.signups30d)} icon={<Activity className="text-primary" />} />
      </div>
      <Card className="p-4">
        <h3 className="font-bold mb-3">توزیع طرح‌های فعال</h3>
        <ul className="space-y-2">
          {analytics.planBreakdown.map((p) => (
            <li key={p.planId} className="flex justify-between text-sm">
              <span>{planLabel(p.planId)}</span>
              <span className="font-bold">{toPersianDigits(p.count)}</span>
            </li>
          ))}
          {analytics.planBreakdown.length === 0 && (
            <li className="text-muted-foreground text-sm">داده‌ای نیست</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
