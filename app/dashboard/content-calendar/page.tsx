"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Video, Instagram, Youtube, Twitter, 
  Sparkles, Loader2, CheckCircle2, Clock, 
  MoreHorizontal, Edit3, Trash2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ContentEvent {
  id: string;
  title: string;
  date: Date;
  platform: "instagram" | "youtube" | "twitter" | "linkedin";
  type: "post" | "reel" | "story" | "video" | "thread";
  status: "idea" | "scripting" | "filming" | "editing" | "scheduled" | "published";
}

const PLATFORM_ICONS = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Clock // Fallback
};

const PLATFORM_COLORS = {
  instagram: "text-pink-500 bg-pink-500/10",
  youtube: "text-red-500 bg-red-500/10",
  twitter: "text-blue-400 bg-blue-400/10",
  linkedin: "text-blue-700 bg-blue-700/10"
};

const STATUS_LABELS = {
  idea: "ایده",
  scripting: "سناریو",
  filming: "ضبط",
  editing: "تدوین",
  scheduled: "زمان‌بندی",
  published: "منتشر شده"
};

export default function ContentCalendarPage() {
  const { activeProject: plan } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ContentEvent[]>([
    {
      id: "1",
      title: "معرفی محصول جدید - پارت ۱",
      date: new Date(),
      platform: "instagram",
      type: "reel",
      status: "scripting"
    },
    {
      id: "2",
      title: "ولاگ پشت صحنه",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      platform: "youtube",
      type: "video",
      status: "idea"
    }
  ]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <CalendarIcon size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تقویم محتوا برای تولیدکنندگان محتوا</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های Creator فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0-6

  // Adjust for Persian calendar visual representation (simple grid)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter(e => 
      e.date.getDate() === day && 
      e.date.getMonth() === currentDate.getMonth() &&
      e.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      // Demo generated events
      const newEvents: ContentEvent[] = [
        {
          id: `ai-${Date.now()}-1`,
          title: "چالش ترند روز",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
          platform: "instagram",
          type: "reel",
          status: "idea"
        },
        {
          id: `ai-${Date.now()}-2`,
          title: "آموزش ترفندهای کاربردی",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
          platform: "youtube",
          type: "video",
          status: "idea"
        },
        {
          id: `ai-${Date.now()}-3`,
          title: "پرسش و پاسخ با مخاطبان",
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
          platform: "instagram",
          type: "story",
          status: "idea"
        }
      ];
      setEvents(prev => [...prev, ...newEvents]);
      setIsGeneratingAI(false);
      toast.success("برنامه محتوایی ماهانه توسط دستیار کارنکس ایجاد شد");
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تقویم هوشمند محتوا</h1>
              <p className="text-muted-foreground">برنامه‌ریزی، تولید و انتشار محتوا با کمک AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
             امروز
           </Button>
           <div className="flex items-center bg-card border border-border rounded-lg p-1">
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
               <ChevronRight size={18} />
             </Button>
             <span className="w-32 text-center font-bold">
               {currentDate.toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' })}
             </span>
             <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
               <ChevronLeft size={18} />
             </Button>
           </div>
           <Button 
             className="gap-2 bg-gradient-to-r from-primary to-secondary"
             onClick={handleGeneratePlan}
             disabled={isGeneratingAI}
           >
             {isGeneratingAI ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
             برنامه ماهانه با AI
           </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6">
        <div className="grid grid-cols-7 gap-px bg-muted/20 border border-border rounded-2xl overflow-hidden mb-6">
          {["شنبه", "۱شنبه", "۲شنبه", "۳شنبه", "۴شنبه", "۵شنبه", "جمعه"].map((day) => (
            <div key={day} className="p-4 text-center font-bold text-sm bg-card">
              {day}
            </div>
          ))}
          
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="bg-card min-h-[140px] opacity-50" />
          ))}

          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

            return (
              <div 
                key={day} 
                className={cn(
                  "bg-card min-h-[140px] p-3 border-t border-r border-border hover:bg-muted/10 transition-colors relative group",
                  isToday && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {day}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                <div className="space-y-2">
                  {dayEvents.map(event => {
                    const PlatformIcon = PLATFORM_ICONS[event.platform];
                    return (
                      <div 
                        key={event.id}
                        className={cn(
                          "p-2 rounded-lg text-xs border border-transparent hover:border-border transition-all cursor-pointer",
                          PLATFORM_COLORS[event.platform]
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <PlatformIcon size={12} />
                          <span className="font-bold line-clamp-1">{event.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-80">
                          <span>{STATUS_LABELS[event.status]}</span>
                          {event.type === "reel" && <Video size={10} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm justify-center">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
           <div key={key} className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-muted-foreground" />
             <span className="text-muted-foreground">{label}</span>
           </div>
        ))}
      </div>
    </div>
  );
}
