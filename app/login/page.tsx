"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Clear error when input changes
  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/dashboard/overview");
      router.refresh(); 
    } catch (err: any) {
      console.error("Login Error:", err);
      // NextAuth returns "CredentialsSignin" or custom error string
      if (err.message === "CredentialsSignin" || err.message.includes("credentials")) {
         setError("اطلاعات ورود اشتباه است");
      } else {
         setError("خطا در ورود. لطفاً دوباره تلاش کنید");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    // NextAuth Google Sign In
    await signIn("google", { callbackUrl: "/dashboard/overview" });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implement Forgot Password API for Prisma/NextAuth
      // SupersededSupabase logic
      // await axios.post('/api/auth/forgot-password', { email: resetEmail })
      
      // For now, mock success or show maintenance
      setSuccess("لینک بازیابی به ایمیل شما ارسال شد (نمایشی)");
      setTimeout(() => setShowForgotPassword(false), 3000);
      setResetEmail("");
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      setError("خطا در ارسال ایمیل.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden" dir="rtl">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000" />
      </div>

      {/* Left Side - Visual (Desktop Only) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center text-center p-12 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-secondary opacity-95" />
        <div className="absolute inset-0 pattern-dots opacity-20" />
        
        <div className="relative z-10 max-w-lg">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl flex items-center justify-center mb-8 border border-white/20"
          >
             <Image src="/logo.png" alt="Karnex Logo" width={100} height={100} className="w-24 h-24 object-contain drop-shadow-xl" />
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black mb-6 tracking-tight"
          >
            آینده کسب‌وکار شما <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">
              از اینجا شروع می‌شود
            </span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white/90 leading-relaxed mb-10"
          >
            به هزاران کارآفرین بپیوندید که با هوش مصنوعی کارنکس، ایده‌های خود را به واقعیت تبدیل کرده‌اند.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6"
          >
             <div className="flex -space-x-4 space-x-reverse">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-white/20 backdrop-blur-sm" />
                ))}
             </div>
             <div className="text-right">
                <div className="font-bold text-xl">۸,۰۰۰+</div>
                <div className="text-xs text-white/70">کاربر فعال</div>
             </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10"
      >
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
             <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Image src="/logo.png" alt="Karnex" width={50} height={50} className="object-contain" />
             </div>
             <h2 className="text-2xl font-bold text-foreground">کارنکس</h2>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">خوش آمدید! 👋</h2>
            <p className="text-muted-foreground">برای دسترسی به پنل مدیریت وارد شوید</p>
          </div>

          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden p-6 sm:p-8">
            <div className="space-y-6">
              
              <Button
                variant="outline"
                size="lg"
                className="w-full relative h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <div className="absolute left-4">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span className="font-medium">ورود با حساب گوگل</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">یا ورود با ایمیل</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
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

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">ایمیل</label>
                    <div className="relative group">
                       <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-muted/30 border border-border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                          placeholder="name@example.com"
                          dir="ltr"
                          required
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="text-sm font-medium text-foreground/80">رمز عبور</label>
                       <button
                         type="button"
                         onClick={() => setShowForgotPassword(true)}
                         className="text-xs text-primary hover:underline font-medium"
                       >
                         فراموشی رمز؟
                       </button>
                    </div>
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

                 <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 rounded-xl"
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
              <Link href="/signup" className="text-primary font-bold hover:underline transition-all">
                ثبت‌نام کنید
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
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
                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
              >
                 <X size={20} />
              </button>

              <div className="text-center mb-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Mail size={24} />
                 </div>
                 <h3 className="text-xl font-bold">بازیابی رمز عبور</h3>
                 <p className="text-sm text-muted-foreground mt-2">
                    ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود
                 </p>
              </div>

              {success ? (
                 <div className="bg-green-500/10 text-green-600 text-center p-4 rounded-xl flex flex-col items-center gap-2">
                    <CheckCircle2 size={32} />
                    <span>{success}</span>
                 </div>
              ) : (
                 <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">ایمیل</label>
                       <input 
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-left"
                          placeholder="name@example.com"
                          dir="ltr"
                          required
                       />
                    </div>
                     {error && (
                        <p className="text-sm text-destructive">{error}</p>
                     )}
                    <Button type="submit" className="w-full h-10" disabled={resetLoading}>
                       {resetLoading ? <Loader2 className="animate-spin" /> : "ارسال لینک"}
                    </Button>
                 </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
