"use client";

import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { deleteProject } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  User, Shield, Moon, Bell, Trash2, LogOut, Settings, Crown, 
  Mail, Key, Globe, Smartphone, Download, RefreshCw, AlertTriangle, 
  Check, X, ChevronLeft
} from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const { user } = useAuth();
  const { activeProject, refreshProjects } = useProject();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteCurrentProject = async () => {
    if (!user || !activeProject?.id) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(user.uid, activeProject.id);
      if (refreshProjects) await refreshProjects();
      router.push('/projects');
    } catch (error) {
      console.error(error);
      alert("خطا در حذف پروژه");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">تنظیمات</h1>
          <p className="text-muted-foreground text-sm">مدیریت حساب و تنظیمات برنامه</p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <User size={18} />
          پروفایل کاربری
        </h2>
        
        <Card variant="default" className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {user?.displayName || user?.email?.split('@')[0] || "کاربر مهمان"}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail size={14} />
              <span className="text-sm">{user?.email || "ایمیل ثبت نشده"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Shield size={14} className="text-secondary" />
              <span className="text-xs font-mono">ID: {user?.uid.slice(0, 12)}...</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="info" size="lg">
              طرح رایگان
            </Badge>
            <Button variant="gradient" size="sm">
              <Crown size={14} />
              ارتقا به پرو
            </Button>
          </div>
        </Card>
      </section>

      {/* Current Project */}
      {activeProject && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe size={18} />
            پروژه فعال
          </h2>
          
          <Card variant="muted" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-xl font-bold">
                {activeProject.projectName?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{activeProject.projectName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{activeProject.tagline}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
              تغییر پروژه
              <ChevronLeft size={14} />
            </Button>
          </Card>
        </section>
      )}

      {/* App Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Smartphone size={18} />
          تنظیمات برنامه
        </h2>

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
          <div className="p-4 border-b border-border flex justify-between items-center hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <CardIcon variant="accent" className="w-10 h-10">
                <Bell size={18} />
              </CardIcon>
              <div>
                <span className="font-medium text-foreground block">اعلان‌های ایمیلی</span>
                <span className="text-sm text-muted-foreground">نکات و آموزش‌های رشد کسب‌وکار</span>
              </div>
            </div>
            <button 
              className={`w-12 h-7 rounded-full relative transition-colors ${emailNotifications ? 'bg-primary' : 'bg-muted'}`}
              onClick={() => setEmailNotifications(!emailNotifications)}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${emailNotifications ? 'left-1' : 'right-1'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <CardIcon variant="secondary" className="w-10 h-10">
                <Globe size={18} />
              </CardIcon>
              <div>
                <span className="font-medium text-foreground block">زبان برنامه</span>
                <span className="text-sm text-muted-foreground">انتخاب زبان رابط کاربری</span>
              </div>
            </div>
            <Badge variant="muted">فارسی</Badge>
          </div>
        </Card>
      </section>

      {/* Account Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Key size={18} />
          اقدامات حساب
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Card variant="default" hover="lift" className="cursor-pointer" onClick={handleLogout}>
            <div className="flex items-center gap-3">
              <CardIcon variant="muted" className="w-10 h-10">
                <LogOut size={18} />
              </CardIcon>
              <div>
                <span className="font-medium text-foreground block">خروج از حساب</span>
                <span className="text-sm text-muted-foreground">از حساب کاربری خارج شوید</span>
              </div>
            </div>
          </Card>

          <Card variant="default" hover="lift" className="cursor-pointer" onClick={() => router.push('/projects')}>
            <div className="flex items-center gap-3">
              <CardIcon variant="primary" className="w-10 h-10">
                <RefreshCw size={18} />
              </CardIcon>
              <div>
                <span className="font-medium text-foreground block">مدیریت پروژه‌ها</span>
                <span className="text-sm text-muted-foreground">مشاهده و حذف پروژه‌ها</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
          <AlertTriangle size={18} />
          ناحیه خطر
        </h2>

        <Card variant="default" className="border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3 mb-4">
            <CardIcon variant="primary" className="w-10 h-10 bg-destructive/10 text-destructive">
              <Trash2 size={18} />
            </CardIcon>
            <div>
              <h3 className="text-destructive font-bold">حذف پروژه فعال</h3>
              <p className="text-destructive/70 text-sm">این اقدام غیرقابل بازگشت است</p>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-6">
            با حذف پروژه، تمام اطلاعات شامل نقشه راه، بوم کسب‌وکار، هویت بصری و پیشرفت‌های شما پاک خواهد شد.
          </p>
          
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
            disabled={!activeProject}
          >
            <Trash2 size={16} />
            حذف پروژه فعال
          </Button>
        </Card>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <Card 
            variant="default" 
            padding="lg" 
            className="max-w-md w-full animate-in zoom-in-95"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">تأیید حذف</h3>
                <p className="text-sm text-muted-foreground">این عملیات قابل بازگشت نیست</p>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="mr-auto text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-muted-foreground mb-6">
              آیا مطمئن هستید که می‌خواهید پروژه <strong className="text-foreground">"{activeProject?.projectName}"</strong> را حذف کنید؟
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={isDeleting}
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCurrentProject}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    در حال حذف...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    حذف پروژه
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* App Info */}
      <Card variant="muted" className="text-center">
        <p className="text-muted-foreground text-sm">
          کارنکس نسخه ۱.۰.۰ بتا • ساخته شده با ❤️ در ایران
        </p>
      </Card>
    </div>
  );
}
