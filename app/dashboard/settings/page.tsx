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
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-900/20 p-8 md:p-12 flex items-center gap-8">
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 hidden md:flex w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl items-center justify-center border border-white/10 shadow-inner">
           <Settings size={40} className="text-white/80 animate-spin-slow" />
         </div>
         <div className="relative z-10 flex-1">
           <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">تنظیمات</h1>
           <p className="text-white/60 text-lg">مدیریت حساب کاربری و شخصی‌سازی تجربه کارنکس</p>
         </div>
      </div>

      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-3 px-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <User size={20} />
          </div>
          پروفایل کاربری
        </h2>
        
        <Card variant="glass" className="p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-l from-primary/20 to-purple-600/20 opacity-50" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 bg-gradient-to-br from-primary to-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 ring-4 ring-background transform group-hover:scale-105 transition-transform duration-500">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-[2rem] object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-right space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-foreground">
                  {user?.displayName || user?.email?.split('@')[0] || "کاربر مهمان"}
                </h2>
                <Badge variant="success" className="px-3 py-1 shadow-md shadow-emerald-500/20">
                  <Crown size={12} className="mr-1 text-yellow-300" />
                  اشتراک ویژه
                </Badge>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                  <Mail size={16} />
                  <span className="text-sm font-medium">{user?.email || "ایمیل ثبت نشده"}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg opacity-70">
                  <Shield size={16} />
                  <span className="text-xs font-mono">ID: {user?.uid.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[160px]">
              <Button variant="default" size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                <Crown size={18} className="mr-2" />
                مدیریت اشتراک
              </Button>
              <Button variant="outline" className="border-border/50 hover:bg-muted/50">
                ویرایش پروفایل
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Current Project */}
      {activeProject && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-3 px-2">
            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500">
              <Globe size={20} />
            </div>
            پروژه فعال
          </h2>
          
          <Card variant="default" hover="lift" className="flex items-center justify-between p-6 border-l-4 border-l-primary overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/20">
                {activeProject.projectName?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground mb-1">{activeProject.projectName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{activeProject.tagline}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push('/projects')} className="group text-muted-foreground hover:text-foreground">
              تغییر پروژه
              <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Card>
        </section>
      )}

      {/* App Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-3 px-2">
           <div className="bg-purple-500/10 p-2 rounded-xl text-purple-500">
            <Smartphone size={20} />
          </div>
          تنظیمات برنامه
        </h2>

        <Card variant="glass" padding="none" className="overflow-hidden divide-y divide-border/50">
          {/* Theme Toggle */}
          <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                <Moon size={24} />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg block mb-1">حالت تاریک</span>
                <span className="text-sm text-muted-foreground">تغییر تم ظاهری برنامه برای راحتی چشم</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Email Toggle */}
          <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                <Bell size={24} />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg block mb-1">اعلان‌های ایمیلی</span>
                <span className="text-sm text-muted-foreground">دریافت نکات رشد و اخبار جدید کارنکس</span>
              </div>
            </div>
            <button 
              className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${emailNotifications ? 'bg-primary' : 'bg-muted'}`}
              onClick={() => setEmailNotifications(!emailNotifications)}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${emailNotifications ? 'left-1' : 'right-1'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center">
                <Globe size={24} />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg block mb-1">زبان برنامه</span>
                <span className="text-sm text-muted-foreground">انتخاب زبان رابط کاربری</span>
              </div>
            </div>
            <Badge variant="outline" className="text-base px-4 py-1.5">فارسی (IR)</Badge>
          </div>
        </Card>
      </section>

      {/* Account Actions */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-3 px-2">
          <div className="bg-slate-500/10 p-2 rounded-xl text-slate-500">
            <Key size={20} />
          </div>
          اقدامات حساب
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="default" hover="lift" className="cursor-pointer group border-border/60" onClick={handleLogout}>
            <div className="flex items-center gap-5 p-2">
              <div className="w-14 h-14 bg-muted text-muted-foreground group-hover:bg-red-500/10 group-hover:text-red-500 rounded-2xl flex items-center justify-center transition-colors duration-300">
                <LogOut size={24} />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg block mb-1 group-hover:text-red-600 transition-colors">خروج از حساب</span>
                <span className="text-sm text-muted-foreground">پایان نشست کاربری فعلی</span>
              </div>
            </div>
          </Card>

          <Card variant="default" hover="lift" className="cursor-pointer group border-border/60" onClick={() => router.push('/projects')}>
            <div className="flex items-center gap-5 p-2">
              <div className="w-14 h-14 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary rounded-2xl flex items-center justify-center transition-colors duration-300">
                <RefreshCw size={24} />
              </div>
              <div>
                <span className="font-bold text-foreground text-lg block mb-1 group-hover:text-primary transition-colors">مدیریت پروژه‌ها</span>
                <span className="text-sm text-muted-foreground">لیست تمام کسب‌وکارهای شما</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-destructive flex items-center gap-3 px-2">
          <div className="bg-red-500/10 p-2 rounded-xl text-red-500">
            <AlertTriangle size={20} />
          </div>
          ناحیه خطر
        </h2>

        <div className="rounded-[2rem] border border-destructive/30 bg-destructive/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive/50 to-transparent opacity-50" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center shadow-lg shadow-destructive/10">
              <Trash2 size={32} />
            </div>
            <div className="text-center md:text-right flex-1">
              <h3 className="text-xl font-bold text-destructive mb-2">حذف پروژه فعال</h3>
              <p className="text-destructive/80 text-sm leading-6">
                با حذف پروژه <strong className="bg-destructive/10 px-1 rounded mx-1">{activeProject?.projectName}</strong>، 
                تمام اطلاعات شامل نقشه راه، بوم کسب‌وکار و فایل‌های تولید شده 
                <span className="font-bold mx-1">برای همیشه</span> پاک خواهند شد و قابل بازگشت نیستند.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end">
             <Button 
              variant="destructive"
              size="lg"
              className="px-8 shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-shadow"
              onClick={() => setShowDeleteModal(true)}
              disabled={!activeProject}
            >
              <Trash2 size={18} className="mr-2" />
              حذف همیشگی پروژه
            </Button>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-card w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 animate-bounce-gentle">
                <AlertTriangle size={40} className="text-destructive" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">مطمئن هستید؟</h3>
              <p className="text-muted-foreground text-lg">
                آیا می‌خواهید پروژه <strong className="text-foreground border-b-2 border-destructive/30 border-dashed">{activeProject?.projectName}</strong> را حذف کنید؟
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 mb-8 flex gap-3 text-destructive text-sm text-right">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span>این عملیات غیرقابل بازگشت است و تمام داده‌های مربوط به این پروژه فوراً حذف خواهند شد.</span>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-14 text-lg rounded-2xl"
                disabled={isDeleting}
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteCurrentProject}
                className="flex-1 h-14 text-lg rounded-2xl shadow-xl shadow-destructive/20"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    در حال حذف...
                  </>
                ) : (
                  <>
                    حذف پروژه
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="text-center pt-8 border-t border-border/30">
        <p className="text-muted-foreground/60 text-sm font-medium flex items-center justify-center gap-2">
          کارنکس نسخه ۱.۰.۰ بتا 
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          ساخته شده با <span className="text-pink-500 animate-pulse">❤️</span> در ایران
        </p>
      </div>
    </div>
  );
}
