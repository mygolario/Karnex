"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
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
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/overview");
    } catch (err: any) {
      setError("ایمیل یا رمز عبور اشتباه است");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard/overview");
    } catch (err: any) {
      setError("خطا در ورود با گوگل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-secondary" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
        
        {/* Floating Shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <Rocket size={40} />
          </div>
          
          <h1 className="text-4xl font-black mb-4">
            خوش آمدید به کارنکس
          </h1>
          
          <p className="text-lg text-white/80 max-w-md mb-8">
            با ورود به حساب کاربری، به داشبورد پروژه‌های خود دسترسی پیدا کنید
          </p>
          
          <div className="flex items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              ۵۰۰+ کارآفرین
            </div>
            <div className="w-1 h-1 bg-white/40 rounded-full" />
            <div>۹۹٪ رضایت</div>
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
              ورود به حساب کاربری
            </h2>
            <p className="text-muted-foreground">
              حساب ندارید؟{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                ثبت‌نام کنید
              </Link>
            </p>
          </div>

          <Card variant="default" padding="lg">
            {/* Google Login */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mb-6"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              ورود با گوگل
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

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl text-center">
                  {error}
                </div>
              )}

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
                    placeholder="example@email.com"
                    className="input-premium pr-10"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

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
                    placeholder="••••••••"
                    className="input-premium pr-10 pl-10"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">مرا به خاطر بسپار</span>
                </label>
                <Link href="/forgot-password" className="text-primary hover:underline">
                  فراموشی رمز عبور
                </Link>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  <>
                    ورود به حساب
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
