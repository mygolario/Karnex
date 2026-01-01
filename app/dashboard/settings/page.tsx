"use client";

import { useAuth } from "@/contexts/auth-context";
import { deleteProject } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Shield, Moon, Bell, Trash2, LogOut, Loader2, Settings, Crown } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-foreground">تنظیمات حساب کاربری</h1>
        <Badge variant="muted" size="sm">
          <Settings size={12} />
          پروفایل
        </Badge>
      </div>

      {/* Profile Card */}
      <Card variant="glass" className="flex items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
          <User size={40} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">کاربر مهمان</h2>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Shield size={16} className="text-secondary" />
            <span className="text-sm font-mono">شناسه: {user?.uid.slice(0, 12)}...</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="info" size="lg">
              طرح رایگان
            </Badge>
            <Button variant="gradient" size="sm">
              <Crown size={14} />
              ارتقا به پرو
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card variant="default" padding="none" className="overflow-hidden">
        {/* Theme Toggle */}
        <div className="p-4 border-b border-border flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <CardIcon variant="primary" className="w-10 h-10">
              <Moon size={18} />
            </CardIcon>
            <div>
              <span className="font-medium text-foreground block">حالت تاریک</span>
              <span className="text-sm text-muted-foreground">تغییر تم ظاهری برنامه</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Email Toggle */}
        <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <CardIcon variant="accent" className="w-10 h-10">
              <Bell size={18} />
            </CardIcon>
            <div>
              <span className="font-medium text-foreground block">دریافت ایمیل‌های آموزشی</span>
              <span className="text-sm text-muted-foreground">نکات رشد کسب‌وکار</span>
            </div>
          </div>
          {/* Custom Toggle */}
          <div className="w-12 h-7 bg-secondary rounded-full relative cursor-pointer">
            <div className="w-5 h-5 bg-white rounded-full absolute top-1 right-1 shadow-sm transition-all" />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card variant="default" className="border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 mb-4">
          <CardIcon variant="primary" className="w-10 h-10 bg-destructive/10 text-destructive">
            <Trash2 size={18} />
          </CardIcon>
          <div>
            <h3 className="text-destructive font-bold">ناحیه خطر</h3>
            <p className="text-destructive/70 text-sm">این اقدامات غیرقابل بازگشت هستند</p>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6">
          اگر می‌خواهید ایده جدیدی را شروع کنید، باید پروژه فعلی را حذف کنید. این کار تمام اطلاعات ذخیره شده در فضای ابری را پاک می‌کند.
        </p>
        
        <Button 
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          loading={isDeleting}
        >
          {!isDeleting && <LogOut size={18} />}
          حذف پروژه و شروع مجدد
        </Button>
      </Card>
    </div>
  );
}
