"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError("");
  }, [email, password, confirmPassword]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "ضعیف", color: "bg-destructive" };
    if (score <= 2) return { score: 2, label: "متوسط", color: "bg-amber-500" };
    if (score <= 3) return { score: 3, label: "خوب", color: "bg-primary" };
    return { score: 4, label: "قوی", color: "bg-secondary" };
  }, [password]);

  // Validation checks
  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    passwordLength: password.length >= 6,
    passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/new-project");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("این ایمیل قبلاً ثبت شده است. آیا می‌خواهید وارد شوید؟");
      } else if (err.code === "auth/invalid-email") {
        setError("فرمت ایمیل نامعتبر است");
      } else if (err.code === "auth/weak-password") {
        setError("رمز عبور باید قوی‌تر باشد");
      } else {
        setError("خطا در ثبت‌نام. لطفاً دوباره تلاش کنید");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection every time
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      router.push("/new-project");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed popup, no error needed
      } else if (err.code === "auth/cancelled-popup-request") {
        // Ignore
      } else {
        setError("خطا در ثبت‌نام با گوگل");
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "طرح کسب‌وکار کامل با هوش مصنوعی",
    "نقشه راه اجرایی قدم‌به‌قدم",
    "هویت بصری و برندینگ",
    "مشاور هوشمند ۲۴/۷",
  ];

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-emerald-600 to-primary" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
        
        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <Badge variant="gradient" className="w-fit mb-6 bg-white/10 backdrop-blur-sm border-white/20">
            <Sparkles size={12} />
            شروع رایگان
          </Badge>
          
          <h1 className="text-4xl font-black mb-4">
            سفر کارآفرینی خود را شروع کنید
          </h1>
          
          <p className="text-lg text-white/80 mb-8">
            با ثبت‌نام، به همه امکانات کارنکس دسترسی پیدا می‌کنید
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={14} />
                </div>
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Rocket size={20} />
            </div>
            <span className="text-xl font-black text-foreground">کارنکس</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ساخت حساب کاربری
            </h2>
            <p className="text-muted-foreground">
              حساب دارید؟{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                وارد شوید
              </Link>
            </p>
          </div>

          <Card variant="default" padding="lg">
            {/* Google Signup */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mb-6 gap-3"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              ثبت‌نام با گوگل
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">یا</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
                {error.includes("وارد شوید") && (
                  <Link href="/login" className="underline mr-auto">ورود</Link>
                )}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    placeholder="example@email.com"
                    className={`input-premium pr-10 ${touched.email && !validations.email ? 'border-destructive' : ''}`}
                    required
                    dir="ltr"
                    autoComplete="email"
                    aria-label="ایمیل"
                  />
                  {touched.email && email && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {validations.email ? (
                        <CheckCircle2 size={18} className="text-secondary" />
                      ) : (
                        <AlertCircle size={18} className="text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {touched.email && !validations.email && email && (
                  <p className="text-destructive text-xs mt-1">فرمت ایمیل نامعتبر است</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    placeholder="حداقل ۶ کاراکتر"
                    className="input-premium pr-10 pl-10"
                    required
                    dir="ltr"
                    autoComplete="new-password"
                    aria-label="رمز عبور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div 
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score 
                              ? passwordStrength.color 
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.score <= 1 ? 'text-destructive' 
                      : passwordStrength.score <= 2 ? 'text-amber-500'
                      : 'text-secondary'
                    }`}>
                      قدرت رمز: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  تکرار رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                    placeholder="تکرار رمز عبور"
                    className={`input-premium pr-10 ${touched.confirm && !validations.passwordsMatch ? 'border-destructive' : ''}`}
                    required
                    dir="ltr"
                    autoComplete="new-password"
                    aria-label="تکرار رمز عبور"
                  />
                  {touched.confirm && confirmPassword && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {validations.passwordsMatch ? (
                        <CheckCircle2 size={18} className="text-secondary" />
                      ) : (
                        <AlertCircle size={18} className="text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {touched.confirm && !validations.passwordsMatch && confirmPassword && (
                  <p className="text-destructive text-xs mt-1">رمز عبور مطابقت ندارد</p>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                با ثبت‌نام، با{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  شرایط استفاده
                </Link>{" "}
                و{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  حریم خصوصی
                </Link>{" "}
                موافقت می‌کنید.
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading || !validations.email || !validations.passwordLength || !validations.passwordsMatch}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    در حال ثبت‌نام...
                  </>
                ) : (
                  <>
                    ساخت حساب کاربری
                    <ArrowLeft size={18} />
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
