"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Rocket, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [signedUp, setSignedUp] = useState(false);

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError("");
  }, [email, password, confirmPassword, name]);

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
    return { score: 4, label: "قوی", color: "bg-emerald-500" };
  }, [password]);

  // Validation checks
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

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setLoading(true);

    try {
      // Import the server action dynamically or ensure it's imported at top
      const { signupUser } = await import("@/lib/auth-actions");
      
      const result = await signupUser({
        fullName: name,
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Automatically sign in after signup
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginResult?.error) {
         router.push("/login");
      } else {
         setSignedUp(true);
         // Redirect after a short delay so user sees the success message
         setTimeout(() => router.push("/new-project"), 2500);
      }

    } catch (err: any) {
      console.error("Signup Error:", err);
      if (err.message?.includes("User already exists") || err.message === "User already exists") {
        setError("این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید");
      } else {
        setError("خطا در ثبت‌نام: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    await signIn("google", { callbackUrl: "/new-project" });
  };

  if (signedUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-3xl font-black mb-3">خوش آمدید به کارنکس!</h2>
          <p className="text-muted-foreground">در حال انتقال به داشبورد...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden" dir="rtl">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-40 animate-pulse delay-700" />
      </div>

      {/* Left Side - Visual (Desktop Only) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center text-center p-12 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-secondary via-emerald-600 to-primary opacity-95" />
        <div className="absolute inset-0 pattern-dots opacity-20" />
        
        <div className="relative z-10 max-w-lg">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
           >
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm font-medium">شروع رایگان بدون نیاز به کارت بانکی</span>
           </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black mb-6 tracking-tight leading-tight"
          >
            رویاپردازی کنید، <br/>
            ما <span className="underline decoration-yellow-400/50 decoration-wavy">می‌سازیم</span>
          </motion.h1>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 text-right bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10"
          >
             {[
               "طرح کسب‌وکار کامل با هوش مصنوعی در ۳ دقیقه",
               "نقشه راه اختصاصی و گام‌به‌گام اجرایی",
               "مشاور هوشمند همیشه در دسترس",
               "ابزارهای مالی و حقوقی آماده"
             ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} className="text-emerald-300" />
                   </div>
                   <span className="text-white/90 font-medium">{item}</span>
                </div>
             ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto"
      >
        <div className="w-full max-w-md space-y-6 my-auto">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
             <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Image src="/logo.png" alt="Karnex" width={50} height={50} className="object-contain" />
             </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">ثبت‌نام در کارنکس</h2>
            <p className="text-muted-foreground">همین حالا سفر کارآفرینی خود را آغاز کنید</p>
          </div>

          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden p-6 sm:p-8">
            <div className="space-y-6">
              
              <Button
                variant="outline"
                size="lg"
                className="w-full relative h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                onClick={handleGoogleSignup}
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
                <span className="font-medium">ثبت‌نام با گوگل</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">یا با ایمیل</span>
                </div>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-4">
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

                 {/* Name Input */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">نام و نام خانوادگی</label>
                    <div className="relative group">
                       <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, name: true }))}
                          className={`w-full bg-muted/30 border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                             touched.name && !validations.name ? 'border-destructive' : 'border-border'
                          }`}
                          placeholder="مثال: علی محمدی"
                          required
                       />
                    </div>
                 </div>

                 {/* Email Input */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">ایمیل</label>
                    <div className="relative group">
                       <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, email: true }))}
                          className={`w-full bg-muted/30 border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left ${
                             touched.email && !validations.email ? 'border-destructive' : 'border-border'
                          }`}
                          placeholder="name@example.com"
                          dir="ltr"
                          required
                       />
                    </div>
                 </div>

                 {/* Password Input */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">رمز عبور</label>
                    <div className="relative group">
                       <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-muted/30 border border-border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                          placeholder="حداقل ۶ کاراکتر"
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
                    {/* Password Strength */}
                    <div className="flex gap-1 h-1 mt-2">
                       {[1, 2, 3, 4].map((level) => (
                          <div 
                             key={level}
                             className={`flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength.score ? passwordStrength.color : 'bg-muted'
                             }`}
                          />
                       ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-left dir-ltr">
                       {passwordStrength.label && `Strength: ${passwordStrength.label}`}
                    </p>
                 </div>

                 {/* Confirm Password */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">تکرار رمز عبور</label>
                    <div className="relative group">
                       <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                       <input 
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                          className={`w-full bg-muted/30 border rounded-xl px-10 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left ${
                             touched.confirm && !validations.passwordsMatch ? 'border-destructive' : 'border-border'
                          }`}
                          placeholder="تکرار رمز عبور"
                          dir="ltr"
                          required
                       />
                    </div>
                 </div>

                 <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-secondary to-emerald-600 hover:from-secondary/90 hover:to-emerald-600/90 shadow-lg shadow-secondary/20 rounded-xl"
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
                 با ثبت‌نام، با {" "}
                 <Link href="/terms" className="text-primary hover:underline">شرایط استفاده</Link>
                 {" "} و {" "}
                 <Link href="/privacy" className="text-primary hover:underline">حریم خصوصی</Link>
                 {" "} کارنکس موافقت می‌کنید.
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/50 pt-4">
              حساب کاربری دارید؟{" "}
              <Link href="/login" className="text-secondary font-bold hover:underline transition-all">
                وارد شوید
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
