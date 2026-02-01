"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { MediaKit, saveMediaKit } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  Globe, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Video, 
  Mail,
  Share2,
  DollarSign,
  Palette
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, or replace with hot-toast
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function MediaKitBuilder() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: null,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${data.displayName}-MediaKit.pdf`);
      toast.success("دانلود با موفقیت انجام شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در دانلود PDF");
    } finally {
      setDownloading(false);
    }
  };

  // Initial State
  const [data, setData] = useState<MediaKit>({
    displayName: activeProject?.projectName || "",
    bio: activeProject?.tagline || "",
    contactEmail: user?.email || "",
    niche: activeProject?.audience || "Lifestyle",
    socialStats: [
      { platform: 'instagram', handle: '@username', followers: '10K', engagement: '5%' }
    ],
    services: [
      { title: 'Instagram Story (1 Slide)', price: '2,500,000 T', description: 'With link sticker' }
    ],
    themeColor: '#E1306C', // Default Instagram Pink
    profileImage: ''
  });

  // Load existing data if available
  useEffect(() => {
    if (activeProject?.mediaKit) {
      setData(activeProject.mediaKit);
    }
  }, [activeProject]);

  const handleSave = async () => {
    if (!user || !activeProject?.id) return;
    setLoading(true);
    try {
      await saveMediaKit(user.uid, data, activeProject.id);
      updateActiveProject({ mediaKit: data });
      toast.success("مدیا کیت ذخیره شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ذخیره سازی");
    } finally {
      setLoading(false);
    }
  };

  const addSocial = () => {
    setData(prev => ({
      ...prev,
      socialStats: [...prev.socialStats, { platform: 'instagram', handle: '', followers: '' }]
    }));
  };

  const removeSocial = (idx: number) => {
    setData(prev => ({
      ...prev,
      socialStats: prev.socialStats.filter((_, i) => i !== idx)
    }));
  };

  const addService = () => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', price: '' }]
    }));
  };

  const removeService = (idx: number) => {
    setData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx)
    }));
  };

  // Helper for icons
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={18} />;
      case 'youtube': return <Youtube size={18} />;
      case 'twitter': return <Twitter size={18} />;
      case 'linkedin': return <Linkedin size={18} />;
      default: return <Globe size={18} />;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 h-full">
      {/* LEFT: Editor */}
      <div className="space-y-6 overflow-y-auto pr-2">
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Palette size={20} />
            </div>
            <h2 className="font-bold text-xl">تنظیمات پروفایل</h2>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">نام نمایشی</label>
              <Input 
                value={data.displayName} 
                onChange={e => setData({...data, displayName: e.target.value})} 
                placeholder="نام شما یا برند"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">بیوگرافی کوتاه</label>
              <Textarea 
                value={data.bio} 
                onChange={e => setData({...data, bio: e.target.value})} 
                placeholder="درباره خودتان و محتوایتان بنویسید..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-sm font-medium mb-1 block">ایمیل همکاری</label>
                <Input 
                    value={data.contactEmail} 
                    onChange={e => setData({...data, contactEmail: e.target.value})} 
                />
               </div>
               <div>
                <label className="text-sm font-medium mb-1 block">حوزه فعالیت (Niche)</label>
                <Input 
                    value={data.niche} 
                    onChange={e => setData({...data, niche: e.target.value})} 
                />
               </div>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Share2 size={20} />
                </div>
                <h2 className="font-bold text-xl">آمار شبکه‌های اجتماعی</h2>
             </div>
             <Button variant="ghost" size="sm" onClick={addSocial}><Plus size={16} /></Button>
          </div>

          {data.socialStats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-start bg-muted/30 p-3 rounded-xl">
              <select 
                className="bg-transparent border border-border rounded-lg h-10 px-2 text-sm"
                value={stat.platform}
                onChange={e => {
                  const newStats = [...data.socialStats];
                  newStats[i].platform = e.target.value as any;
                  setData({...data, socialStats: newStats});
                }}
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
              <Input 
                placeholder="@handle" 
                value={stat.handle}
                onChange={e => {
                    const newStats = [...data.socialStats];
                    newStats[i].handle = e.target.value;
                    setData({...data, socialStats: newStats});
                }}
                className="flex-1"
              />
              <Input 
                placeholder="Follwers (e.g 10K)" 
                value={stat.followers}
                onChange={e => {
                    const newStats = [...data.socialStats];
                    newStats[i].followers = e.target.value;
                    setData({...data, socialStats: newStats});
                }}
                className="w-24"
              />
              <Button variant="ghost" size="icon" onClick={() => removeSocial(i)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </Card>

        <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                      <DollarSign size={20} />
                    </div>
                    <h2 className="font-bold text-xl">تعرفه خدمات</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={addService}><Plus size={16} /></Button>
            </div>

            {data.services.map((service, i) => (
                <div key={i} className="space-y-2 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="عنوان (مثلاً استوری تبلیغاتی)" 
                            value={service.title}
                            onChange={e => {
                                const newServices = [...data.services];
                                newServices[i].title = e.target.value;
                                setData({...data, services: newServices});
                            }}
                            className="font-bold"
                        />
                         <Input 
                            placeholder="قیمت" 
                            value={service.price}
                            onChange={e => {
                                const newServices = [...data.services];
                                newServices[i].price = e.target.value;
                                setData({...data, services: newServices});
                            }}
                            className="w-32 text-left"
                            dir="ltr"
                        />
                    </div>
                    <div className="flex gap-2">
                         <Input 
                            placeholder="توضیحات تکمیلی (اختیاری)" 
                            value={service.description}
                            onChange={e => {
                                const newServices = [...data.services];
                                newServices[i].description = e.target.value;
                                setData({...data, services: newServices});
                            }}
                            className="text-xs text-muted-foreground"
                        />
                         <Button variant="ghost" size="icon" onClick={() => removeService(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            ))}
        </Card>
      </div>

      {/* RIGHT: Live Preview */}
      <div className="relative">
         <div className="sticky top-6 space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
                <span className="font-bold text-muted-foreground">پیش‌نمایش زنده</span>
                <div className="flex gap-2">

  
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
                        <Download size={16} className="mr-2" />
                        {downloading ? 'در حال ساخت...' : 'دانلود PDF'}
                    </Button>
                    

            </div>
            </div>

            {/* The Media Kit Card */}
            <div ref={contentRef} className="bg-white text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden aspect-[9/16] md:aspect-[3/4] p-8 flex flex-col relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/20 to-purple-500/20 rounded-bl-full -mr-10 -mt-10" />
                
                {/* Header */}
                <div className="relative z-10 text-center mb-8">
                    <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full mb-4 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                         {/* Placeholder Avatar */}
                         <div className="text-4xl font-black text-slate-400">
                            {data.displayName.charAt(0)}
                         </div>
                    </div>
                    <h1 className="text-3xl font-black mb-1">{data.displayName}</h1>
                    <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                        {data.niche} Content Creator
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                        {data.bio}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {data.socialStats.map((stat, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700">
                                {getIcon(stat.platform)}
                             </div>
                             <div>
                                <div className="font-black text-lg leading-none mb-1">{stat.followers}</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{stat.platform}</div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Services */}
                <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider text-center">Services & Rates</h3>
                    <div className="space-y-3">
                        {data.services.map((service, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <div className="font-bold text-sm">{service.title}</div>
                                    {service.description && (
                                        <div className="text-[10px] text-slate-500">{service.description}</div>
                                    )}
                                </div>
                                <div className="font-black text-lg text-rose-500">{service.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm">
                        <Mail size={16} />
                        {data.contactEmail}
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
