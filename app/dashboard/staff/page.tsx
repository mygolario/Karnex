"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Plus, Loader2, Trash2, LogIn, LogOut, Clock,
  Wallet, CalendarPlus, X, Sparkles, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/contexts/project-context";
import { staffApi } from "@/lib/staff/api";
import type { Staff, Shift, PayrollSummary } from "@/lib/staff/types";
import { toPersianDigits } from "@/lib/utils";

const fmt = (n: number) => toPersianDigits(Math.round(n).toLocaleString("fa-IR"));

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function StaffPage() {
  const { activeProject: plan } = useProject();
  const projectId = plan?.id;

  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payroll, setPayroll] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    hourlyRate: 0,
  });

  const [shiftForm, setShiftForm] = useState({
    staffId: "",
    startAt: toLocalInputValue(new Date()),
    endAt: toLocalInputValue(new Date(Date.now() + 8 * 60 * 60 * 1000)),
    note: "",
  });

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [staffData, shiftData] = await Promise.all([
        staffApi.list(projectId),
        staffApi.listShifts(projectId),
      ]);
      setStaff(staffData.staff);
      setPayroll(staffData.payroll);
      setShifts(shiftData.shifts);
    } catch (e) {
      console.error(e);
      toast.error("بارگذاری پرسنل ناموفق بود");
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
          <Users size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت پرسنل برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت به داشبورد</Button></Link>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setForm({ name: "", role: "", phone: "", hourlyRate: 0 });
    setShowStaffModal(true);
  };

  const saveStaff = async () => {
    if (!projectId) return;
    if (!form.name.trim()) {
      toast.error("نام پرسنل الزامی است");
      return;
    }
    setSaving(true);
    try {
      await staffApi.create(projectId, {
        name: form.name,
        role: form.role || null,
        phone: form.phone || null,
        hourlyRate: form.hourlyRate || null,
      });
      toast.success("پرسنل اضافه شد");
      setShowStaffModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const removeStaff = async (s: Staff) => {
    if (!projectId) return;
    if (!confirm(`حذف «${s.name}»؟`)) return;
    try {
      await staffApi.remove(projectId, s.id);
      toast.success("حذف شد");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در حذف");
    }
  };

  const doAttendance = async (staffId: string, action: "in" | "out") => {
    if (!projectId) return;
    setSaving(true);
    try {
      await staffApi.attendance(projectId, { staffId, action });
      toast.success(action === "in" ? "ورود ثبت شد" : "خروج ثبت شد");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت حضور");
    } finally {
      setSaving(false);
    }
  };

  const saveShift = async () => {
    if (!projectId) return;
    if (!shiftForm.staffId) {
      toast.error("پرسنل را انتخاب کنید");
      return;
    }
    setSaving(true);
    try {
      await staffApi.createShift(projectId, {
        staffId: shiftForm.staffId,
        startAt: new Date(shiftForm.startAt).toISOString(),
        endAt: new Date(shiftForm.endAt).toISOString(),
        note: shiftForm.note || null,
      });
      toast.success("شیفت ثبت شد");
      setShowShiftModal(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ثبت شیفت");
    } finally {
      setSaving(false);
    }
  };

  const formatWhen = (iso: string) => {
    try {
      return toPersianDigits(
        new Date(iso).toLocaleString("fa-IR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">پرسنل و شیفت</h1>
            <p className="text-muted-foreground">حضور و غیاب، شیفت‌ها و خلاصه حقوق</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => {
            setShiftForm({
              staffId: staff[0]?.id || "",
              startAt: toLocalInputValue(new Date()),
              endAt: toLocalInputValue(new Date(Date.now() + 8 * 60 * 60 * 1000)),
              note: "",
            });
            setShowShiftModal(true);
          }} className="gap-2">
            <CalendarPlus size={16} /> شیفت جدید
          </Button>
          <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Plus size={18} /> افزودن پرسنل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "تعداد پرسنل", value: toPersianDigits(staff.length), icon: Users, color: "text-blue-500" },
          { label: "شیفت‌های هفته", value: toPersianDigits(shifts.length), icon: Clock, color: "text-sky-500" },
          { label: "ساعات ماه", value: toPersianDigits((payroll?.totalHours ?? 0).toFixed(1)), icon: Clock, color: "text-amber-500" },
          { label: "حقوق برآوردی", value: `${fmt(payroll?.totalAmount ?? 0)} ت`, icon: Wallet, color: "text-emerald-500" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {payroll && payroll.lines.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/30 border-b border-border">
            <h3 className="font-bold">خلاصه حقوق ماه جاری</h3>
          </div>
          <div className="divide-y divide-border">
            {payroll.lines.map((line) => (
              <div key={line.staffId} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{line.staffName}</p>
                  <p className="text-xs text-muted-foreground">
                    {toPersianDigits(line.hours.toFixed(1))} ساعت × {fmt(line.hourlyRate)} ت
                  </p>
                </div>
                <p className="font-bold text-emerald-600">{fmt(line.amount)} ت</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-bold">لیست پرسنل</h3>
        </div>
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={56} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-2">هنوز پرسنلی ثبت نشده</h3>
            <p className="text-muted-foreground mb-6">اولین همکارت را اضافه کن.</p>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <UserPlus size={18} /> افزودن پرسنل
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {staff.map((s) => (
              <div key={s.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold truncate">{s.name}</h4>
                      {s.role && <Badge variant="secondary" className="text-[10px]">{s.role}</Badge>}
                      {!s.active && (
                        <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-600">
                          غیرفعال
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {s.phone && <span>تلفن: <b className="text-foreground" dir="ltr">{toPersianDigits(s.phone)}</b></span>}
                      <span>
                        نرخ ساعتی:{" "}
                        <b className="text-foreground">{s.hourlyRate != null ? `${fmt(s.hourlyRate)} ت` : "—"}</b>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8 text-emerald-600"
                      disabled={saving}
                      onClick={() => doAttendance(s.id, "in")}
                    >
                      <LogIn size={14} /> ورود
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8 text-amber-600"
                      disabled={saving}
                      onClick={() => doAttendance(s.id, "out")}
                    >
                      <LogOut size={14} /> خروج
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-red-500"
                      onClick={() => removeStaff(s)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border">
          <h3 className="font-bold">شیفت‌های این هفته</h3>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">شیفتی برای این هفته ثبت نشده</div>
        ) : (
          <div className="divide-y divide-border">
            {shifts.map((sh) => (
              <div key={sh.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{sh.staffName || "پرسنل"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(sh.startAt)} — {formatWhen(sh.endAt)}
                  </p>
                  {sh.note && <p className="text-xs text-muted-foreground mt-1">{sh.note}</p>}
                </div>
                <Badge variant="secondary" className="text-[10px]">شیفت</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {showStaffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStaffModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus size={20} className="text-primary" /> پرسنل جدید
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowStaffModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">نام *</label>
                  <input
                    className="input-premium w-full"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: علی رضایی"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">نقش</label>
                    <input
                      className="input-premium w-full"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="صندوقدار"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">تلفن</label>
                    <input
                      dir="ltr"
                      className="input-premium w-full"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="09..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">نرخ ساعتی (تومان)</label>
                  <input
                    type="number"
                    dir="ltr"
                    className="input-premium w-full"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowStaffModal(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button onClick={saveStaff} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} ذخیره
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShiftModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShiftModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CalendarPlus size={20} className="text-primary" /> شیفت جدید
                </h3>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowShiftModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">پرسنل</label>
                  <select
                    className="input-premium w-full"
                    value={shiftForm.staffId}
                    onChange={(e) => setShiftForm({ ...shiftForm, staffId: e.target.value })}
                  >
                    <option value="">انتخاب کنید</option>
                    {staff.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">شروع</label>
                    <input
                      type="datetime-local"
                      dir="ltr"
                      className="input-premium w-full"
                      value={shiftForm.startAt}
                      onChange={(e) => setShiftForm({ ...shiftForm, startAt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">پایان</label>
                    <input
                      type="datetime-local"
                      dir="ltr"
                      className="input-premium w-full"
                      value={shiftForm.endAt}
                      onChange={(e) => setShiftForm({ ...shiftForm, endAt: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">یادداشت</label>
                  <input
                    className="input-premium w-full"
                    value={shiftForm.note}
                    onChange={(e) => setShiftForm({ ...shiftForm, note: e.target.value })}
                    placeholder="اختیاری"
                  />
                </div>
                <Button onClick={saveShift} disabled={saving} className="w-full bg-gradient-to-r from-primary to-secondary">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null} ثبت شیفت
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
