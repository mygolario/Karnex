"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountSectionHeader } from "@/components/dashboard/account/account-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { deleteProject } from "@/lib/db";
import { toast } from "sonner";
import type { AccountSectionProps } from "./section-props";

export function AccountDanger({}: AccountSectionProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { activeProject, refreshProjects } = useProject();
  const [deletingProject, setDeletingProject] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteProject = async () => {
    if (!user?.id || !activeProject?.id) return;
    if (!confirm(`پروژه «${activeProject.projectName}» حذف شود؟`)) return;
    setDeletingProject(true);
    try {
      await deleteProject(user.id, activeProject.id);
      await refreshProjects?.();
      toast.success("پروژه حذف شد");
      router.push("/projects");
    } catch {
      toast.error("خطا در حذف پروژه");
    } finally {
      setDeletingProject(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast.error("برای تأیید، عبارت DELETE را وارد کنید");
      return;
    }
    if (!confirm("حساب کاربری شما برای همیشه حذف شود؟")) return;
    setDeletingAccount(true);
    try {
      await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      toast.success("حساب حذف شد");
      await signOut();
    } catch {
      toast.error("خطا در حذف حساب");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="منطقه خطر"
        subtitle="عملیات غیرقابل بازگشت — با احتیاط استفاده کنید."
        icon={AlertTriangle}
        accent="danger"
      />

      {activeProject && (
        <div className="rounded-[2rem] border border-red-500/30 bg-red-500/5 p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <Trash2 size={24} />
          </div>
          <div className="text-center md:text-start flex-1">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">حذف پروژه فعال</h3>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm">«{activeProject.projectName}» و تمام داده‌های آن حذف می‌شود.</p>
          </div>
          <Button variant="destructive" onClick={handleDeleteProject} disabled={deletingProject}>
            {deletingProject ? <Loader2 size={16} className="animate-spin me-2" /> : <Trash2 size={16} className="me-2" />}
            حذف پروژه
          </Button>
        </div>
      )}

      <div className="rounded-[2rem] border border-red-500/30 bg-red-500/5 p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">حذف دائمی حساب</h3>
            <p className="text-red-600/80 dark:text-red-400/80 text-sm leading-relaxed">
              تمام پروژه‌ها، گفتگوها، اشتراک و داده‌های شما برای همیشه حذف خواهد شد. این عمل غیرقابل بازگشت است. پیش از آن، خروجی داده‌های خود را دانلود کنید.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold text-red-600 dark:text-red-400">برای تأیید، عبارت <code dir="ltr" className="font-mono bg-red-500/10 px-1.5 py-0.5 rounded">DELETE</code> را وارد کنید</label>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} dir="ltr" placeholder="DELETE" className="border-red-500/40" />
          </div>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount || confirmText !== "DELETE"}>
            {deletingAccount ? <Loader2 size={16} className="animate-spin me-2" /> : <Trash2 size={16} className="me-2" />}
            حذف حساب برای همیشه
          </Button>
        </div>
      </div>
    </div>
  );
}
