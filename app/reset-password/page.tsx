"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wrench, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card border-border shadow-xl">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
          <Wrench size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">در حال بروزرسانی</h1>
          <p className="text-muted-foreground">
            سیستم بازیابی رمز عبور در حال حاضر غیرفعال است. لطفاً برای تغییر رمز عبور با پشتیبانی تماس بگیرید.
          </p>
        </div>
        <Link href="/login" className="block">
            <Button className="w-full">
                <ArrowRight className="ml-2 h-4 w-4" />
                بازگشت به ورود
            </Button>
        </Link>
      </Card>
    </div>
  );
}
