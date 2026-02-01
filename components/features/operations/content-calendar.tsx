"use client";

import { useState } from "react";
import { ContentPost, saveOperations } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Instagram, Youtube, Linkedin, Twitter, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { faIR } from 'date-fns/locale';

export function ContentCalendar() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [posts, setPosts] = useState<ContentPost[]>(
    plan?.operations?.contentCalendar || []
  );

  const [selectedDate, setSelectedDate] = useState(new Date());

  const addPost = (date: Date) => {
    const newPost: ContentPost = {
        id: uuidv4(),
        title: "ایده پست جدید",
        platform: 'instagram',
        status: 'idea',
        date: date.toISOString(),
        notes: ""
    };
    setPosts([...posts, newPost]);
  };

  const updatePost = (id: string, field: keyof ContentPost, value: any) => {
    setPosts(posts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    if (!user || !plan) return;
    try {
        await saveOperations(user.uid, 'contentCalendar', posts, plan.id || 'current');
        updateActiveProject({ operations: { ...plan.operations, contentCalendar: posts } });
        toast.success("تقویم محتوا ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  const statusColors = {
      'idea': 'bg-slate-500/10 text-slate-500',
      'scripting': 'bg-blue-500/10 text-blue-500',
      'filming': 'bg-amber-500/10 text-amber-500',
      'editing': 'bg-purple-500/10 text-purple-500',
      'scheduled': 'bg-emerald-500/10 text-emerald-500',
      'published': 'bg-green-500/20 text-green-700 dark:text-green-300 line-through opacity-60'
  };

  const PlatformIcon = ({ platform }: { platform: string }) => {
      switch(platform) {
          case 'instagram': return <Instagram size={16} className="text-pink-600" />;
          case 'youtube': return <Youtube size={16} className="text-red-600" />;
          case 'linkedin': return <Linkedin size={16} className="text-blue-700" />;
          case 'twitter': return <Twitter size={16} className="text-sky-500" />;
          default: return <FileText size={16} />;
      }
  };

  // Calendar Logic
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-6">
        <div className="bg-card border border-border p-6 rounded-3xl flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <span className="text-pink-500">Content Calendar</span>
                    <span>تقویم محتوا</span>
                </h2>
                <p className="text-muted-foreground">برنامه‌ریزی منظم = رشد پایدار.</p>
            </div>
            <Button onClick={handleSave}>ذخیره تقویم</Button>
        </div>

        {/* Simple Week View for MVP */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
             {days.slice(0, 7).map((dayName, idx) => ( // Just show headers once
                <div key={idx} className="text-center font-bold text-muted-foreground hidden md:block">
                     {format(dayName, 'EEEE', { locale: faIR })}
                </div>
             ))}
             
             {days.map((day, dayIdx) => {
                 const dayPosts = posts.filter(p => isSameDay(parseISO(p.date), day));
                 const isCurrentMonth = isSameMonth(day, monthStart);
                 
                 if (!isCurrentMonth) return <div key={dayIdx} className="hidden md:block bg-muted/10 rounded-xl min-h-[150px]" />;

                 return (
                    <div key={dayIdx} className="bg-card border border-border rounded-xl min-h-[150px] p-2 flex flex-col gap-2 group relative">
                        <div className="flex justify-between items-center px-1">
                             <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-muted-foreground'}`}>
                                 {format(day, 'd')}
                             </span>
                             <Button variant="ghost" size="icon-sm" onClick={() => addPost(day)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Plus size={14} />
                             </Button>
                        </div>

                        {dayPosts.map(post => (
                            <div key={post.id} className={`p-2 rounded-lg text-xs border ${statusColors[post.status]} space-y-1 cursor-pointer hover:scale-105 transition-transform`}>
                                <div className="flex justify-between items-center">
                                    <PlatformIcon platform={post.platform} />
                                    <Select value={post.status} onValueChange={(v) => updatePost(post.id, 'status', v)}>
                                        <SelectTrigger className="h-5 text-[10px] w-auto border-none bg-transparent p-0 shadow-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="idea">ایده</SelectItem>
                                            <SelectItem value="scripting">سناریو</SelectItem>
                                            <SelectItem value="filming">ضبط</SelectItem>
                                            <SelectItem value="editing">تدوین</SelectItem>
                                            <SelectItem value="published">منتشر</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Input 
                                    className="h-6 text-xs bg-transparent border-none p-0 focus-visible:ring-0 font-bold"
                                    value={post.title}
                                    onChange={(e) => updatePost(post.id, 'title', e.target.value)}
                                />
                                <div className="flex justify-end">
                                     <Trash2 size={12} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => removePost(post.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                 );
             })}
        </div>
    </div>
  );
}
