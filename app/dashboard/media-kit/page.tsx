"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { MediaKit, saveMediaKit } from "@/lib/db";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  UserCheck, Download, Share2, Eye, Instagram, 
  Youtube, Twitter, Mail, Globe, MapPin, 
  BarChart3, CheckCircle2, TrendingUp, Sparkles,
  LayoutTemplate, Palette, Save, Briefcase, Plus, Trash2,
  Linkedin, Github, MonitorPlay, Users, DollarSign
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: MonitorPlay,
  twitch: MonitorPlay,
  other: Globe
};

const DEFAULT_MEDIA_KIT: MediaKit = {
  displayName: "",
  bio: "",
  contactEmail: "",
  niche: "",
  themeColor: "#7c3aed",
  socialStats: [],
  services: [],
  partners: [],
  audience: {
    male: 50,
    female: 50,
    topAge: "18-34",
    topLocations: []
  },
  globalStats: {
    totalFollowers: 0,
    avgEngagement: 0,
    monthlyReach: 0
  }
};

export default function MediaKitPage() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();
  const [data, setData] = useState<MediaKit>(DEFAULT_MEDIA_KIT);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [template, setTemplate] = useState<"modern" | "minimal" | "bold">("modern");
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Load Initial Data
  useEffect(() => {
    if (plan?.mediaKit) {
      setData(plan.mediaKit);
    } else if (plan) {
      // Pre-fill from plan if no kit exists
      setData({
        ...DEFAULT_MEDIA_KIT,
        displayName: plan.projectName || "",
        niche: plan.brandCanvas?.niche || "",
      });
    }
  }, [plan]);

  // Actions
  const handleSave = async () => {
    if (!plan) return;
    setIsSaving(true);
    try {
      // Create updates object
      const updates = { mediaKit: data };
      
      // Update Context & Cloud (via context's new capability)
      await updateActiveProject(updates);
      
      // Explicitly save to ensure specific collection update if needed (context does plan update, this is specific field)
      // Actually context is enough if it saves the whole plan, but for safety with sub-collections:
      if (plan.id && user) {
        await saveMediaKit(user.id, data, plan.id);
      }
      
      toast.success("مدیاکیت ذخیره شد");
    } catch (e) {
      console.error(e);
      toast.error("خطا در ذخیره سازی");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnhanceBio = async () => {
    if (!data.bio && !data.niche) {
        toast.error("لطفا ابتدا بایو یا نیش خود را بنویسید");
        return;
    }
    setIsGeneratingBio(true);
    try {
        const prompt = `Rewrite this creator bio to be professional, punchy, and attractive for sponsors.
        Niche: ${data.niche}
        Current Bio: ${data.bio || "No bio yet"}
        Name: ${data.displayName}
        Context: Media Kit for brand deals.
        Output Language: Persian.`;

        const res = await fetch("/api/ai-generate", {
            method: "POST",
            body: JSON.stringify({ prompt, systemPrompt: "You are an expert copywriter for influencers." })
        });
        const json = await res.json();
        if (json.success) {
            setData(prev => ({ ...prev, bio: json.content }));
            toast.success("بایو جدید پیشنهاد شد (می‌توانید ویرایش کنید)");
        }
    } catch (e) {
        toast.error("خطا در ارتباط با کارنکس");
    } finally {
        setIsGeneratingBio(false);
    }
  };

  const handleExport = () => {
     // Switch to preview tab first
     setActiveTab("preview");
     setTimeout(() => {
         window.print();
     }, 500);
  };

  // Helper Inputs
  type AudienceKeys = 'male' | 'female' | 'topAge' | 'topLocations';

  const handleAudienceChange = (field: AudienceKeys, value: any) => {
     setData(prev => ({
         ...prev,
         audience: { 
             male: 50, 
             female: 50, 
             topAge: "18-34", 
             topLocations: [],
             ...prev.audience, 
             [field]: value 
         }
     }));
  };

  const addSocial = () => {
      setData(prev => ({
          ...prev,
          socialStats: [...prev.socialStats, { platform: 'instagram', handle: '@', followers: '0' }]
      }));
  };

  const updateSocial = (idx: number, field: string, val: string) => {
      const newStats = [...data.socialStats];
      (newStats[idx] as any)[field] = val;
      setData(prev => ({ ...prev, socialStats: newStats }));
  };

  const removeSocial = (idx: number) => {
      const newStats = data.socialStats.filter((_, i) => i !== idx);
      setData(prev => ({ ...prev, socialStats: newStats }));
  };

  const addService = () => {
      setData(prev => ({
          ...prev,
          services: [...prev.services, { title: 'پکیج جدید', price: '', description: '' }]
      }));
  };

  const updateService = (idx: number, field: string, val: string) => {
      const newServices = [...data.services];
      (newServices[idx] as any)[field] = val;
      setData(prev => ({ ...prev, services: newServices }));
  };

  const removeService = (idx: number) => {
      const newServices = data.services.filter((_, i) => i !== idx);
      setData(prev => ({ ...prev, services: newServices }));
  };


  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <UserCheck size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مخصوص تولید کنندگان محتوا</h2>
          <p className="text-muted-foreground mb-4">این ابزار فقط برای پروژه‌های Creator فعال است.</p>
          <Link href="/dashboard/overview"><Button>بازگشت</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:max-w-none print:p-0 print:m-0">
      {/* Header - Hidden in Print */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">مدیاکیت ساز هوشمند</h1>
            <p className="text-muted-foreground">پورتفولیوی حرفه‌ای خود را بسازید</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download size={16} /> دانلود PDF
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600">
                {isSaving ? <span className="animate-spin">⏳</span> : <Save size={16} />} 
                ذخیره تغییرات
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 print:space-y-0">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] print:hidden">
          <TabsTrigger value="editor">✏️ ویرایشگر</TabsTrigger>
          <TabsTrigger value="preview">👁️ پیش‌نمایش زنده</TabsTrigger>
        </TabsList>

        {/* EDITOR TAB */}
        <TabsContent value="editor" className="space-y-8 print:hidden">
            {/* Profile Section */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <UserCheck size={20} className="text-violet-500" /> اطلاعات پایه
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>نام نمایشی (Display Name)</Label>
                            <Input value={data.displayName} onChange={e => setData({...data, displayName: e.target.value})} placeholder="مثلاً: آریو" />
                        </div>
                        <div className="space-y-2">
                            <Label>حوزه فعالیت (Niche)</Label>
                            <Input value={data.niche} onChange={e => setData({...data, niche: e.target.value})} placeholder="مثلاً: تکنولوژی، گیمینگ" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="flex justify-between">
                                <span>درباره من (Bio)</span>
                                <Button variant="ghost" size="sm" onClick={handleEnhanceBio} disabled={isGeneratingBio} className="h-6 text-xs text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100">
                                    <Sparkles size={12} className="mr-1" /> {isGeneratingBio ? "در حال نوشتن..." : "بهبود با کارنکس"}
                                </Button>
                            </Label>
                            <Textarea 
                                value={data.bio} 
                                onChange={e => setData({...data, bio: e.target.value})} 
                                className="min-h-[100px]"
                                placeholder="داستان خود را بنویسید..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ایمیل کاری</Label>
                            <Input value={data.contactEmail} onChange={e => setData({...data, contactEmail: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>رنگ برند</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="color" value={data.themeColor} onChange={e => setData({...data, themeColor: e.target.value})} className="w-12 h-10 p-1" />
                                <Input value={data.themeColor} onChange={e => setData({...data, themeColor: e.target.value})} className="flex-1" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats & Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 size={20} className="text-violet-500" /> آمار کلی
                        </h3>
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label>مجموع فالوور (همه پلتفرم‌ها)</Label>
                                <Input type="number" value={data.globalStats?.totalFollowers || 0} onChange={e => setData({...data, globalStats: {...data.globalStats, totalFollowers: Number(e.target.value)}})} />
                             </div>
                             <div className="space-y-2">
                                <Label>نرخ تعامل (Engagement Rate %)</Label>
                                <Input type="number" step="0.1" value={data.globalStats?.avgEngagement || 0} onChange={e => setData({...data, globalStats: {...data.globalStats, avgEngagement: Number(e.target.value)}})} />
                             </div>
                             <div className="space-y-2">
                                <Label>بازدید ماهانه (Monthly Reach)</Label>
                                <Input type="number" value={data.globalStats?.monthlyReach || 0} onChange={e => setData({...data, globalStats: {...data.globalStats, monthlyReach: Number(e.target.value)}})} />
                             </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Users size={20} className="text-violet-500" /> مخاطبان
                        </h3>
                        <div className="space-y-6">
                             <div className="space-y-2">
                                <Label className="flex justify-between text-xs">
                                    <span>آقا: {data.audience?.male}%</span>
                                    <span>خانم: {data.audience?.female}%</span>
                                </Label>
                                <Slider 
                                    defaultValue={[data.audience?.male || 50]} 
                                    max={100} 
                                    step={1} 
                                    onValueChange={(vals) => handleAudienceChange('male', vals[0])}
                                    onValueCommit={(vals) => handleAudienceChange('female', 100 - vals[0])}
                                />
                             </div>
                             <div className="space-y-2">
                                <Label>بیشترین رده سنی</Label>
                                <Input value={data.audience?.topAge} onChange={e => handleAudienceChange('topAge', e.target.value)} placeholder="مثلاً: 18-34" />
                             </div>
                             <div className="space-y-2">
                                <Label>شهرها/کشورهای برتر (با کاما جدا کنید)</Label>
                                <Input 
                                    value={data.audience?.topLocations?.join(", ") || ""} 
                                    onChange={e => handleAudienceChange('topLocations', e.target.value.split(",").map(s => s.trim()))} 
                                    placeholder="تهران، اصفهان، شیراز" 
                                />
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Socials */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Share2 size={20} className="text-violet-500" /> شبکه های اجتماعی
                        </h3>
                        <Button size="sm" variant="outline" onClick={addSocial}><Plus size={14} className="mr-1"/> افزودن</Button>
                    </div>
                    
                    <div className="space-y-3">
                        {data.socialStats.map((stat, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <Select 
                                    value={stat.platform} 
                                    onValueChange={(val) => updateSocial(idx, 'platform', val)}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <div className="flex items-center gap-2">
                                            <PlatformIconWrapper platform={stat.platform} />
                                            <SelectValue placeholder="Platform" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(PLATFORM_ICONS).map(p => (
                                            <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input 
                                    value={stat.handle} 
                                    onChange={e => updateSocial(idx, 'handle', e.target.value)} 
                                    className="w-1/3" 
                                    placeholder="@handle" 
                                />
                                <Input 
                                    value={stat.followers} 
                                    onChange={e => updateSocial(idx, 'followers', e.target.value)} 
                                    className="w-1/4" 
                                    placeholder="Count" 
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeSocial(idx)} className="text-red-500">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                         {data.socialStats.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">هنوز شبکه‌ای اضافه نکرده‌اید.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Partners */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase size={20} className="text-violet-500" /> همکاری‌های قبلی
                    </h3>
                    <div className="space-y-2">
                        <Label>نام برندها (با کاما جدا کنید)</Label>
                        <Input 
                            value={data.partners?.join(", ") || ""} 
                            onChange={e => setData({...data, partners: e.target.value.split(",").map(s => s.trim())})} 
                            placeholder="Samsung, Digikala, Snapp" 
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Services / Rates */}
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign size={20} className="text-violet-500" /> تعرفه‌ها و پکیج‌ها
                        </h3>
                        <Button size="sm" variant="outline" onClick={addService}><Plus size={14} className="mr-1"/> افزودن</Button>
                    </div>
                    <div className="space-y-4">
                        {data.services.map((svc, idx) => (
                            <div key={idx} className="grid md:grid-cols-3 gap-3 p-4 border rounded-xl bg-slate-50/50">
                                <Input 
                                    value={svc.title} 
                                    onChange={e => updateService(idx, 'title', e.target.value)} 
                                    placeholder="نام پکیج (مثلاً استوری)" 
                                />
                                <Input 
                                    value={svc.price} 
                                    onChange={e => updateService(idx, 'price', e.target.value)} 
                                    placeholder="قیمت (مثلاً 5M تومان)" 
                                />
                                <div className="flex gap-2">
                                    <Input 
                                        value={svc.description} 
                                        onChange={e => updateService(idx, 'description', e.target.value)} 
                                        placeholder="توضیحات کوتاه"
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeService(idx)} className="text-red-500 h-10 w-10 shrink-0">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                         {data.services.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">تعرفه‌ای وارد نشده است.</p>}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview" className="print:block">
            <div className="mb-4 flex gap-4 print:hidden">
                <span className="text-sm text-muted-foreground self-center">انتخاب قالب:</span>
                {(["modern", "minimal", "bold"] as const).map(t => (
                    <Badge 
                        key={t} 
                        variant={template === t ? "default" : "outline"} 
                        className="cursor-pointer"
                        onClick={() => setTemplate(t)}
                    >
                        {t.toUpperCase()}
                    </Badge>
                ))}
            </div>

            <div className="border rounded-2xl overflow-hidden shadow-2xl bg-white text-slate-900 min-h-[1000px] print:shadow-none print:border-none print:rounded-none">
                {/* Template Rendering */}
                {template === "modern" && <ModernTemplate data={data} />}
                {template === "minimal" && <MinimalTemplate data={data} />}
                {template === "bold" && <BoldTemplate data={data} />}
                
                <div className="bg-slate-50 py-4 text-center text-slate-400 text-xs print:hidden">
                    Preview Mode - Click Download PDF to save
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Icons Wrapper ---
function PlatformIconWrapper({ platform }: { platform: string }) {
    const Icon = PLATFORM_ICONS[platform] || Globe;
    return <div className="p-2 bg-muted rounded-lg"><Icon size={16} /></div>;
}

// --- Templates ---

function ModernTemplate({ data }: { data: MediaKit }) {
    return (
        <div className="bg-white text-slate-900 font-sans min-h-[1000px] w-full relative print:items-start" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
             {/* Hero */}
             <div className="relative h-80 bg-slate-900 overflow-hidden print:bg-slate-900">
                <div className="absolute inset-0 opacity-80 print:opacity-100" style={{ background: `linear-gradient(135deg, ${data.themeColor}dd, #0f172a)` }} />
                
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                <div className="absolute inset-0 flex items-center px-12 text-white z-10">
                    <div className="md:ml-24 max-w-2xl"> 
                         <h1 className="text-6xl font-black mb-4 tracking-tight leading-none drop-shadow-lg">{data.displayName}</h1>
                         <Badge variant="secondary" className="text-lg px-4 py-1 uppercase tracking-widest bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                            {data.niche}
                         </Badge>
                    </div>
                </div>
             </div>

             <div className="max-w-6xl mx-auto px-8 -mt-20 relative z-20 pb-20">
                 <div className="grid grid-cols-12 gap-8">
                     
                     {/* Left Column: Avatar & Contact */}
                     <div className="col-span-4 space-y-6">
                        <div className="h-64 w-64 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100 relative">
                            {data.profileImage ? (
                                <img src={data.profileImage} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                    <UserCheck size={64} />
                                </div>
                            )}
                        </div>
                        
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-4 border-b pb-2">Contact</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="p-2 rounded-full bg-slate-100 text-slate-500"><Mail size={16} /></div>
                                        <span className="font-medium text-sm truncate" title={data.contactEmail}>{data.contactEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="p-2 rounded-full bg-slate-100 text-slate-500"><MapPin size={16} /></div>
                                        <span className="font-medium text-sm">Everywhere</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-dashed">
                                        {data.socialStats.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                                <PlatformIconWrapper platform={s.platform}/>
                                                <div className="overflow-hidden">
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold">{s.platform}</div>
                                                    <div className="text-xs font-bold truncate">{s.followers}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                     </div>

                     {/* Right Column: Content */}
                     <div className="col-span-8 space-y-10 pt-12">
                        
                        {/* Bio */}
                        <section>
                             <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                 About Me
                             </h2>
                             <p className="text-lg leading-loose text-slate-600 font-light whitespace-pre-line">
                                 {data.bio || "No bio available."}
                             </p>
                        </section>

                        {/* Audience Stats */}
                        <section>
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                Audience Insights
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Demographics */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-end mb-6">
                                        <div className="text-slate-500 font-medium">Gender Split</div>
                                    </div>
                                    <div className="flex items-end gap-2 h-32">
                                        <div className="flex-1 flex flex-col justify-end gap-2 group">
                                            <div className="text-center font-bold text-slate-700">{data.audience?.male}%</div>
                                            <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden h-full group-hover:bg-blue-50 transition-colors">
                                                 <div className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-1000" style={{ height: `${data.audience?.male}%` }} />
                                            </div>
                                            <div className="text-center text-xs text-slate-400 font-bold uppercase">Male</div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-end gap-2 group">
                                            <div className="text-center font-bold text-slate-700">{data.audience?.female}%</div>
                                            <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden h-full group-hover:bg-pink-50 transition-colors">
                                                 <div className="absolute bottom-0 left-0 w-full bg-pink-500 transition-all duration-1000" style={{ height: `${data.audience?.female}%` }} />
                                            </div>
                                            <div className="text-center text-xs text-slate-400 font-bold uppercase">Female</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Highlights */}
                                <div className="space-y-4">
                                     <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between group print:bg-slate-900">
                                         <div>
                                             <div className="text-slate-400 text-xs font-bold uppercase mb-1">Top Age Group</div>
                                             <div className="text-3xl font-black">{data.audience?.topAge || "N/A"}</div>
                                         </div>
                                         <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎯</div>
                                     </div>
                                     <div className="bg-white border border-slate-100 p-6 rounded-2xl">
                                         <div className="text-slate-400 text-xs font-bold uppercase mb-3">Top Locations</div>
                                         <div className="flex flex-wrap gap-2">
                                             {data.audience?.topLocations?.map(l => (
                                                 <Badge key={l} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                     {l}
                                                 </Badge>
                                             ))}
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </section>

                        {/* Services */}
                        {data.services && data.services.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                    Collaboration Options
                                </h2>
                                <div className="space-y-4">
                                    {data.services.map((s, i) => (
                                        <div key={i} className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-violet-200 hover:shadow-lg transition-all duration-300">
                                            <div>
                                                <h4 className="font-bold text-xl text-slate-800 group-hover:text-violet-600 transition-colors">{s.title}</h4>
                                                <p className="text-slate-500 mt-1">{s.description}</p>
                                            </div>
                                            <div className="text-2xl font-black text-slate-900" style={{ color: data.themeColor }}>{s.price}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Partners */}
                        {data.partners && data.partners.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold mb-4 uppercase text-slate-400 tracking-widest text-center">
                                    Trusted By
                                </h2>
                                <div className="flex flex-wrap justify-center items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                                    {data.partners.map(p => (
                                        <span key={p} className="text-2xl font-black text-slate-300 uppercase select-none">{p}</span>
                                    ))}
                                </div>
                            </section>
                        )}
                     </div>
                 </div>
             </div>
        </div>
    );
}

function MinimalTemplate({ data }: { data: MediaKit }) {
    return (
        <div className="bg-white text-black p-16 font-mono min-h-[1000px] w-full" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {/* Header */}
            <header className="border-b-4 border-black pb-12 mb-16 flex justify-between items-start">
                <div>
                    <h1 className="text-8xl font-black tracking-tighter leading-[0.8] mb-6">{data.displayName.toUpperCase()}.</h1>
                    <div className="flex gap-4 items-center">
                        <div className="bg-black text-white px-4 py-1 font-bold text-sm uppercase">{data.niche}</div>
                        <span className="text-sm font-bold">EST. 2024</span>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest bg-slate-100 px-2 inline-block">Contact</h3>
                    <p className="text-lg font-bold">{data.contactEmail}</p>
                    <div className="flex gap-4 justify-end mt-4">
                        {data.socialStats.map(s => (
                             <div key={s.platform} className="text-right">
                                 <div className="text-[10px] uppercase text-slate-500">{s.platform}</div>
                                 <div className="font-bold">{s.followers}</div>
                             </div>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-16">
                {/* Left Col */}
                <div className="col-span-5 space-y-12">
                     <div className="aspect-[4/5] w-full bg-slate-200 relative grayscale contrast-125 overflow-hidden border border-slate-200">
                         {data.profileImage && <img src={data.profileImage} className="w-full h-full object-cover" />}
                     </div>
                     
                     <div className="space-y-4">
                        <h3 className="font-black text-xl border-b border-black pb-2">AUDIENCE DATA</h3>
                        <div className="grid grid-cols-2 gap-y-6 text-sm">
                            <div>
                                <div className="text-slate-500 mb-1">GENDER</div>
                                <div className="font-bold">M: {data.audience?.male}%  /  F: {data.audience?.female}%</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1">TOP AGE</div>
                                <div className="font-bold">{data.audience?.topAge}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-slate-500 mb-1">TOP LOCATIONS</div>
                                <div className="font-bold">{data.audience?.topLocations?.join(" • ")}</div>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Right Col */}
                <div className="col-span-7 space-y-16">
                    <div>
                        <p className="text-2xl leading-relaxed font-medium indent-12 text-justify">
                            {data.bio || "No bio content available."}
                        </p>
                    </div>

                    {/* Big Stats */}
                    <div className="grid grid-cols-2 gap-8 border-y-4 border-black py-8">
                         <div>
                             <div className="text-6xl font-black">{data.globalStats?.totalFollowers?.toLocaleString()}</div>
                             <div className="text-sm font-bold uppercase tracking-widest mt-2">Total Followers</div>
                         </div>
                         <div className="border-l border-black pl-8">
                             <div className="text-6xl font-black">{data.globalStats?.avgEngagement}%</div>
                             <div className="text-sm font-bold uppercase tracking-widest mt-2">Avg. Engagement</div>
                         </div>
                    </div>

                    {/* Services Table */}
                    {data.services && data.services.length > 0 && (
                        <div>
                            <h3 className="font-black text-4xl mb-8">SERVICES</h3>
                            <div className="space-y-0 border-t-2 border-black">
                                {data.services.map((s, i) => (
                                    <div key={i} className="flex justify-between items-baseline py-4 border-b border-slate-200 hover:bg-slate-50 px-2 transition-colors cursor-default">
                                        <div className="w-2/3">
                                            <span className="font-bold text-xl">{s.title}</span>
                                            {s.description && <span className="block text-sm text-slate-500 mt-1">{s.description}</span>}
                                        </div>
                                        <div className="font-bold text-xl tabular-nums">{s.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {data.partners && data.partners.length > 0 && (
                        <div className="pt-8">
                            <div className="text-sm font-bold text-slate-400 mb-4">PREVIOUSLY COLLABORATED WITH</div>
                            <div className="flex flex-wrap gap-x-8 gap-y-4 font-bold text-xl uppercase opacity-50">
                                {data.partners.map(p => <span key={p}>{p}</span>)}
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}

function BoldTemplate({ data }: { data: MediaKit }) {
    const accentColor = data.themeColor || '#fbbf24'; // Default to yellow if no theme color

    return (
        <div className="bg-[#0a0a0a] text-white p-0 font-sans min-h-[1000px] w-full overflow-hidden relative" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
             {/* Background Noise/Grid */}
             <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none" />
             
             {/* Header Marquee */}
             <div className="bg-white text-black overflow-hidden py-4 -rotate-1 scale-105 border-y-4 border-black z-10 relative">
                 <div className="whitespace-nowrap font-black text-4xl animate-marquee uppercase tracking-tight flex gap-8">
                     <span>{data.displayName}</span>
                     <span>•</span>
                     <span>{data.niche}</span>
                     <span>•</span>
                     <span>MEDIA KIT {new Date().getFullYear()}</span>
                     <span>•</span>
                     <span>{data.displayName}</span>
                     <span>•</span>
                     <span>{data.niche}</span>
                 </div>
             </div>

             <div className="max-w-7xl mx-auto px-8 py-12 relative z-20">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                     
                     {/* Sticky Left: Profile */}
                     <div className="sticky top-12 space-y-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white translate-x-2 translate-y-2 rounded-none transition-transform group-hover:translate-x-4 group-hover:translate-y-4" style={{ backgroundColor: accentColor }}/>
                            <div className="relative h-[500px] w-full bg-slate-800 border-2 border-white grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden">
                                {data.profileImage && <img src={data.profileImage} className="w-full h-full object-cover" />}
                                
                                {/* Overlay Content */}
                                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                    <h1 className="text-6xl font-black uppercase leading-[0.8] mb-2">{data.displayName}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-white text-black hover:bg-white rounded-none uppercase font-bold text-xs">{data.niche}</Badge>
                                        <Badge className="bg-transparent border border-white text-white hover:bg-white hover:text-black rounded-none uppercase font-bold text-xs">{data.contactEmail}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Matrix */}
                        <div className="grid grid-cols-2 gap-4">
                             {data.socialStats.map((s, i) => (
                                 <div key={i} className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors">
                                     <div className="flex justify-between items-start mb-2">
                                         <PlatformIconWrapper platform={s.platform}/>
                                         <div className="text-[10px] font-bold uppercase text-white/50">{s.platform}</div>
                                     </div>
                                     <div className="text-2xl font-black">{s.followers}</div>
                                 </div>
                             ))}
                        </div>
                     </div>

                     {/* Right: Scrollable Content */}
                     <div className="space-y-16 pt-8">
                         
                         {/* Bio */}
                         <div className="border-l-4 pl-8" style={{ borderColor: accentColor }}>
                             <h2 className="text-xl font-bold mb-4 uppercase text-white/50">Who I Am</h2>
                             <p className="text-2xl font-medium leading-relaxed">
                                {data.bio}
                             </p>
                         </div>

                         {/* Metric Explosion */}
                         <div>
                             <h2 className="text-8xl font-black text-transparent stroke-text mb-8 opacity-20" style={{ WebkitTextStroke: '2px white' }}>STATS</h2>
                             <div className="grid grid-cols-1 gap-6">
                                 <div className="bg-white text-black p-8 flex justify-between items-center transform hover:-translate-y-2 transition-transform">
                                     <span className="text-xl font-bold uppercase">Total Reach</span>
                                     <span className="text-6xl font-black tracking-tighter">{data.globalStats?.monthlyReach?.toLocaleString()}</span>
                                 </div>
                                 <div className="flex gap-6">
                                    <div className="bg-zinc-900 border border-zinc-800 p-6 flex-1 text-center">
                                         <div className="text-4xl font-black text-white mb-1" style={{ color: accentColor }}>{data.globalStats?.avgEngagement}%</div>
                                         <div className="text-xs uppercase font-bold text-zinc-500">Engagement</div>
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-800 p-6 flex-1 text-center">
                                         <div className="text-4xl font-black text-white mb-1" style={{ color: accentColor }}>{data.globalStats?.totalFollowers}</div>
                                         <div className="text-xs uppercase font-bold text-zinc-500">Followers</div>
                                    </div>
                                 </div>
                             </div>
                         </div>

                         {/* Audience Bar */}
                         <div className="space-y-4">
                             <div className="flex justify-between items-end text-sm font-bold uppercase tracking-widest text-zinc-500">
                                 <span>Audience Demographics</span>
                                 <span>{data.audience?.topAge || "N/A"} • {(data.audience?.topLocations || []).slice(0,2).join(", ")}</span>
                             </div>
                             <div className="h-4 w-full flex bg-zinc-800">
                                 <div style={{ width: `${data.audience?.male}%`, backgroundColor: accentColor }} className="h-full relative group">
                                     <span className="absolute -top-6 left-0 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">MALE {data.audience?.male}%</span>
                                 </div>
                                 <div className="bg-zinc-700 flex-1 relative group">
                                     <span className="absolute -top-6 right-0 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">FEMALE {data.audience?.female}%</span>
                                 </div>
                             </div>
                         </div>

                         {/* Services */}
                         {data.services && data.services.length > 0 && (
                             <div className="space-y-6">
                                 <h2 className="text-4xl font-black uppercase flex items-center gap-4">
                                     <span className="w-4 h-4" style={{ backgroundColor: accentColor }}/> 
                                     Rates & Packages
                                 </h2>
                                 <div className="grid gap-4">
                                     {data.services.map((s, i) => (
                                         <div key={i} className="group relative bg-zinc-900 border border-zinc-800 p-6 hover:bg-zinc-800 transition-colors overflow-hidden">
                                             <div className="absolute right-0 top-0 p-2 opacity-10 font-black text-6xl scale-150 rotate-12 transition-transform group-hover:rotate-0">
                                                 ${i + 1}
                                             </div>
                                             <div className="relative z-10 flex justify-between items-center">
                                                 <div>
                                                     <h3 className="text-2xl font-bold">{s.title}</h3>
                                                     <p className="text-zinc-500">{s.description}</p>
                                                 </div>
                                                 <div className="font-mono text-2xl font-bold" style={{ color: accentColor }}>{s.price}</div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                         
                         {/* Brand Tape */}
                         {data.partners && data.partners.length > 0 && (
                             <div className="py-8 border-t border-zinc-800">
                                 <div className="flex flex-wrap gap-4 text-zinc-500 font-bold text-2xl uppercase">
                                     {data.partners.map(p => <span key={p} className="hover:text-white transition-colors cursor-default">{p}</span>)}
                                 </div>
                             </div>
                         )}

                     </div>
                 </div>
             </div>
        </div>
    );
}
