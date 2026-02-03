"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, MessageCircle, Send, Sparkles, Loader2,
  Calendar, Gift, Star, Bell, Phone, Mail,
  CheckCircle2, Clock, TrendingUp, Heart, Zap,
  Settings, Play, Pause, Edit3
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  type: "birthday" | "followup" | "loyalty" | "feedback" | "custom";
  message: string;
  isActive: boolean;
  sentCount: number;
  openRate: number;
  triggerDays?: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastVisit: Date;
  totalPurchases: number;
  loyaltyPoints: number;
}

const CAMPAIGN_TYPES = [
  { id: "followup", name: "پیگیری بعد از خرید", icon: MessageCircle, color: "bg-blue-500" },
  { id: "birthday", name: "تبریک تولد", icon: Gift, color: "bg-pink-500" },
  { id: "loyalty", name: "برنامه وفاداری", icon: Heart, color: "bg-red-500" },
  { id: "feedback", name: "درخواست نظر", icon: Star, color: "bg-amber-500" },
  { id: "custom", name: "پیام سفارشی", icon: Send, color: "bg-purple-500" },
];

export default function FollowupPage() {
  const { activeProject: plan } = useProject();
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "پیگیری ۲۴ ساعته",
      type: "followup",
      message: "سلام {name}! ممنون که از ما خرید کردید. نظرتون درباره محصولات چی بود؟",
      isActive: true,
      sentCount: 156,
      openRate: 68,
      triggerDays: 1
    },
    {
      id: "2",
      name: "تبریک تولد",
      type: "birthday",
      message: "تولدت مبارک {name}! 🎂 به مناسبت تولدتون ۲۰٪ تخفیف ویژه داریم.",
      isActive: true,
      sentCount: 45,
      openRate: 82
    },
    {
      id: "3",
      name: "امتیاز وفاداری",
      type: "loyalty",
      message: "عالی {name}! شما {points} امتیاز جمع کردید. فقط {remaining} امتیاز تا جایزه بعدی!",
      isActive: false,
      sentCount: 234,
      openRate: 55
    }
  ]);
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("followup");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    triggerDays: 1
  });

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Users size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پیگیری مشتریان برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleGenerateMessage = async () => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const messages: Record<string, string> = {
        followup: "سلام {name} عزیز! 👋\n\nممنون که {business} رو انتخاب کردید. امیدواریم از خریدتون راضی باشید.\n\nاگه سوالی داشتید، همینجا در خدمتیم! 🙏",
        birthday: "تولدت مبارک {name}! 🎂🎈\n\nاز طرف تیم {business}، بهترین‌ها رو برات آرزو می‌کنیم.\n\n🎁 کد تخفیف ۲۰٪: BIRTHDAY20",
        loyalty: "آفرین {name}! 🌟\n\nشما {points} امتیاز در برنامه وفاداری {business} دارید.\n\n🎯 فقط {remaining} امتیاز تا جایزه بعدی!",
        feedback: "سلام {name}!\n\nنظرتون درباره {business} خیلی برامون مهمه.\n\n⭐ لطفاً با ۱ دقیقه وقت، نظرتون رو ثبت کنید:\n{link}",
        custom: "سلام {name}!\n\nاین پیام از طرف {business} هست.\n\nمتن پیام خود را اینجا وارد کنید..."
      };

      setNewCampaign(prev => ({
        ...prev,
        message: messages[selectedType].replace("{business}", plan?.projectName || "کسب‌وکار شما")
      }));
      
      toast.success("پیام توسط دستیار کارنکس تولید شد");
    } catch (error) {
      toast.error("خطا در تولید پیام");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddCampaign = () => {
    if (!newCampaign.name || !newCampaign.message) {
      toast.error("نام و متن پیام الزامی است");
      return;
    }

    const campaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampaign.name,
      type: selectedType as any,
      message: newCampaign.message,
      isActive: true,
      sentCount: 0,
      openRate: 0,
      triggerDays: newCampaign.triggerDays
    };

    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({ name: "", message: "", triggerDays: 1 });
    setIsAddingCampaign(false);
    toast.success("کمپین ایجاد شد");
  };

  const toggleCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const avgOpenRate = campaigns.length > 0 
    ? Math.round(campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length)
    : 0;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">پیگیری مشتریان</h1>
              <p className="text-muted-foreground">کمپین‌های خودکار پیامک و واتساپ</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsAddingCampaign(true)}
          className="gap-2 bg-gradient-to-r from-primary to-secondary"
        >
          <Zap size={18} />
          کمپین جدید
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "کل پیام‌های ارسالی", value: totalSent, icon: Send, color: "text-blue-500" },
          { label: "کمپین‌های فعال", value: activeCampaigns, icon: Play, color: "text-emerald-500" },
          { label: "نرخ بازدید", value: `${avgOpenRate}%`, icon: TrendingUp, color: "text-amber-500" },
          { label: "مشتریان وفادار", value: "۱۲۳", icon: Heart, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">کمپین‌های شما</h2>
        
        {campaigns.map((campaign) => {
          const typeInfo = CAMPAIGN_TYPES.find(t => t.id === campaign.type);
          return (
            <Card key={campaign.id} className="overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${typeInfo?.color} flex items-center justify-center`}>
                  {typeInfo && <typeInfo.icon className="w-6 h-6 text-white" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{campaign.name}</h3>
                    <Badge variant={campaign.isActive ? "default" : "secondary"}>
                      {campaign.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{campaign.message}</p>
                </div>

                <div className="hidden md:flex items-center gap-6 text-center">
                  <div>
                    <p className="text-lg font-bold">{campaign.sentCount}</p>
                    <p className="text-xs text-muted-foreground">ارسال شده</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-500">{campaign.openRate}%</p>
                    <p className="text-xs text-muted-foreground">نرخ بازدید</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCampaign(campaign.id)}
                    className={campaign.isActive ? "text-amber-500" : "text-emerald-500"}
                  >
                    {campaign.isActive ? <Pause size={18} /> : <Play size={18} />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit3 size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" />
          کمپین‌های پیشنهادی دستیار کارنکس
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "یادآوری سبد خرید", desc: "به مشتریانی که خرید ناتمام دارند" },
            { title: "تخفیف مشتری جدید", desc: "خوش‌آمدگویی به مشتریان جدید" },
            { title: "نظرسنجی ماهانه", desc: "بهبود خدمات با نظرات مشتریان" },
          ].map((suggestion, i) => (
            <button
              key={i}
              className="p-4 bg-card border border-border rounded-xl text-right hover:border-primary/50 transition-colors"
              onClick={() => {
                setNewCampaign(prev => ({ ...prev, name: suggestion.title }));
                setIsAddingCampaign(true);
              }}
            >
              <h4 className="font-bold text-sm mb-1">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground">{suggestion.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Add Campaign Modal */}
      <AnimatePresence>
        {isAddingCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddingCampaign(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                ایجاد کمپین جدید
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع کمپین</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CAMPAIGN_TYPES.slice(0, 3).map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedType === type.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center mx-auto mb-2`}>
                          <type.icon size={20} className="text-white" />
                        </div>
                        <p className="text-xs font-medium">{type.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">نام کمپین *</label>
                  <input
                    className="input-premium w-full"
                    value={newCampaign.name}
                    onChange={e => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: پیگیری بعد از خرید"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">متن پیام *</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateMessage}
                      disabled={isGeneratingAI}
                      className="gap-1 text-primary"
                    >
                      {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      تولید با AI
                    </Button>
                  </div>
                  <textarea
                    className="input-premium w-full min-h-[120px]"
                    value={newCampaign.message}
                    onChange={e => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="متن پیام خود را وارد کنید...&#10;از {name} برای نام مشتری استفاده کنید"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    متغیرها: {"{name}"}, {"{phone}"}, {"{points}"}
                  </p>
                </div>

                {selectedType === "followup" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">ارسال بعد از چند روز؟</label>
                    <input
                      type="number"
                      className="input-premium w-full"
                      value={newCampaign.triggerDays}
                      onChange={e => setNewCampaign(prev => ({ ...prev, triggerDays: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={30}
                      dir="ltr"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddingCampaign(false)} className="flex-1">
                    انصراف
                  </Button>
                  <Button onClick={handleAddCampaign} className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    ایجاد کمپین
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
