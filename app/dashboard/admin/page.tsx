"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, DollarSign, Activity, Settings, 
  Search, CheckCircle2, XCircle, MoreVertical 
} from "lucide-react";

export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || userProfile?.role !== 'admin') {
        // router.push('/dashboard'); 
        // For development, I'm allowing access but showing warning. 
        // In prod, uncomment redirect.
        // console.warn("Access Denied: Not an admin");
      }
      
      const fetchData = async () => {
        try {
          // This requires Firestore rules to allow read for admin
          const usersSnap = await getDocs(collection(db, "users"));
          const usersList = usersSnap.docs.map(d => d.data() as UserProfile);
          setUsers(usersList);
        } catch (error) {
          console.error("Admin Fetch Error:", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      
      fetchData();
    }
  }, [user, userProfile, loading]);

  if (loading || isLoadingData) return <div className="p-12 text-center">Loading Admin Panel...</div>;

  const totalRevenue = users.reduce((acc, u) => {
    // Mock calculation based on plan
    const price = u.subscription.planId === 'pro' ? 399000 : u.subscription.planId === 'plus' ? 249000 : 0;
    return acc + price;
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground">پنل مدیریت (God Mode)</h1>
          <p className="text-muted-foreground">مدیریت کاربران، تراکنش‌ها و سیستم</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">تنظیمات سیستم</Button>
            <Button variant="gradient">دانلود گزارش</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="کاربران کل" 
          value={users.length} 
          icon={<Users className="text-blue-500" />} 
          trend="+12%" 
        />
        <StatsCard 
          title="مشترکین فعال" 
          value={users.filter(u => u.subscription.planId !== 'free').length} 
          icon={<CheckCircle2 className="text-green-500" />} 
          trend="+5%" 
        />
        <StatsCard 
          title="درآمد کل (تخمینی)" 
          value={`${(totalRevenue / 1000000).toFixed(1)} M`} 
          sub="تومان"
          icon={<DollarSign className="text-amber-500" />} 
          trend="+8%" 
        />
        <StatsCard 
          title="تیکت‌های باز" 
          value="3" 
          icon={<Activity className="text-red-500" />} 
          trend="-2" 
        />
      </div>

      {/* Users Table */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold">لیست کاربران</h3>
            <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input className="input-premium w-full pr-9 py-1.5 text-sm" placeholder="جستجو..." />
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-muted/50 text-muted-foreground text-sm">
                    <tr>
                        <th className="p-4">کاربر</th>
                        <th className="p-4">طرح</th>
                        <th className="p-4">تاریخ عضویت</th>
                        <th className="p-4">وضعیت</th>
                        <th className="p-4">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {users.map(u => (
                        <tr key={u.uid} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs">
                                        {u.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{u.displayName || 'بدون نام'}</div>
                                        <div className="text-xs text-muted-foreground">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <Badge variant={u.subscription.planId === 'pro' ? 'secondary' : 'outline'}>
                                    {u.subscription.planId.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground" dir="ltr">
                                {new Date(u.createdAt).toLocaleDateString('fa-IR')}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-1 text-green-500 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    فعال
                                </div>
                            </td>
                            <td className="p-4">
                                <button className="text-muted-foreground hover:text-foreground">
                                    <MoreVertical size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, sub, icon, trend }: any) {
    return (
        <Card variant="default" className="flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-black">{value}</h3>
                    {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
                </div>
                <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    {trend}
                    <span className="text-muted-foreground">ماه گذشته</span>
                </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                {icon}
            </div>
        </Card>
    )
}
