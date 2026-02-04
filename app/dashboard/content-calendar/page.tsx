"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Video, Instagram, Youtube, Twitter, 
  Sparkles, Loader2, CheckCircle2, Clock, 
  MoreHorizontal, Edit3, Trash2, X, Play, Save,
  Columns, List, Grid, ArrowRight, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ContentPost } from "@/lib/db";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLATFORM_ICONS = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Clock,
  blog: Edit3
};

const PLATFORM_COLORS = {
  instagram: "text-pink-500 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20",
  youtube: "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
  twitter: "text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20",
  linkedin: "text-blue-700 bg-blue-700/10 border-blue-700/20 hover:bg-blue-700/20",
  blog: "text-orange-500 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
};

const STATUS_LABELS = {
  idea: "ایده",
  scripting: "سناریو",
  filming: "ضبط",
  editing: "تدوین",
  scheduled: "زمان‌بندی",
  published: "منتشر شده"
};

const STATUS_COLUMNS = [
  { id: "idea", label: "ایده خام", color: "bg-slate-500/10 border-slate-500/20 text-slate-500" },
  { id: "scripting", label: "در حال نگارش", color: "bg-blue-500/10 border-blue-500/20 text-blue-500" },
  { id: "filming", label: "ضبط و تولید", color: "bg-orange-500/10 border-orange-500/20 text-orange-500" },
  { id: "editing", label: "تدوین و طراحی", color: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
  { id: "published", label: "منتشر شده", color: "bg-green-500/10 border-green-500/20 text-green-500" },
];

export default function ContentCalendarPage() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"calendar" | "kanban">("calendar");
  
  // Load events from plan or default
  const [events, setEvents] = useState<ContentPost[]>([]);
  
  useEffect(() => {
    if (plan?.contentCalendar) {
       setEvents(plan.contentCalendar);
    }
  }, [plan]);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ContentPost | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentPost>>({});
  const [strategyType, setStrategyType] = useState<"growth" | "sales" | "trust">("growth");

  // Sync to Cloud
  const saveEvents = (newEvents: ContentPost[]) => {
    setEvents(newEvents);
    if (updateActiveProject) {
      updateActiveProject({ contentCalendar: newEvents });
    }
  };

  // CRUD
  const handleEditClick = (event: ContentPost) => {
    setSelectedEvent(event);
    setFormData(event);
    setIsSheetOpen(true);
  };

  const handleAddClick = (date?: Date, initialStatus: string = "idea") => {
    setSelectedEvent(null);
    setFormData({
      date: date ? date.toISOString() : new Date().toISOString(),
      platform: "instagram",
      type: "reel",
      status: initialStatus as any,
      title: ""
    });
    setIsSheetOpen(true);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    const newEvents = events.filter(e => e.id !== selectedEvent.id);
    saveEvents(newEvents);
    setIsSheetOpen(false);
    toast.success("رویداد حذف شد");
  };

  const handleSaveForm = () => {
    if (!formData.title || !formData.date) {
      toast.error("عنوان و تاریخ الزامی است");
      return;
    }

    const eventToSave: ContentPost = {
        id: selectedEvent?.id || `evt-${Date.now()}`,
        title: formData.title,
        date: formData.date,
        platform: formData.platform || "instagram",
        type: formData.type || "post",
        status: formData.status || "idea",
        notes: formData.notes || ""
    };

    let newEvents;
    if (selectedEvent) {
      // Update
      newEvents = events.map(e => e.id === selectedEvent.id ? eventToSave : e);
    } else {
      // Create
      newEvents = [...events, eventToSave];
    }
    
    saveEvents(newEvents);
    setIsSheetOpen(false);
    toast.success(selectedEvent ? "تغییرات ذخیره شد" : "رویداد جدید ایجاد شد");
  };

  // Move Status (Kanban)
  const moveStatus = (event: ContentPost, direction: 'next' | 'prev') => {
    const statusOrder = ['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'];
    const currentIndex = statusOrder.indexOf(event.status);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < statusOrder.length) {
      const newStatus = statusOrder[newIndex] as any;
      const updatedEvent = { ...event, status: newStatus };
      const newEvents = events.map(e => e.id === event.id ? updatedEvent : e);
      saveEvents(newEvents);
    }
  };

  // AI Strategy Generation
  const handleGenerateStrategy = async () => {
    if (!plan) return;
    setIsGeneratingAI(true);
    setIsStrategyOpen(false);
    
    try {
      const strategies = {
        growth: "Focus on viral trends, high-energy hooks, and shareable content. Goal: Reach new audiences.",
        sales: "Focus on product benefits, social proof, testimonials, and clear CTAs. Goal: Conversion.",
        trust: "Focus on behind-the-scenes, educational value, and personal stories. Goal: Deepen connection."
      };

      const prompt = `Generate a 2-week content calendar based on this strategy:
      Strategy: ${strategies[strategyType]}
      Project: ${plan.projectName}
      Niche: ${plan.brandCanvas?.niche || "General"}
      
      Return ONLY valid JSON array of objects:
      [
        {
          "title": "Title in Persian",
          "platform": "instagram" | "youtube" | "linkedin",
          "type": "reel" | "post" | "story",
          "dayOffset": number (1-14),
          "notes": "Brief strategy note"
        }
      ]`;

      const response = await fetch("/api/ai-generate", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON." })
      });
      
      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed)) {
           const newAiEvents: ContentPost[] = parsed.map((item: any) => {
             const d = new Date();
             d.setDate(d.getDate() + (item.dayOffset || 1));
             return {
               id: `ai-${Date.now()}-${Math.random()}`,
               title: item.title,
               date: d.toISOString(),
               platform: item.platform || "instagram",
               type: item.type || "post",
               status: "idea",
               notes: item.notes || "Generated by AI Strategy"
             };
           });
           
           saveEvents([...events, ...newAiEvents]);
           toast.success(`${newAiEvents.length} ایده استراتژیک اضافه شد! 🚀`);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("خطا در تولید استراتژی");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const paddingCols = (firstDayOfMonth + 1) % 7;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: paddingCols }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getDate() === day && 
               eDate.getMonth() === currentDate.getMonth() &&
               eDate.getFullYear() === currentDate.getFullYear();
    });
  };

  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <CalendarIcon size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مخصوص کریتورها</h2>
          <Button asChild><Link href="/dashboard/overview">بازگشت</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تقویم محتوای هوشمند</h1>
              <p className="text-muted-foreground">فرماندهی عملیات تولید محتوا</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-muted p-1 rounded-lg">
              <Button 
                variant={view === "calendar" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("calendar")}
              >
                <Grid size={16} className="mr-2" /> تقویم
              </Button>
              <Button 
                variant={view === "kanban" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("kanban")}
              >
                <Columns size={16} className="mr-2" /> پایپ‌لاین
              </Button>
           </div>
           
           <Dialog open={isStrategyOpen} onOpenChange={setIsStrategyOpen}>
             <DialogTrigger asChild>
               <Button disabled={isGeneratingAI} className="bg-gradient-to-r from-pink-600 to-purple-600 border-0 shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform">
                 {isGeneratingAI ? <Loader2 className="animate-spin" /> : <Sparkles />} 
                 <span className="mr-2">تولید استراتژی AI</span>
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>انتخاب استراتژی محتوا</DialogTitle>
                 <DialogDescription>
                   هوش مصنوعی تقویم شما را بر اساس هدف انتخابی پر می‌کند.
                 </DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      className={cn("justify-start h-auto p-4", strategyType === "growth" && "border-green-500 bg-green-500/5")}
                      onClick={() => setStrategyType("growth")}
                    >
                      <div className="text-left">
                        <div className="font-bold">رشد سریع (Viral Growth)</div>
                        <div className="text-xs text-muted-foreground">تمرکز بر ترندها و محتوای وایرال برای جذب فالوور جدید.</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className={cn("justify-start h-auto p-4", strategyType === "sales" && "border-blue-500 bg-blue-500/5")}
                      onClick={() => setStrategyType("sales")}
                    >
                      <div className="text-left">
                        <div className="font-bold">فروش و تبدیل (Sales)</div>
                        <div className="text-xs text-muted-foreground">تمرکز بر معرفی محصول، اعتماد سازی و دعوت به اقدام.</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className={cn("justify-start h-auto p-4", strategyType === "trust" && "border-purple-500 bg-purple-500/5")}
                      onClick={() => setStrategyType("trust")}
                    >
                      <div className="text-left">
                        <div className="font-bold">اعتمادسازی (Brand Trust)</div>
                        <div className="text-xs text-muted-foreground">محتوای آموزشی، پشت صحنه و داستان برند.</div>
                      </div>
                    </Button>
                 </div>
                 <Button onClick={handleGenerateStrategy} disabled={isGeneratingAI} className="w-full">
                   {isGeneratingAI ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                   شروع تولید برنامه
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Main Content Areas */}
      <AnimatePresence mode="wait">
        {view === "calendar" ? (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
             {/* Calendar Controls */}
             <div className="flex items-center justify-between mb-4 px-1">
               <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>امروز</Button>
                 <div className="flex items-center bg-card border border-border rounded-lg p-0.5">
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                     <ChevronRight size={16} />
                   </Button>
                   <span className="w-32 text-center font-bold text-sm">
                     {currentDate.toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' })}
                   </span>
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                     <ChevronLeft size={16} />
                   </Button>
                 </div>
               </div>
               <div className="flex gap-2">
                 {/* Legend */}
                 <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span>Instagram</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>YouTube</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>LinkedIn</span>
                 </div>
               </div>
             </div>

             <Card className="p-6 shadow-xl border-t-4 border-t-pink-500">
                <div className="grid grid-cols-7 gap-px bg-muted/20 border border-border rounded-2xl overflow-hidden mb-6">
                  {["شنبه", "۱شنبه", "۲شنبه", "۳شنبه", "۴شنبه", "۵شنبه", "جمعه"].map((day) => (
                    <div key={day} className="p-4 text-center font-bold text-sm bg-card/50 backdrop-blur-sm">{day}</div>
                  ))}
                  
                  {paddingDays.map((_, i) => <div key={`pad-${i}`} className="bg-card/30 min-h-[140px]" />)}

                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const todayDate = new Date();
                    const isToday = day === todayDate.getDate() && currentDate.getMonth() === todayDate.getMonth();
                    const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

                    return (
                      <div key={day} className={cn("bg-card min-h-[140px] p-2 border-t border-r border-border hover:bg-muted/5 transition-colors group relative flex flex-col gap-2", isToday && "bg-pink-500/5")}>
                        <div className="flex justify-between items-start">
                          <span className={cn("text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full", isToday ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40" : "text-muted-foreground")}>{day}</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleAddClick(currentDayDate)}>
                            <Plus size={12} />
                          </Button>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {dayEvents.map(event => {
                            const PlatformIcon = PLATFORM_ICONS[event.platform];
                            return (
                              <motion.div 
                                layoutId={event.id}
                                key={event.id}
                                onClick={() => handleEditClick(event)}
                                className={cn("p-2 rounded-lg text-xs border cursor-pointer transition-all relative group/event hover:scale-105 hover:z-10 shadow-sm", PLATFORM_COLORS[event.platform])}
                              >
                                 <div className="flex items-center gap-1.5 font-bold mb-1">
                                   <PlatformIcon size={12} />
                                   <span className="truncate">{event.title}</span>
                                 </div>
                                 <div className="flex justify-between items-center opacity-70 text-[9px]">
                                   <span>{STATUS_LABELS[event.status]}</span>
                                 </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
             </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]"
          >
             {STATUS_COLUMNS.map((col) => {
               const colEvents = events.filter(e => e.status === col.id);
               return (
                 <div key={col.id} className="min-w-[280px] w-[280px] shrink-0 flex flex-col bg-card border border-border rounded-2xl shadow-sm h-full max-h-[70vh]">
                   <div className={cn("p-4 border-b font-bold flex items-center justify-between", col.color)}>
                      <span>{col.label}</span>
                      <Badge variant="secondary" className="bg-background text-foreground opacity-80">{colEvents.length}</Badge>
                   </div>
                   <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                      {colEvents.map(event => {
                         const PlatformIcon = PLATFORM_ICONS[event.platform];
                         return (
                           <motion.div 
                             layout
                             key={event.id}
                             onClick={() => handleEditClick(event)}
                             className="bg-background border border-border p-3 rounded-xl shadow-sm hover:shadow-md cursor-pointer group"
                           >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", PLATFORM_COLORS[event.platform], "bg-transparent border-0")}>
                                   <PlatformIcon size={12} className="mr-1" />
                                   {event.platform}
                                </Badge>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveStatus(event, 'prev'); }}>
                                      <ChevronRight size={14} />
                                   </Button>
                                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveStatus(event, 'next'); }}>
                                      <ChevronLeft size={14} />
                                   </Button>
                                </div>
                              </div>
                              <h4 className="font-bold text-sm mb-2">{event.title}</h4>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                                 <span>{new Date(event.date).toLocaleDateString('fa-IR', {month: 'short', day: 'numeric'})}</span>
                              </div>
                           </motion.div>
                         );
                      })}
                      <Button variant="ghost" className="w-full border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground" onClick={() => handleAddClick(new Date(), col.id)}>
                        <Plus size={16} className="mr-2" /> افزودن
                      </Button>
                   </div>
                 </div>
               );
             })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Add Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedEvent ? "ویرایش رویداد" : "افزودن رویداد جدید"}</SheetTitle>
            <SheetDescription>
              جزئیات محتوا را وارد کنید.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>عنوان محتوا</Label>
              <Input 
                value={formData.title || ""} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="مثلاً: آموزش ساخت ریلز..." 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>پلتفرم</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(v: any) => setFormData({...formData, platform: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>نوع محتوا</Label>
                 <Select 
                  value={formData.type} 
                  onValueChange={(v: any) => setFormData({...formData, type: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post (عکس)</SelectItem>
                    <SelectItem value="reel">Reel / Short</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="video">Long Video</SelectItem>
                    <SelectItem value="thread">Thread / Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
                <Label>وضعیت</Label>
                 <Select 
                  value={formData.status} 
                  onValueChange={(v: any) => setFormData({...formData, status: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">ایده خام</SelectItem>
                    <SelectItem value="scripting">در حال سناریو</SelectItem>
                    <SelectItem value="filming">ضبط شده</SelectItem>
                    <SelectItem value="editing">تدوین شده</SelectItem>
                    <SelectItem value="scheduled">زمان‌بندی شده</SelectItem>
                    <SelectItem value="published">منتشر شده</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
              <Label>یادداشت‌ها</Label>
              <Textarea 
                value={formData.notes || ""} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="جزئیات سناریو، کپشن یا هشتگ‌ها..."
                className="h-32"
              />
            </div>

            {selectedEvent && (
               <Card className="p-4 bg-muted/30 border-dashed">
                 <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                   <Video size={14} /> ابزارهای تولید
                 </h4>
                 <div className="flex gap-2">
                   <Link href="/dashboard/scripts" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                         نوشتن سناریو
                      </Button>
                   </Link>
                   <Link href="/dashboard/repurpose" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                         توزیع محتوا
                      </Button>
                   </Link>
                 </div>
               </Card>
            )}
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-2">
             {selectedEvent && (
               <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto mr-auto">
                 <Trash2 size={16} className="mr-2" /> حذف
               </Button>
             )}
             <Button onClick={handleSaveForm} className="w-full sm:w-auto">
               <Save size={16} className="mr-2" /> ذخیره تغییرات
             </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
