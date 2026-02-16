"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { updateUserProfile } from "@/lib/db";
import { getUserTransactions } from "@/lib/payment-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  CreditCard,
  Shield,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Camera,
  Sparkles,
  ChevronLeft,
  Lock,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Link from "next/link";

export default function ProfilePage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isActiveTab, setIsActiveTab] = useState<
    "profile" | "subscription" | "security"
  >("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthDate: "",
    bio: "",
  });
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (user?.id) {
        setLoadingTransactions(true);
        getUserTransactions(user.id)
            .then(data => setTransactions(data))
            .catch(err => console.error("Failed to load transactions", err))
            .finally(() => setLoadingTransactions(false));
    }
  }, [user?.id]);
  


  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        phoneNumber: userProfile.phone_number || "",
        birthDate: userProfile.birth_date || "",
        bio: userProfile.bio || "",
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await updateUserProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        birth_date: formData.birthDate,
        bio: formData.bio,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      await refreshProfile();
      toast.success("پروفایل شما با موفقیت بروزرسانی شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره تغییرات");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );

  const sidebarItems = [
    { id: "profile", label: "اطلاعات شخصی", icon: User },
    { id: "subscription", label: "اشتراک و پرداخت", icon: CreditCard },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-2xl shadow-indigo-900/20 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-inner group">
          <User
            size={40}
            className="text-white/90 group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="relative z-10 flex-1 text-center md:text-right">
          <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
            حساب کاربری
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            اطلاعات شخصی، جزئیات اشتراک و تنظیمات امنیتی خود را مدیریت کنید.
          </p>
        </div>


        <div className="hidden md:block relative z-10">
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <Sparkles size={18} className="text-yellow-300 animate-pulse" />
            <span className="font-bold text-sm">
              عضویت{" "}
              {userProfile.subscription.planId === "pro" 
                ? "ویژه" 
                : userProfile.subscription.planId === "plus" 
                    ? "پلاس" 
                    : "پایه"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-4">
          <Card
            variant="glass"
            className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/20 dark:border-white/5 sticky top-24"
          >
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIsActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActiveTab === item.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={`relative z-10 ${isActiveTab === item.id ? "animate-bounce-gentle" : ""}`}
                  />
                  <span className="font-bold relative z-10 text-sm">
                    {item.label}
                  </span>
                  {isActiveTab === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                </button>
              ))}
            </div>
          </Card>


        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* PROFILE TAB */}
          {isActiveTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card variant="glass" className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-transparent opacity-50" />

                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !user?.id) return;

                            // Limit size to 2MB
                            if (file.size > 2 * 1024 * 1024) {
                                toast.error("حجم تصویر نباید بیشتر از 2 مگابایت باشد");
                                return;
                            }

                            const loadingToast = toast.loading("در حال آپلود تصویر...");
                            try {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                    const base64String = reader.result as string;
                                    if (!user?.id) return;
                                    await updateUserProfile(user.id, {
                                        avatar_url: base64String
                                    });
                                    await refreshProfile();
                                    toast.dismiss(loadingToast);
                                    toast.success("تصویر پروفایل بروزرسانی شد");
                                };
                                reader.readAsDataURL(file);
                            } catch (error) {
                                console.error(error);
                                toast.dismiss(loadingToast);
                                toast.error("خطا در آپلود تصویر");
                            }
                        }}
                    />
                    <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-500/30 transform group-hover:scale-105 transition-all duration-300 ring-4 ring-background overflow-hidden">
                      {userProfile.avatar_url ? (
                          <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          userProfile.first_name?.[0] ||
                          user?.email?.[0]?.toUpperCase() ||
                          "U"
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-[2rem] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                      <Camera size={32} className="text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-xl border border-border shadow-sm">
                      <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-right space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <h2 className="text-2xl font-black text-foreground">
                        {user?.email || "کاربر مهمان"}
                      </h2>
                      <Badge
                        variant={
                          userProfile.subscription.planId === "pro" || userProfile.subscription.planId === "plus"
                            ? "default"
                            : "secondary"
                        }
                        className="px-2 py-0.5"
                      >
                         {userProfile.subscription.planId === "free"
                          ? "اشتراک پایه"
                          : userProfile.subscription.planId === "plus"
                            ? "کاربر پلاس"
                            : "کاربر ویژه"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm">
                      <Shield size={14} className="text-primary" />
                      شناسه کاربر:{" "}
                      <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                        {user?.id?.slice(0, 12)}...
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 pr-1">
                      نام کوچک
                    </label>
                    <input
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-background/80 hover:border-primary/30 focus:border-primary"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="نام خود را وارد کنید"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 pr-1">
                      نام خانوادگی
                    </label>
                    <input
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-background/80 hover:border-primary/30 focus:border-primary"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="نام خانوادگی"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 pr-1">
                      شماره تماس
                    </label>
                    <input
                      className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-background/80 hover:border-primary/30 focus:border-primary text-left"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="0912..."
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 pr-1">
                      تاریخ تولد
                    </label>
                    <div className="relative">
                      <DatePicker
                        value={formData.birthDate}
                        onChange={(date: any) =>
                          setFormData({
                            ...formData,
                            birthDate: date ? date.toString() : "",
                          })
                        }
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        inputClass="flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-background/80 hover:border-primary/30 focus:border-primary"
                        containerClassName="w-full"
                        placeholder="تاریخ تولد خود را انتخاب کنید"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-foreground/80 pr-1">
                      درباره من
                    </label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-background/80 hover:border-primary/30 focus:border-primary resize-none"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="مختصری درباره تخصص‌ها و علایق خود بنویسید..."
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} className="mr-2" />
                    )}
                    ذخیره تغییرات
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {isActiveTab === "subscription" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card
                variant="gradient"
                className="text-white relative overflow-hidden border-none shadow-2xl shadow-primary/20"
              >
                <div className="relative z-10 p-2">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-lg font-medium opacity-80 mb-1">
                        طرح فعال فعلی
                      </h3>
                      <div className="text-4xl font-black tracking-tight">
                        {userProfile.subscription.planId === "free"
                          ? "رایگان"
                          : userProfile.subscription.planId === "plus"
                            ? "پلاس"
                            : "حرفه‌ای"}
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                      <Sparkles size={24} className="text-yellow-300" />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                    <div className="space-y-1">
                      <div className="text-sm opacity-70">وضعیت اشتراک</div>
                      <div className="font-mono text-lg tracking-widest opacity-90">
                         {userProfile.subscription.planId === "pro" 
                            ? "PLAN-PRO-ACTIVE" 
                            : userProfile.subscription.planId === "plus"
                                ? "PLAN-PLUS-ACTIVE"
                                : "PLAN-BASIC"}
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm font-medium bg-black/20 p-2 rounded-xl backdrop-blur-sm self-start md:self-auto">
                      <div className="flex items-center gap-2 px-2">
                        <div
                          className={`w-2 h-2 rounded-full ${userProfile.subscription.status === "active" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" : "bg-red-400"}`}
                        />
                        {userProfile.subscription.status === "active"
                          ? "فعال"
                          : "منقضی"}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center pointer-events-none" />
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/pricing" className="block w-full">
                    <Button
                    variant="outline"
                    className="h-14 w-full rounded-2xl text-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                    <CreditCard size={20} className="mr-2" />
                    تغییر طرح اشتراک
                    </Button>
                </Link>

              </div>

              <Card variant="default" className="overflow-hidden">
                <div className="p-6 border-b border-border/50 flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    تاریخچه تراکنش‌ها
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    ۳۰ روز گذشته
                  </Badge>
                </div>

                {/* Transactions List */}
                <div className="bg-white dark:bg-slate-950">
                    {loadingTransactions ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            tx.status === 'completed' ? 'bg-green-100 text-green-600' : 
                                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {tx.status === 'completed' ? <CheckCircle2 size={18} /> : 
                                             tx.status === 'pending' ? <Clock size={18} /> : 
                                             <AlertTriangle size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">
                                                {tx.description || "پرداخت اشتراک"}
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">
                                            {new Intl.NumberFormat("fa-IR").format(tx.amount / 10)} تومان
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {tx.refId || "-"}
                                        </div>
                                    </div>
                                    <div className="mr-4">
                                         {/* Only show receipt link for completed transactions */}
                                         {tx.status === 'completed' && (
                                            <a href={`/payment/receipt/${tx.id}`} className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors">
                                                مشاهده رسید
                                            </a>
                                         )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                <Clock size={40} className="text-muted-foreground" />
                            </div>
                            <h4 className="font-bold text-foreground mb-1">
                                هیچ تراکنشی یافت نشد
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                شما هنوز هیچ پرداخت موفقی در سیستم ثبت نکرده‌اید.
                            </p>
                        </div>
                    )}
                </div>
              </Card>
            </div>
          )}


        </div>
      </div>

      </div>



  );
}
