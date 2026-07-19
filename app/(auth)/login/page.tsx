"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getAuthConfirmRedirectUrl,
  getOAuthRedirectUrl,
} from "@/lib/auth/oauth-redirect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordField } from "@/components/auth/password-field";
import { FormAlert } from "@/components/auth/form-alert";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");

  // Surface callback messages (e.g. after email confirmation or signup)
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "confirm_email") {
      setSuccess("ایمیل شما تأیید شد. حالا می‌توانید وارد شوید.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      await fetch("/api/auth/sync", { method: "POST" });

      const callbackUrl =
        searchParams.get("callbackUrl") || "/dashboard/overview";
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      console.error("Login Error:", err);
      const message = err instanceof Error ? err.message : "خطای ناشناخته";
      if (message.includes("Invalid login credentials")) {
        setError("ایمیل یا رمز عبور اشتباه است");
      } else {
        setError(`خطا در ورود: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const callbackUrl =
      searchParams.get("callbackUrl") || "/dashboard/overview";
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getOAuthRedirectUrl(callbackUrl) },
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    setResetSuccess("");

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        resetEmail,
        { redirectTo: getAuthConfirmRedirectUrl("recovery") }
      );
      if (resetError) {
        setError(resetError.message || "خطا در ارسال ایمیل");
      } else {
        setResetSuccess(
          "اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال شد."
        );
        setTimeout(() => setShowForgotPassword(false), 4000);
        setResetEmail("");
      }
    } catch (err: unknown) {
      console.error("Forgot Password Error:", err);
      setError("خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
    <AuthShell mode="login">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          خوش آمدید 👋
        </h2>
        <p className="text-muted-foreground">برای دسترسی به پنل مدیریت وارد شوید</p>
      </div>

      <Card
        variant="glass"
        className="frosted-glass shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        <div className="space-y-6">
          <GoogleButton
            label="ورود با حساب گوگل"
            onClick={handleGoogleLogin}
            disabled={loading}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">یا ورود با ایمیل</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <FormAlert variant="error" message={error} />
            <FormAlert variant="success" message={success} />

            <AuthInput
              label="ایمیل"
              type="email"
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-5 w-5" />}
              required
            />

            <div className="space-y-2">
              <PasswordField
                label="رمز عبور"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-brand-primary hover:underline font-medium"
                >
                  فراموشی رمز؟
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">
                مرا به خاطر بسپار
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              rounded="lg"
              className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2 text-base">
                  ورود به حساب
                  <ArrowLeft size={18} />
                </span>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          حساب کاربری ندارید؟{" "}
          <Link
            href="/signup"
            className="text-brand-primary font-bold hover:underline transition-all"
          >
            ثبت‌نام کنید
          </Link>
        </div>
        </Card>
      </AuthShell>

      {/* Forgot password modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl relative border border-border/50"
            >
              <button
                onClick={() => setShowForgotPassword(false)}
                className="absolute end-4 top-4 text-muted-foreground hover:text-foreground"
                aria-label="بستن"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold">بازیابی رمز عبور</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود
                </p>
              </div>

              {resetSuccess ? (
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center p-4 rounded-xl flex flex-col items-center gap-2">
                  <span>{resetSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <AuthInput
                    label="ایمیل"
                    type="email"
                    dir="ltr"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    icon={<Mail className="h-5 w-5" />}
                    required
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "ارسال لینک"
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
