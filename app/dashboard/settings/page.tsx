"use client";

import { useAuth } from "@/contexts/auth-context";
import { deleteProject } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Shield, Moon, Bell, Trash2, LogOut, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "آیا مطمئن هستید؟ این عملیات غیرقابل بازگشت است و تمام نقشه‌ها و پیشرفت‌های شما پاک خواهد شد."
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteProject(user.uid);
        router.push('/new-project');
      } catch (error) {
        console.error(error);
        alert("خطا در حذف پروژه");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-900">تنظیمات حساب کاربری</h1>

      {/* Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">کاربر مهمان</h2>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <Shield size={16} className="text-emerald-500" />
            <span className="text-sm">شناسه امنیتی: {user?.uid.slice(0, 8)}...</span>
          </div>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            طرح رایگان
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Moon size={20} />
            </div>
            <span className="font-medium text-slate-700">حالت شب (به زودی)</span>
          </div>
          <div className="w-10 h-6 bg-slate-200 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer">
           <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Bell size={20} />
            </div>
            <span className="font-medium text-slate-700">دریافت ایمیل‌های آموزشی</span>
          </div>
          <div className="w-10 h-6 bg-blue-600 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6">
        <h3 className="text-rose-700 font-bold mb-2 flex items-center gap-2">
          <Trash2 size={20} />
          ناحیه خطر
        </h3>
        <p className="text-rose-600/80 text-sm mb-6">
          اگر می‌خواهید ایده جدیدی را شروع کنید، باید پروژه فعلی را حذف کنید. این کار تمام اطلاعات ذخیره شده در فضای ابری را پاک می‌کند.
        </p>
        
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-white border border-rose-200 text-rose-600 px-6 py-3 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm"
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <LogOut size={18} />}
          حذف پروژه و شروع مجدد
        </button>
      </div>
    </div>
  );
}
