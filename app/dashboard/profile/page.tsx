"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { updateUserProfile } from "@/lib/db"; // You need to export this from db.ts
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, CreditCard, Shield, Clock, 
  MapPin, Mail, Phone, Calendar, 
  CheckCircle2, AlertTriangle, Loader2 
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isActiveTab, setIsActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phoneNumber: userProfile.phoneNumber || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio
      });
      await refreshProfile();
      toast.success("پروفایل با موفقیت بروزرسانی شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره تغییرات");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">حساب کاربری</h1>
        <p className="text-muted-foreground">مدیریت اطلاعات شخصی، اشتراک و امنیت</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setIsActiveTab('profile')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActiveTab === 'profile' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <User size={18} />
            اطلاعات شخصی
          </button>
          <button 
            onClick={() => setIsActiveTab('subscription')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActiveTab === 'subscription' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <CreditCard size={18} />
            اشتراک و پرداخت
          </button>
          <button 
            onClick={() => setIsActiveTab('security')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActiveTab === 'security' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <Shield size={18} />
            امنیت و ورود
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PROFILE TAB */}
          {isActiveTab === 'profile' && (
            <Card variant="default" padding="lg" className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {userProfile.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.email || 'کاربر'}</h2>
                  <Badge variant={userProfile.subscription.planId === 'pro' ? 'secondary' : 'default'} className="mt-1">
                    {userProfile.subscription.planId === 'free' ? 'کاربر عادی' : 'کاربر ویژه'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نام</label>
                  <input 
                    className="input-premium w-full" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">نام خانوادگی</label>
                  <input 
                    className="input-premium w-full"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="نام خانوادگی"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">شماره موبایل</label>
                  <input 
                    className="input-premium w-full"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="0912..."
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاریخ تولد</label>
                  <input 
                    type="date"
                    className="input-premium w-full"
                    disabled
                    placeholder="به زودی"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">درباره من</label>
                <textarea 
                  className="input-premium w-full min-h-[100px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="مختصری درباره خود بنویسید..."
                />
              </div>

              <div className="flex justify-end">
                <Button variant="gradient" onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} className="mr-2" />}
                  ذخیره تغییرات
                </Button>
              </div>
            </Card>
          )}

          {/* SUBSCRIPTION TAB */}
          {isActiveTab === 'subscription' && (
            <div className="space-y-6">
              <Card variant="gradient" className="text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold opacity-90 mb-1">طرح فعلی شما</h3>
                  <div className="text-3xl font-black mb-4">
                    {userProfile.subscription.planId === 'free' ? 'رایگان' : 
                     userProfile.subscription.planId === 'plus' ? 'پلاس' : 'حرفه‌ای'}
                  </div>
                  <div className="flex gap-4 text-sm opacity-80">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {userProfile.subscription.status === 'active' ? 'فعال' : 'منقضی'}
                    </div>
                    {userProfile.subscription.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        تا {new Date(userProfile.subscription.endDate).toLocaleDateString('fa-IR')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              </Card>

              <Card variant="default">
                <h3 className="font-bold mb-4">تاریخچه تراکنش‌ها</h3>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock size={40} className="mx-auto mb-2 opacity-20" />
                  <p>هیچ تراکنشی یافت نشد</p>
                </div>
              </Card>
            </div>
          )}

          {/* SECURITY TAB */}
          {isActiveTab === 'security' && (
            <Card variant="default" padding="lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                تغییر رمز عبور
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                برای تغییر رمز عبور، یک ایمیل بازیابی ارسال خواهد شد.
              </p>
              <Button variant="outline">ارسال لینک تغییر رمز</Button>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
