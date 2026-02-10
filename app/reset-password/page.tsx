"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      setError("لینک بازیابی نامعتبر است.");
      return;
    }

    // Verify the code on load
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setVerifying(false);
      })
      .catch((err) => {
        console.error("Verification Error:", err);
        setVerifying(false);
        setError("لینک بازیابی منقضی شده یا نامعتبر است.");
      });
  }, [oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }

    if (password.length < 6) {
        setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
        return;
    }

    setLoading(true);
    setError("");

    try {
      if (!oobCode) throw new Error("Missing code");
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      console.error("Reset Error:", err);
      setError("خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-80" />
        <p className="text-lg">در حال بررسی لینک...</p>
      </div>
    );
  }

  if (!oobCode) {
     return (
        <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card/50 backdrop-blur-md border border-white/10 shadow-2xl">
           <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
              <AlertCircle size={32} />
           </div>
           <div>
              <h2 className="text-2xl font-bold mb-2">لینک نامعتبر</h2>
              <p className="text-muted-foreground">
                 لینک بازیابی رمز عبور وجود ندارد یا یافت نشد.
              </p>
           </div>
           <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
              بازگشت به ورود
           </Button>
        </Card>
     )
  }

  if (error && !email) { // Error during verification
    return (
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card/50 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
          <AlertCircle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">لینک منقضی شده</h2>
          <p className="text-muted-foreground">
            {error}
          </p>
        </div>
        <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
          بازگشت به ورود
        </Button>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card/50 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">تغییر رمز موفق</h2>
          <p className="text-muted-foreground">
            رمز عبور شما با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...
          </p>
        </div>
        <Button onClick={() => router.push("/login")} className="w-full bg-primary hover:bg-primary/90">
            ورود به حساب
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full p-6 sm:p-8 bg-card/50 backdrop-blur-md border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
          <KeyRound size={24} />
        </div>
        <h1 className="text-2xl font-bold mb-2">تغییر رمز عبور</h1>
        <p className="text-sm text-muted-foreground">
          برای ایمیل <span className="font-semibold text-foreground">{email}</span> یک رمز عبور جدید تنظیم کنید
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">رمز عبور جدید</label>
            <div className="relative group">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                placeholder="••••••••"
                dir="ltr"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">تکرار رمز عبور</label>
            <div className="relative group">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                placeholder="••••••••"
                dir="ltr"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 rounded-xl mt-6"
          disabled={loading}
        >
          {loading ? (
             <Loader2 className="animate-spin" />
          ) : (
             <span className="flex items-center gap-2 text-base">
                تغییر رمز عبور
                <ArrowLeft size={18} />
             </span>
          )}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden relative" dir="rtl">
        {/* Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        <div className="w-full flex items-center justify-center p-4 relative z-10">
          <Suspense fallback={<Loader2 className="animate-spin text-primary" />}>
            <ResetPasswordContent />
          </Suspense>
        </div>
    </div>
  );
}
