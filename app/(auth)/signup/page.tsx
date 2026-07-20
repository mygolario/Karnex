"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOAuthRedirectUrl } from "@/lib/auth/oauth-redirect";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, User, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { FormAlert } from "@/components/auth/form-alert";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    if (error) setError("");
  }, [email, password, confirmPassword, name]);

  const validations = {
    name: name.length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    passwordLength: password.length >= 6,
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validations.name) {
      setError("لطفاً نام کامل خود را وارد کنید");
      return;
    }
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/new-project`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        await fetch("/api/auth/sync", { method: "POST" });
        setSignedUp(true);
        setTimeout(() => router.push("/new-project"), 2500);
      } else {
        setSignedUp(true);
        setError("");
        setTimeout(() => router.push("/login?message=confirm_email"), 2500);
      }
    } catch (err: unknown) {
      console.error("Signup Error:", err);
      const message = err instanceof Error ? err.message : "خطای ناشناخته";
      if (
        message.includes("already registered") ||
        message.includes("User already registered")
      ) {
        setError("این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید");
      } else {
        setError("خطا در ثبت‌نام: " + message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getOAuthRedirectUrl("/new-project") },
    });
  };

  if (signedUp) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center glow-primary">
              <CheckCircle2 className="w-10 h-10 text-brand-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-black mb-3">خوش آمدید به کارنکس!</h2>
          <p className="text-muted-foreground">در حال انتقال به داشبورد...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthShell mode="signup">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          ثبت‌نام در کارنکس
        </h2>
        <p className="text-muted-foreground">همین حالا سفر کارآفرینی خود را آغاز کنید</p>
      </div>

      <Card
        variant="glass"
        className="frosted-glass shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        <div className="space-y-6">
          <GoogleButton
            label="ثبت‌نام با گوگل"
            onClick={handleGoogleSignup}
            disabled={loading}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">یا با ایمیل</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <FormAlert variant="error" message={error} />

            <AuthInput
              label="نام و نام خانوادگی"
              type="text"
              placeholder="مثال: علی محمدی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              icon={<User className="h-5 w-5" />}
              error={touched.name && !validations.name}
              required
            />

            <AuthInput
              label="ایمیل"
              type="email"
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              icon={<Mail className="h-5 w-5" />}
              error={touched.email && !validations.email}
              required
            />

            <div className="space-y-2">
              <PasswordField
                label="رمز عبور"
                placeholder="حداقل ۸ کاراکتر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <PasswordField
              label="تکرار رمز عبور"
              placeholder="تکرار رمز عبور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              error={touched.confirm && !validations.passwordsMatch}
              required
            />

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
                  ساخت حساب کاربری
                  <ArrowLeft size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="text-xs text-center text-muted-foreground leading-relaxed">
            با ثبت‌نام، با{" "}
            <Link href="/terms" className="text-brand-primary hover:underline">
              شرایط استفاده
            </Link>{" "}
            و{" "}
            <Link href="/privacy" className="text-brand-primary hover:underline">
              حریم خصوصی
            </Link>{" "}
            کارنکس موافقت می‌کنید.
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/50 pt-4">
          حساب کاربری دارید؟{" "}
          <Link
            href="/login"
            className="text-brand-primary font-bold hover:underline transition-all"
          >
            وارد شوید
          </Link>
        </div>
      </Card>
    </AuthShell>
  );
}
