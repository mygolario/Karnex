"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { appointmentsApi } from "@/lib/appointments/api";
import type { Appointment, AppointmentStatus } from "@/lib/appointments/types";
import { toPersianDigits } from "@/lib/utils";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "رزرو",
  done: "انجام‌شده",
  cancelled: "لغو",
  no_show: "نیامد",
};

const STATUS_OPTIONS: AppointmentStatus[] = ["booked", "done", "cancelled", "no_show"];

export default function AppointmentsPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    service: "",
    startAt: "",
    note: "",
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await appointmentsApi.list(projectId);
      setAppointments(data.appointments);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری نوبت‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <CalendarCheck size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">نوبت‌دهی برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const save = async () => {
    if (!projectId) return;
    if (!form.customerName.trim() || !form.startAt) {
      toast.error("نام مشتری و زمان شروع الزامی است");
      return;
    }
    setSaving(true);
    try {
      await appointmentsApi.create(projectId, {
        customerName: form.customerName,
        customerPhone: form.customerPhone || null,
        service: form.service || null,
        startAt: new Date(form.startAt).toISOString(),
        note: form.note || null,
      });
      toast.success("نوبت ثبت شد");
      setShowModal(false);
      setForm({ customerName: "", customerPhone: "", service: "", startAt: "", note: "" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (a: Appointment, status: AppointmentStatus) => {
    if (!projectId) return;
    try {
      const { appointment } = await appointmentsApi.update(projectId, a.id, { status });
      setAppointments((prev) => prev.map((x) => (x.id === appointment.id ? appointment : x)));
      toast.success("وضعیت به‌روز شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">نوبت‌دهی</h1>
            <p className="text-sm text-muted-foreground">رزرو، انجام، لغو و عدم حضور</p>
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={16} /> نوبت جدید
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : appointments.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">هنوز نوبتی ثبت نشده است.</Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{a.customerName}</h3>
                    <Badge variant="secondary">{STATUS_LABELS[a.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.service || "خدمت عمومی"} · {new Date(a.startAt).toLocaleString("fa-IR")}
                    {a.customerPhone ? ` · ${toPersianDigits(a.customerPhone)}` : ""}
                  </p>
                  {a.note && <p className="text-xs text-muted-foreground mt-1">{a.note}</p>}
                </div>
                <select
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={a.status}
                  onChange={(e) => setStatus(a, e.target.value as AppointmentStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 relative">
            <button type="button" className="absolute top-4 left-4" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold">نوبت جدید</h2>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="نام مشتری"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="تلفن"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="خدمت"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            />
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
              placeholder="یادداشت"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>انصراف</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : "ثبت"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
