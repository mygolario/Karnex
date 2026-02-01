"use client";

import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, Printer, ArrowRight } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PLANS, formatPrice } from "@/lib/plans";
import Link from "next/link";
import Image from "next/image";

interface InvoiceData {
  id: string;
  amount: number;
  planId: string;
  status: string;
  createdAt: string;
  refNumber?: string;
  trackId?: string;
  user: {
    displayName: string;
    email: string;
  }
}

export default function InvoicePage() {
  const { id } = useParams(); // Start with hook
  const { user } = useAuth();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Unwrapping params is good practice/required in newer Next.js but params from hook is synchronous usually,
    // though in Next 15 it might be async. For now assuming standard behavior or handling promise if needed.
    // Actually in standard client comp it's object.
    
    if (!user || !id) return;

    const fetchInvoice = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'payments', id as string);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
           const data = snap.data();
           // Get user details for invoice header
           const userDoc = await getDoc(doc(db, 'users', user.uid));
           const userData = userDoc.data();

           setInvoice({
             id: snap.id,
             amount: data.amount,
             planId: data.planId,
             status: data.status,
             createdAt: data.createdAt,
             refNumber: data.refNumber,
             trackId: data.trackId,
             user: {
               displayName: userData?.displayName || user.displayName || 'کاربر',
               email: user.email!
             }
           });
        } else {
            // Not found
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [user, id]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice?.id}.pdf`);
    } catch (err) {
      console.error("PDF Gen Error:", err);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin"/></div>;
  if (!invoice) return <div className="p-12 text-center">فاکتور یافت نشد</div>;

  const plan = Object.values(PLANS).find(p => p.id === invoice.planId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/dashboard/profile">
          <Button variant="ghost"><ArrowRight className="ml-2" /> بازگشت</Button>
        </Link>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} className="mr-2"/> چاپ
            </Button>
            <Button variant="gradient" onClick={handleDownloadPDF}>
                <Download size={16} className="mr-2"/> دانلود PDF
            </Button>
        </div>
      </div>

      <Card className="p-8 md:p-12 bg-white text-black border-none shadow-xl print:shadow-none" ref={invoiceRef}>
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8 mb-8">
            <div className="flex items-center gap-3">
                <Image src="/logo-official.png" width={48} height={48} alt="Karnex" className="rounded-lg" />
                <div>
                    <h1 className="text-2xl font-black">کارنکس</h1>
                    <p className="text-sm text-gray-500">Karnex.ir | دستیار هوشمند کسب‌وکارهای ایرانی</p>
                </div>
            </div>
            <div className="text-left">
                <h2 className="text-xl font-bold text-primary mb-1">فاکتور فروش</h2>
                <div className="text-sm text-gray-500">
                    <div>شماره: {invoice.id.slice(-8).toUpperCase()}</div>
                    <div>تاریخ: {new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</div>
                </div>
            </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">فروشنده</h3>
                <div className="font-bold">شرکت کارنکس اینویشن</div>
                <div className="text-sm text-gray-600">تهران، دانشگاه صنعتی شریف</div>
                <div className="text-sm text-gray-600">Karnex.ir</div>
            </div>
            <div className="text-left">
                <h3 className="text-sm font-bold text-gray-400 mb-2">خریدار</h3>
                <div className="font-bold">{invoice.user.displayName}</div>
                <div className="text-sm text-gray-600">{invoice.user.email}</div>
            </div>
        </div>

        {/* Table */}
        <table className="w-full mb-12">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="text-right py-3">شرح</th>
                    <th className="text-center py-3">تعداد</th>
                    <th className="text-left py-3">مبلغ (تومان)</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b border-gray-100">
                    <td className="py-4">
                        <div className="font-bold">ارتقا حساب کاربری به طرح {plan?.name}</div>
                        <div className="text-sm text-gray-500">دسترسی یک ماهه به امکانات ویژه</div>
                    </td>
                    <td className="text-center py-4">۱</td>
                    <td className="text-left py-4 font-mono dir-ltr">{invoice.amount.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-gray-100">
                    <td className="py-4 text-gray-500">مالیات بر ارزش افزوده (۰٪)</td>
                    <td className="text-center py-4">-</td>
                    <td className="text-left py-4 font-mono dir-ltr">۰</td>
                </tr>
            </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end mb-12">
            <div className="w-1/2 md:w-1/3 space-y-3">
                <div className="flex justify-between text-lg font-black border-t-2 border-black pt-3">
                    <span>جمع کل</span>
                    <span>{formatPrice(invoice.amount).replace(' تومان', '')} <span className="text-sm font-normal text-gray-500">تومان</span></span>
                </div>
                <div className="text-xs text-gray-500 text-right mt-2">
                    پرداخت شده با {invoice.refNumber ? `شماره پیگیری ${invoice.refNumber}` : 'اعتبار'}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-100 text-sm text-gray-400">
            <p>این فاکتور جهت پیگیری تراکنش صادر شده و ارزش قانونی دیگری ندارد.</p>
            <p className="mt-1">Karnex Inc. | Thank you for your business</p>
        </div>

      </Card>
    </div>
  );
}
