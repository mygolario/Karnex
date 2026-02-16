import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight, Printer } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReceiptPrintButton } from "./client-components";

interface ReceiptPageProps {
  params: {
    id: string;
  };
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: params.id },
  });

  if (!transaction) {
    notFound();
  }

  const formattedAmount = new Intl.NumberFormat("fa-IR").format(transaction.amount / 10);
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
  
  const formattedTime = new Date(transaction.createdAt).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 shadow-lg shadow-green-100">
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">پرداخت موفق!</h1>
            <p className="text-slate-500 text-sm">تراکنش شما با موفقیت انجام شد.</p>
          </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
          <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="text-white/60 text-xs font-medium tracking-wider uppercase">مبلغ پرداختی</div>
              <div className="text-4xl font-black tracking-tighter flex items-center justify-center gap-2">
                {formattedAmount} 
                <span className="text-base font-normal opacity-60 relative top-1">تومان</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20" />
          </div>

          <div className="p-6 bg-white space-y-0 text-sm">
            <div className="flex justify-between items-center py-4 border-b border-slate-50">
              <span className="text-slate-500">شماره پیگیری</span>
              <span className="font-mono font-bold text-slate-700 dir-ltr">{transaction.refId || transaction.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-slate-50">
              <span className="text-slate-500">تاریخ پرداخت</span>
              <span className="font-medium text-slate-900">{formattedDate}</span>
            </div>
             <div className="flex justify-between items-center py-4 border-b border-slate-50">
              <span className="text-slate-500">ساعت</span>
              <span className="font-medium text-slate-900 flex items-center gap-1">
                  {formattedTime}
              </span>
            </div>
             <div className="flex justify-between items-center py-4 border-b border-slate-50">
              <span className="text-slate-500">وضعیت</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 ring-1 ring-green-600/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                تایید شده
              </span>
            </div>
            
            <div className="pt-6 pb-2 text-center text-xs text-slate-400">
               رسید الکترونیکی به ایمیل شما ارسال شد.
            </div>
          </div>

          <div className="p-4 bg-slate-50 grid grid-cols-2 gap-3">
             <Link href="/dashboard/overview" className="col-span-2">
              <Button className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 rounded-xl">
                بازگشت به داشبورد
                <ArrowRight className="mr-2 w-4 h-4 ml-0 rotate-180" />
              </Button>
            </Link>
            
            <ReceiptPrintButton />
            
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full h-11 bg-white hover:bg-slate-50 rounded-xl border-slate-200">
                 تاریخچه
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
