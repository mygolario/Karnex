"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success! AuthContext will pick it up and redirect if we want, or we force it:
      router.push("/dashboard/overview");
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("ایمیل یا رمز عبور اشتباه است.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("دفعات تلاش بیش از حد مجاز. لطفا دقایقی دیگر تلاش کنید.");
      } else {
        setError("خطایی در ورود رخ داد. لطفا دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      
      {/* Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">کارنکس</h1>
        <p className="text-slate-500">ورود به حساب کاربری</p>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        <form onSubmit={handleLogin} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">ایمیل</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all ltr text-left"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">رمز عبور</label>
                <Link href="/reset-password" className="text-xs text-blue-600 hover:underline">فراموشی رمز؟</Link>
             </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all ltr text-left"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ورود به سیستم"}
          </button>

        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
          حساب کاربری ندارید؟{" "}
          <Link href="/new-project" className="text-blue-600 font-bold hover:underline">
            شروع رایگان
          </Link>
        </div>

      </div>

      <div className="mt-8">
        <Link href="/" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft size={16} />
          بازگشت به صفحه اصلی
        </Link>
      </div>

    </div>
  );
}
