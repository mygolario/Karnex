"use client";

import { useState, useMemo } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, MessageCircle, Send, Sparkles, Loader2,
  Calendar, Gift, Star, Bell, Phone, Mail,
  CheckCircle2, Clock, TrendingUp, Heart, Zap,
  Settings, Play, Pause, Edit3, Search, Plus,
  Filter, UserPlus, MoreVertical, Trash2, X
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Customer, Campaign } from "@/lib/db";

// --- Types & Constants ---

type Tab = "overview" | "customers" | "campaigns";



const CAMPAIGN_TYPES = [
  { id: "followup", name: "پیگیری خودکار", icon: MessageCircle, color: "bg-blue-500", desc: "ارسال پیام بعد از خرید" },
  { id: "birthday", name: "تبریک تولد", icon: Gift, color: "bg-pink-500", desc: "کد تخفیف روز تولد" },
  { id: "loyalty", name: "باشگاه وفاداری", icon: Heart, color: "bg-red-500", desc: "اطلاع‌رسانی امتیازات" },
  { id: "feedback", name: "نظرسنجی", icon: Star, color: "bg-amber-500", desc: "دریافت بازخورد مشتری" },
];

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", firstName: "علی", lastName: "رضایی", phone: "09121111111", tags: ["vip", "loyal"], totalSpend: 15400000, lastVisit: "2024-01-20", createdAt: "2023-05-10" },
  { id: "2", firstName: "سارا", lastName: "محمدی", phone: "09122222222", tags: ["new"], totalSpend: 250000, lastVisit: "2024-02-01", createdAt: "2024-02-01" },
  { id: "3", firstName: "رضا", lastName: "کاظمی", phone: "09123333333", tags: ["risky"], totalSpend: 800000, lastVisit: "2023-11-15", createdAt: "2023-08-20" },
  { id: "4", firstName: "مریم", lastName: "احمدی", phone: "09124444444", tags: ["vip"], totalSpend: 32000000, lastVisit: "2024-01-28", createdAt: "2022-03-15" },
];

export default function CRMDashboard() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  // Data State
  const [customers, setCustomers] = useState<Customer[]>(plan?.customers || MOCK_CUSTOMERS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(plan?.campaigns || []);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "vip" | "new">("all");
  
  // Modals Info
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: "", lastName: "", phone: "", tags: [] as string[] });

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>("followup");
  const [campaignMessage, setCampaignMessage] = useState("");

  // --- Derived Stats ---
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalSpend = customers.reduce((acc, c) => acc + c.totalSpend, 0);
    const activeVIPs = customers.filter(c => c.tags.includes("vip")).length;
    const newThisMonth = customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length;
    return { totalCustomers, totalSpend, activeVIPs, newThisMonth };
  }, [customers]);

  // --- Handlers ---
  const handleAddCustomer = () => {
     if(!newCustomer.phone || !newCustomer.firstName) return toast.error("نام و شماره تماس الزامی است");
     const customer: Customer = {
        id: crypto.randomUUID(),
        ...newCustomer,
        totalSpend: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        tags: ["new"]
     };
     const updatedList = [customer, ...customers];
     setCustomers(updatedList);
     updateActiveProject({ customers: updatedList });
     setIsAddCustomerOpen(false);
     setNewCustomer({ firstName: "", lastName: "", phone: "", tags: [] });
     toast.success("مشتری جدید اضافه شد");
  };

  const handleDeleteCustomer = (id: string) => {
     const updatedList = customers.filter(c => c.id !== id);
     setCustomers(updatedList);
     updateActiveProject({ customers: updatedList });
     toast.success("مشتری حذف شد");
  }

  const handleCreateCampaign = () => {
     if(!campaignMessage) return toast.error("لطفا متن پیام را وارد کنید");
     
     const typeInfo = CAMPAIGN_TYPES.find(t => t.id === selectedCampaignType);
     
     const newCampaign: Campaign = {
        id: crypto.randomUUID(),
        name: `${typeInfo?.name} - ${new Date().toLocaleDateString('fa-IR')}`,
        type: selectedCampaignType as any,
        status: "active",
        message: campaignMessage,
        sentCount: customers.length, 
        openRate: 0,
        createdAt: new Date().toISOString()
     };

     const updatedCampaigns = [newCampaign, ...campaigns];
     setCampaigns(updatedCampaigns);
     updateActiveProject({ campaigns: updatedCampaigns });

     toast.success(`کمپین "${newCampaign.name}" با موفقیت ایجاد و ارسال شد! 🚀`);
     setIsCampaignModalOpen(false);
     setCampaignMessage("");
  }

  const handleDeleteCampaign = (id: string) => {
      const updated = campaigns.filter(c => c.id !== id);
      setCampaigns(updated);
      updateActiveProject({ campaigns: updated });
      toast.success("کمپین حذف شد");
  }

  const openCampaignModal = (typeId: string) => {
     setSelectedCampaignType(typeId);
     const messages: Record<string, string> = {
        followup: "سلام {name} عزیز! 🌸 ممنون از خرید شما. امیدواریم راضی باشید.",
        birthday: "تولدت مبارک {name}! 🎂 یک هدیه ویژه برای شما داریم.",
        loyalty: "{name} جان، شما جزو مشتریان وفادار ما هستید! ❤️",
        feedback: "سلام {name}، نظرتون درباره خدمات ما چیه؟ ⭐",
     };
     setCampaignMessage(messages[typeId] || "");
     setIsCampaignModalOpen(true);
  }

  const handleSmartAction = (action: string) => {
     toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
        loading: 'درحال تحلیل داده‌ها...',
        success: `${action} انجام شد!`,
        error: 'خطا'
     });
  }

  const filteredCustomers = customers.filter(c => {
     const matchesSearch = c.firstName.includes(searchQuery) || c.lastName.includes(searchQuery) || c.phone.includes(searchQuery);
     const matchesFilter = filterType === 'all' || c.tags.includes(filterType);
     return matchesSearch && matchesFilter;
  });

  // ... Check Access block ...
  if (plan?.projectType !== "traditional") { /* ... */ }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 dir-rtl">
      {/* Header (Same) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Users className="w-7 h-7 text-white" />
            </div>
            <div>
               <h1 className="text-3xl font-black tracking-tight">مدیریت هوشمند مشتریان</h1>
               <p className="text-muted-foreground font-medium">پایگاه داده مشتریان، وفاداری و اتوماسیون تبلیغات</p>
            </div>
         </div>
         <div className="flex gap-2">
            <Button onClick={() => setIsAddCustomerOpen(true)} className="h-10 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
               <UserPlus size={18} className="mr-2" />
               افزودن مشتری
            </Button>
         </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} className="w-full" onValueChange={(v) => setActiveTab(v as Tab)}>
         {/* ... TabsList ... */}
         <TabsList className="grid w-full max-w-md grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl mb-6">
            <TabsTrigger value="overview" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">پیشخوان</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">لیست مشتریان</TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">کمپین‌ها</TabsTrigger>
         </TabsList>

         {/* TAB: OVERVIEW */}
         <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards (Same) */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {/* ... stats map ... */}
               {[
                  { label: "کل مشتریان", val: stats.totalCustomers, icon: Users, color: "text-blue-500" },
                  { label: "مشتریان وفادار (VIP)", val: stats.activeVIPs, icon: Crown, color: "text-amber-500" }, 
                  { label: "مشتریان جدید (۳۰ روز)", val: stats.newThisMonth, icon: Sparkles, color: "text-emerald-500" },
                  { label: "ارزش کل خریدها", val: `${(stats.totalSpend/1000000).toFixed(1)}M`, icon: TrendingUp, color: "text-rose-500", suffix: "تومان" },
               ].map((k, i) => (
                  <Card key={i} className="p-5 border-indigo-100 dark:border-indigo-900/30">
                     <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg bg-muted ${k.color} bg-opacity-10`}>
                           <k.icon size={20} className={k.color} />
                        </div>
                        {i === 3 && <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">+۱۲٪</Badge>}
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-foreground">{k.val} <span className="text-xs text-muted-foreground font-normal">{k.suffix}</span></h3>
                        <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                     </div>
                  </Card>
               ))}
            </div>

            {/* Smart Suggestions */}
            <Card className="p-6 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
               <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-300">پیشنهادات هوشمند</h3>
               </div>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-card p-4 rounded-xl border border-indigo-100 dark:border-border flex gap-4 hover:shadow-md transition-all cursor-pointer group">
                     {/* ... icon ... */}
                     <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Gift size={24} />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold">کمپین بازگشت مشتری</h4>
                        <p className="text-sm text-muted-foreground mt-1">۳ مشتری VIP شما بیش از ۴۵ روز است خرید نکرده‌اند.</p>
                        <Button variant="link" onClick={() => handleSmartAction("کمپین بازگشت")} className="px-0 text-indigo-600 h-8 mt-1 font-bold">
                           اجرای خودکار <Play size={14} className="mr-1" />
                        </Button>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-card p-4 rounded-xl border border-indigo-100 dark:border-border flex gap-4 hover:shadow-md transition-all cursor-pointer group">
                     {/* ... icon ... */}
                     <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Star size={24} />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold">نظرسنجی رضایت</h4>
                        <p className="text-sm text-muted-foreground mt-1">۵ مشتری جدید دیروز اضافه شدند.</p>
                        <Button variant="link" onClick={() => handleSmartAction("ارسال پیام نظرسنجی")} className="px-0 text-indigo-600 h-8 mt-1 font-bold">
                           ارسال پیام <Send size={14} className="mr-1" />
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>
         </TabsContent>

         {/* TAB: CUSTOMERS */}
         <TabsContent value="customers" className="space-y-4">
            <div className="flex gap-2 mb-4">
               <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                     placeholder="جستجو..." 
                     className="pr-10 h-10 rounded-xl"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               {/* Filter Buttons */}
               <div className="flex bg-muted p-1 rounded-xl h-10">
                  <button onClick={() => setFilterType('all')} className={`px-3 text-xs font-bold rounded-lg transition-all ${filterType==='all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>همه</button>
                  <button onClick={() => setFilterType('vip')} className={`px-3 text-xs font-bold rounded-lg transition-all ${filterType==='vip' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>VIP</button>
                  <button onClick={() => setFilterType('new')} className={`px-3 text-xs font-bold rounded-lg transition-all ${filterType==='new' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>جدید</button>
               </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
               <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                     <tr>
                        <th className="px-4 py-3 text-right">مشتری</th>
                        <th className="px-4 py-3 text-right">تماس</th>
                        <th className="px-4 py-3 text-right">وضعیت</th>
                        <th className="px-4 py-3 text-right">خرید کل</th>
                        <th className="px-4 py-3 text-center">عملیات</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {filteredCustomers.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">مشتری یافت نشد.</td></tr>
                     ) : (
                        filteredCustomers.map((c) => (
                           <tr key={c.id} className="group hover:bg-muted/20">
                              <td className="px-4 py-3 font-bold">{c.firstName} {c.lastName}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground dir-ltr text-right">{c.phone}</td>
                              <td className="px-4 py-3">
                                 {c.tags.map(t => <Badge key={t} variant="outline" className="mr-1">{t}</Badge>)}
                              </td>
                              <td className="px-4 py-3 font-mono">{(c.totalSpend).toLocaleString()}</td>
                              <td className="px-4 py-3 text-center">
                                 <Button variant="ghost" size="icon" onClick={() => handleDeleteCustomer(c.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 size={16} />
                                 </Button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </TabsContent>

         {/* TAB: CAMPAIGNS */}
         <TabsContent value="campaigns" className="space-y-6">
             {/* 1. Create New Section */}
             <div className="space-y-4">
                <h3 className="font-bold text-lg text-foreground mb-2">ایجاد کمپین جدید</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {CAMPAIGN_TYPES.map(type => (
                      <Card key={type.id} onClick={() => openCampaignModal(type.id)} className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-indigo-100 group">
                         <div className={`w-12 h-12 rounded-xl mb-4 ${type.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <type.icon size={24} />
                         </div>
                         <h3 className="font-bold text-lg mb-1">{type.name}</h3>
                         <p className="text-sm text-muted-foreground mb-4">{type.desc}</p>
                         <Button variant="outline" className="w-full">ایجاد</Button>
                      </Card>
                   ))}
                </div>
             </div>

             {/* 2. Active Campaigns List */}
             <div className="space-y-4 pt-6 border-t border-dashed">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                   <Zap size={20} className="text-amber-500"/> کمپین‌های فعال ({campaigns.length})
                </h3>
                {campaigns.length === 0 ? (
                   <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                      <p className="text-muted-foreground">هنوز هیچ کمپینی ایجاد نکرده‌اید.</p>
                   </div>
                ) : (
                   <div className="grid gap-4">
                      {campaigns.map(camp => (
                         <Card key={camp.id} className="p-4 flex flex-col md:flex-row items-center justify-between border-l-4 border-l-emerald-500 shadow-sm">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Send size={20} />
                               </div>
                               <div>
                                  <h4 className="font-bold">{camp.name}</h4>
                                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                                     <span className="flex items-center gap-1"><Users size={12}/> {camp.sentCount} مخاطب</span>
                                     <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(camp.createdAt).toLocaleDateString('fa-IR')}</span>
                                     <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-1 rounded"><CheckCircle2 size={12}/> فعال</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                               <div className="text-center px-4 border-r border-border md:border-r-0 md:border-l pl-4">
                                  <div className="text-sm font-bold text-emerald-600">{(Math.random() * 20 + 10).toFixed(1)}%</div>
                                  <div className="text-[10px] text-muted-foreground">نرخ تعامل</div>
                               </div>
                               <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteCampaign(camp.id)}>
                                  <Trash2 size={16} />
                               </Button>
                            </div>
                         </Card>
                      ))}
                   </div>
                )}
             </div>
         </TabsContent>
      </Tabs>

      {/* --- Modals --- */}
      
      {/* 1. Add Customer (Same as before) */}
      <AnimatePresence>
         {isAddCustomerOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddCustomerOpen(false)}>
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-background rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
               >
                   {/* ... form content ... */}
                    <h3 className="text-xl font-bold flex items-center gap-2"><UserPlus className="text-indigo-600"/> افزودن مشتری</h3>
                    <div className="space-y-3">
                        <Input placeholder="نام" value={newCustomer.firstName} onChange={e => setNewCustomer({...newCustomer, firstName: e.target.value})} />
                        <Input placeholder="نام خانوادگی" value={newCustomer.lastName} onChange={e => setNewCustomer({...newCustomer, lastName: e.target.value})} />
                        <Input placeholder="شماره تماس" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="dir-ltr text-right" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setIsAddCustomerOpen(false)}>لغو</Button>
                        <Button className="flex-1 bg-indigo-600" onClick={handleAddCustomer}>ثبت</Button>
                    </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* 2. Create Campaign Modal (New) */}
      <AnimatePresence>
         {isCampaignModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCampaignModalOpen(false)}>
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-background rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
               >
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="text-indigo-600" />
                        ایجاد کمپین {CAMPAIGN_TYPES.find(t => t.id === selectedCampaignType)?.name}
                     </h3>
                     <Button variant="ghost" size="icon" onClick={() => setIsCampaignModalOpen(false)}><X size={20}/></Button>
                  </div>
                  
                  <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-sm border border-amber-200">
                     این پیام برای {customers.length} مشتری ارسال خواهد شد.
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold">متن پیام</label>
                     <textarea 
                        className="w-full min-h-[120px] p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-indigo-600 outline-none"
                        value={campaignMessage}
                        onChange={e => setCampaignMessage(e.target.value)}
                     />
                     <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded-lg">{"{name}"} : نام مشتری</span>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                     <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsCampaignModalOpen(false)}>انصراف</Button>
                     <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={handleCreateCampaign}>
                        🚀 ارسال کمپین
                     </Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}

// ... Crown Icon ...
function Crown(props: any) {
  return (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
     </svg>
  )
}
