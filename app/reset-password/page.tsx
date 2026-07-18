"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      if (!session) {
        setError("لینک بازیابی نامعتبر یا منقضی شده است. لطفاً دوباره درخواست دهید.");
      }
      setLoading(false);
    });
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "خطا در تنظیم رمز عبور");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("خطای اتصال. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.png" alt="لوگوی کارنکس" width={44} height={44} className="rounded-xl" />
            <span className="text-xl font-black">کارنکس</span>
          </Link>
          <h1 className="text-2xl font-bold">تنظیم رمز عبور جدید</h1>
        </div>

        <Card className="p-6 border-none shadow-xl bg-card/80 backdrop-blur-sm">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-emerald-600 font-medium">رمز عبور با موفقیت تغییر کرد!</p>
              <p className="text-sm text-muted-foreground">در حال انتقال به صفحه ورود...</p>
            </div>
          ) : !hasSession ? (
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-destructive">{error}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">بازگشت به ورود</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">رمز عبور جدید</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-left"
                    dir="ltr"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تکرار رمز عبور</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-left"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : "ذخیره رمز جدید"}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">
                  <ArrowLeft className="ms-2 h-4 w-4" />
                  بازگشت به ورود
                </Link>
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
