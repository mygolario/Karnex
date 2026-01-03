"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/hooks/use-translations";
import { 
  Rocket, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { locale, isRTL } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  const brandName = locale === 'fa' ? 'کارنکس' : 'Karnex';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Labels
  const labels = locale === 'fa' ? {
    freeStart: 'شروع رایگان',
    heroTitle: 'سفر کارآفرینی خود را شروع کنید',
    heroDesc: 'با ثبت‌نام، به همه امکانات کارنکس دسترسی پیدا می‌کنید',
    signupTitle: 'ساخت حساب کاربری',
    hasAccount: 'حساب دارید؟',
    loginLink: 'وارد شوید',
    googleSignup: 'ثبت‌نام با گوگل',
    or: 'یا',
    emailLabel: 'ایمیل',
    passwordLabel: 'رمز عبور',
    confirmLabel: 'تکرار رمز عبور',
    minChars: 'حداقل ۶ کاراکتر',
    passwordStrength: 'قدرت رمز',
    weak: 'ضعیف',
    medium: 'متوسط',
    good: 'خوب',
    strong: 'قوی',
    invalidEmail: 'فرمت ایمیل نامعتبر است',
    passwordMismatch: 'رمز عبور مطابقت ندارد',
    termsText: 'با ثبت‌نام، با',
    terms: 'شرایط استفاده',
    and: 'و',
    privacy: 'حریم خصوصی',
    agree: 'موافقت می‌کنید.',
    signingUp: 'در حال ثبت‌نام...',
    createAccount: 'ساخت حساب کاربری',
    backToHome: '← بازگشت به صفحه اصلی',
    benefits: [
      'طرح کسب‌وکار کامل با هوش مصنوعی',
      'نقشه راه اجرایی قدم‌به‌قدم',
      'هویت بصری و برندینگ',
      'مشاور هوشمند ۲۴/۷',
    ],
  } : {
    freeStart: 'Start Free',
    heroTitle: 'Start Your Entrepreneurship Journey',
    heroDesc: 'Sign up to access all Karnex features',
    signupTitle: 'Create Account',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in',
    googleSignup: 'Sign up with Google',
    or: 'or',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmLabel: 'Confirm Password',
    minChars: 'Minimum 6 characters',
    passwordStrength: 'Password strength',
    weak: 'Weak',
    medium: 'Medium',
    good: 'Good',
    strong: 'Strong',
    invalidEmail: 'Invalid email format',
    passwordMismatch: 'Passwords do not match',
    termsText: 'By signing up, you agree to our',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    agree: '.',
    signingUp: 'Creating account...',
    createAccount: 'Create Account',
    backToHome: '← Back to home',
    benefits: [
      'Complete AI-powered business plan',
      'Step-by-step execution roadmap',
      'Visual identity & branding',
      'Smart 24/7 advisor',
    ],
  };

  // Error messages
  const errorMessages = locale === 'fa' ? {
    mismatch: 'رمز عبور و تکرار آن مطابقت ندارند',
    shortPassword: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    emailExists: 'این ایمیل قبلاً ثبت شده است. آیا می‌خواهید وارد شوید؟',
    invalidEmail: 'فرمت ایمیل نامعتبر است',
    weakPassword: 'رمز عبور باید قوی‌تر باشد',
    generic: 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید',
    googleError: 'خطا در ثبت‌نام با گوگل',
    login: 'ورود',
  } : {
    mismatch: 'Passwords do not match',
    shortPassword: 'Password must be at least 6 characters',
    emailExists: 'This email is already registered. Would you like to sign in?',
    invalidEmail: 'Invalid email format',
    weakPassword: 'Password is too weak',
    generic: 'Error creating account. Please try again',
    googleError: 'Error signing up with Google',
    login: 'Sign in',
  };

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

    if (score <= 1) return { score: 1, label: labels.weak, color: "bg-destructive" };
    if (score <= 2) return { score: 2, label: labels.medium, color: "bg-amber-500" };
    if (score <= 3) return { score: 3, label: labels.good, color: "bg-primary" };
    return { score: 4, label: labels.strong, color: "bg-secondary" };
  }, [password, labels]);

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
      setError(errorMessages.mismatch);
      return;
    }

    if (password.length < 6) {
      setError(errorMessages.shortPassword);
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/new-project");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError(errorMessages.emailExists);
      } else if (err.code === "auth/invalid-email") {
        setError(errorMessages.invalidEmail);
      } else if (err.code === "auth/weak-password") {
        setError(errorMessages.weakPassword);
      } else {
        setError(errorMessages.generic);
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
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      router.push("/new-project");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // User closed popup, no error needed
      } else {
        setError(errorMessages.googleError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-emerald-600 to-primary" />
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <Badge variant="gradient" className="w-fit mb-6 bg-white/10 backdrop-blur-sm border-white/20">
            <Sparkles size={12} />
            {labels.freeStart}
          </Badge>
          
          <h1 className="text-4xl font-black mb-4">
            {labels.heroTitle}
          </h1>
          
          <p className="text-lg text-white/80 mb-8">
            {labels.heroDesc}
          </p>
          
          <div className="space-y-4">
            {labels.benefits.map((benefit, i) => (
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
            <span className="text-xl font-black text-foreground">{brandName}</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {labels.signupTitle}
            </h2>
            <p className="text-muted-foreground">
              {labels.hasAccount}{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {labels.loginLink}
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
              {labels.googleSignup}
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{labels.or}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
                {error.includes(errorMessages.login) && (
                  <Link href="/login" className={`underline ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                    {errorMessages.login}
                  </Link>
                )}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {labels.emailLabel}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    placeholder="example@email.com"
                    className={`input-premium ${isRTL ? 'pr-10' : 'pl-10'} ${touched.email && !validations.email ? 'border-destructive' : ''}`}
                    required
                    dir="ltr"
                    autoComplete="email"
                  />
                  {touched.email && email && (
                    <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}>
                      {validations.email ? (
                        <CheckCircle2 size={18} className="text-secondary" />
                      ) : (
                        <AlertCircle size={18} className="text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {touched.email && !validations.email && email && (
                  <p className="text-destructive text-xs mt-1">{labels.invalidEmail}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {labels.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    placeholder={labels.minChars}
                    className="input-premium px-10"
                    required
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
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
                      {labels.passwordStrength}: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {labels.confirmLabel}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
                    placeholder={labels.confirmLabel}
                    className={`input-premium ${isRTL ? 'pr-10' : 'pl-10'} ${touched.confirm && !validations.passwordsMatch ? 'border-destructive' : ''}`}
                    required
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  {touched.confirm && confirmPassword && (
                    <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}>
                      {validations.passwordsMatch ? (
                        <CheckCircle2 size={18} className="text-secondary" />
                      ) : (
                        <AlertCircle size={18} className="text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {touched.confirm && !validations.passwordsMatch && confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{labels.passwordMismatch}</p>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {labels.termsText}{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  {labels.terms}
                </Link>{" "}
                {labels.and}{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {labels.privacy}
                </Link>{" "}
                {labels.agree}
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
                    {labels.signingUp}
                  </>
                ) : (
                  <>
                    {labels.createAccount}
                    <ArrowIcon size={18} />
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {labels.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
