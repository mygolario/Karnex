"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/utils";
import {
  ADMIN_FUNNEL_STAGE_LABELS,
  type AdminUserDetail,
  type AdminUserRow,
} from "@/lib/admin/user-intelligence";
import { getAdminUserDetail } from "@/lib/admin-actions";
import { getPlanById } from "@/lib/payment/pricing";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fa-IR");
}

function planLabel(planId: string) {
  return getPlanById(planId)?.name || planId;
}

export function AdminUserDetailDrawer(props: {
  user: AdminUserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.open || !props.user?.id) {
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await getAdminUserDetail(props.user!.id);
        if (cancelled) return;
        if (res.error || !res.user) {
          setError(res.error || "بارگذاری ناموفق");
          setDetail(null);
          return;
        }
        setDetail(res.user);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "خطا");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [props.open, props.user?.id]);

  const title = props.user?.full_name || props.user?.email || "کاربر";

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent
        side="start"
        className="w-full sm:max-w-lg overflow-y-auto"
        dir="rtl"
      >
        <SheetHeader className="text-start">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription dir="ltr" className="text-start">
            {props.user?.email || "—"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 text-sm">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              در حال بارگذاری…
            </div>
          )}

          {error && (
            <p className="text-destructive text-center py-4">{error}</p>
          )}

          {detail && !loading && (
            <>
              <section className="grid grid-cols-2 gap-3">
                <InfoCell label="مرحله فانل">
                  <Badge variant="secondary">
                    {ADMIN_FUNNEL_STAGE_LABELS[detail.funnel_stage]}
                  </Badge>
                </InfoCell>
                <InfoCell label="طرح">
                  {planLabel(detail.subscription.planId)}
                </InfoCell>
                <InfoCell label="آخرین فعالیت">
                  {formatDate(detail.last_seen_at)}
                </InfoCell>
                <InfoCell label="عضویت">
                  {formatDate(detail.created_at)}
                </InfoCell>
                <InfoCell label="نقش">{detail.role || "user"}</InfoCell>
                <InfoCell label="اعتبار AI">
                  {toPersianDigits(detail.credits.aiTokens)}
                </InfoCell>
              </section>

              <section className="flex flex-wrap gap-2">
                {detail.posthogPersonUrl && (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={detail.posthogPersonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 ms-1" />
                      PostHog شخص
                    </a>
                  </Button>
                )}
                <Button asChild size="sm" variant="outline">
                  <a
                    href={detail.posthogReplayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 ms-1" />
                    Session Replay
                  </a>
                </Button>
              </section>

              <Section title={`پروژه‌ها (${toPersianDigits(detail.projects.length)})`}>
                {detail.projects.length === 0 ? (
                  <Empty />
                ) : (
                  <ul className="space-y-2">
                    {detail.projects.map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between gap-2 border-b border-border/60 pb-2"
                      >
                        <span className="font-medium truncate">
                          {p.projectName}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0" dir="ltr">
                          {new Date(p.updatedAt).toLocaleDateString("fa-IR")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="پرداخت‌ها">
                {detail.transactions.length === 0 ? (
                  <Empty />
                ) : (
                  <ul className="space-y-2">
                    {detail.transactions.map((t) => (
                      <li
                        key={t.id}
                        className="flex justify-between gap-2 border-b border-border/60 pb-2"
                      >
                        <span>
                          {t.planId ? planLabel(t.planId) : "—"} · {t.status}
                        </span>
                        <span className="text-xs text-muted-foreground" dir="ltr">
                          {toPersianDigits(Math.round(t.amount).toLocaleString("en-US"))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="تیکت‌ها">
                {detail.tickets.length === 0 ? (
                  <Empty />
                ) : (
                  <ul className="space-y-2">
                    {detail.tickets.map((t) => (
                      <li key={t.id} className="border-b border-border/60 pb-2">
                        <div className="font-medium">{t.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.status} · {t.priority}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="بازخورد">
                {detail.feedback.length === 0 ? (
                  <Empty />
                ) : (
                  <ul className="space-y-2">
                    {detail.feedback.map((f) => (
                      <li key={f.id} className="border-b border-border/60 pb-2">
                        <p className="line-clamp-3">{f.message}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(f.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="ورودها">
                {detail.loginEvents.length === 0 ? (
                  <Empty />
                ) : (
                  <ul className="space-y-2">
                    {detail.loginEvents.map((e) => (
                      <li
                        key={e.id}
                        className="flex justify-between gap-2 border-b border-border/60 pb-2 text-xs"
                      >
                        <span>
                          {e.status}
                          {e.method ? ` · ${e.method}` : ""}
                          {e.ip ? ` · ${e.ip}` : ""}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {formatDate(e.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="لاگ ادمین">
                {detail.auditLogs.length === 0 ? (
                  <Empty />
                ) : (
                  <ul className="space-y-2">
                    {detail.auditLogs.map((a) => (
                      <li
                        key={a.id}
                        className="border-b border-border/60 pb-2 text-xs"
                      >
                        <div className="font-medium">{a.action}</div>
                        <div className="text-muted-foreground">
                          {a.actorEmail || "—"} · {formatDate(a.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="font-bold mb-2">{title}</h4>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="text-xs text-muted-foreground">موردی نیست</p>;
}
