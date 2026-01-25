"use client";

import React, { useState } from "react";
import { useAccountUpgrade } from "@/components/auth/use-account-upgrade";
import { AlertTriangle, ShieldCheck, Lock, X, Loader2 } from "lucide-react";

interface ClaimAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimAccountModal({ isOpen, onClose }: ClaimAccountModalProps) {
  const { upgradeToEmail, loading } = useAccountUpgrade();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await upgradeToEmail(email, password);
      // Only show success if we actually got a user back
      if (user) {
        setIsSuccess(true);
        setTimeout(() => {
            onClose();
            setIsSuccess(false);
        }, 2500);
      }
    } catch (err) {
      // Should not be reached often now, but safety first
      console.error("Modal Submit Error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans" dir="rtl">
      
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-bold tracking-wide">حساب کاربری مهمان (ذخیره نشده)</span>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
             </button>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">کسب‌وکارتان را از دست ندهید</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            شما در حال استفاده از حساب مهمان هستید. اگر مرورگر را ببندید، اطلاعات شما پاک خواهد شد. برای ذخیره دائمی، ثبت نام کنید.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in duration-300">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-bold text-xl text-green-700">حساب شما ایمن شد</h3>
                <p className="text-sm text-gray-500">اطلاعات کسب‌وکار شما با موفقیت ذخیره گردید.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block text-right">آدرس ایمیل</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-left ltr focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 block text-right">رمز عبور</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left ltr focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold h-12 rounded-lg transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ذخیره سازی...</span>
                    </>
                  ) : (
                    "ذخیره پیشرفت من"
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3 w-3" />
                  <span>رمزنگاری شده و امن</span>
                </div>
              </div>
            <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  قبلاً حساب دارید؟{' '}
                  <a href="/login" className="text-blue-600 font-bold hover:underline">
                    وارد شوید
                  </a>
                  {' '}(توجه: پروژه فعلی ذخیره نمی‌شود)
                </p>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
