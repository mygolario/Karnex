"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Ensure this matches UI kit
import { 
  MessageSquare, Mail, Phone, LifeBuoy, 
  Send, AlertCircle, CheckCircle2, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function SupportPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          user_email: user.email,
          subject,
          category,
          priority,
          message,
          status: 'open',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success("تیکت شما با موفقیت ثبت شد");
      setSubject("");
      setMessage("");
      // TODO: Notify Admins via Email
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارسال تیکت");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground mb-2 flex items-center gap-2">
          <LifeBuoy size={32} className="text-primary" />
          پشتیبانی و ارتباط با ما
        </h1>
        <p className="text-muted-foreground">
          هر سوال یا مشکلی دارید، تیم پشتیبانی کارنکس در کنار شماست
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Info Methods */}
        <div className="md:col-span-1 space-y-4">
          <Card variant="default" className="space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <Mail size={18} className="text-primary" />
              پشتیبانی ایمیلی
            </h2>
            <p className="text-sm text-muted-foreground">
              پاسخگویی در کمتر از ۲۴ ساعت
            </p>
            <a href="mailto:support@karnex.ir" className="text-primary font-mono text-sm hover:underline">
              support@karnex.ir
            </a>
          </Card>

          <Card variant="default" className="space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <Phone size={18} className="text-primary" />
              تماس تلفنی
            </h2>
            <p className="text-sm text-muted-foreground">
              شنبه تا چهارشنبه - ۹ صبح تا ۵ عصر
            </p>
            <a href="tel:02144445555" className="text-primary font-mono text-sm hover:underline">
              021-44445555
            </a>
          </Card>

           <Card variant="gradient" className="text-white">
            <h2 className="font-bold mb-2">سوالات متداول</h2>
            <p className="text-xs opacity-90 mb-4">
              قبل از ارسال تیکت، شاید پاسخ خود را اینجا پیدا کنید.
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              مشاهده راهنما
            </Button>
          </Card>
        </div>

        {/* Ticket Form */}
        <Card variant="default" padding="lg" className="md:col-span-2">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              ارسال تیکت جدید
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">موضوع</label>
                <input 
                  className="input-premium w-full"
                  placeholder="مثلا: مشکل در پرداخت"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">دسته‌بندی</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">مشکل فنی</SelectItem>
                    <SelectItem value="billing">مالی و اشتراک</SelectItem>
                    <SelectItem value="suggestion">پیشنهاد و انتقاد</SelectItem>
                    <SelectItem value="other">سایر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">اولویت</label>
              <div className="flex gap-2">
                 <button 
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${priority === 'low' ? 'bg-green-500/10 border-green-500 text-green-500' : 'border-border text-muted-foreground'}`}
                 >کم</button>
                 <button 
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${priority === 'normal' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}
                 >متوسط</button>
                 <button 
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${priority === 'high' ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-border text-muted-foreground'}`}
                 >زیاد</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">پیام شما</label>
              <textarea 
                className="input-premium w-full min-h-[150px]"
                placeholder="لطفاً مشکل خود را به صورت کامل شرح دهید..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="gradient" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} className="mr-2" />}
                ارسال تیکت
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
}
