"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Send, MessageSquare, Phone, Mail } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function SupportPage() {
  const { success } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Mock submission for now
    setTimeout(() => {
        setLoading(false);
        success("پیام ارسال شد", "تیم پشتیبانی به زودی با شما تماس خواهد گرفت.");
        (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">پشتیبانی و ارتباط با ما</h1>
        <p className="text-muted-foreground">
          تیم پشتیبانی کارنکس در سریع‌ترین زمان ممکن پاسخگوی شما خواهد بود
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              ارسال پیام جدید
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">موضوع</Label>
                <Input id="subject" placeholder="مثلا: مشکل در پرداخت" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">متن پیام</Label>
                <Textarea 
                  id="message" 
                  placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید..." 
                  className="min-h-[150px]"
                  required 
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "در حال ارسال..." : "ارسال پیام"}
                {!loading && <Send className="w-4 h-4 mr-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>راه‌های ارتباطی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">ایمیل پشتیبانی</div>
                  <div className="text-sm text-muted-foreground">support@karnex.ir</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">تلفن تماس</div>
                  <div className="text-sm text-muted-foreground">۰۲۱-۱۲۳۴۵۶۷۸</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">ساعات پاسخگویی</h3>
              <p className="text-sm opacity-90">
                شنبه تا چهارشنبه: ۹ صبح تا ۹ شب
                <br />
                پنجشنبه: ۹ صبح تا ۲ بعد از ظهر
                <br />
                جمعه و تعطیلات رسمی: تعطیل
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
