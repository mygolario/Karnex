"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BusinessPlan } from "@/lib/db";
import { Loader2, Download, Check, Lock } from "lucide-react";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { Button } from "@/components/ui/button";

interface PdfExportButtonProps {
  plan: BusinessPlan;
}

export function PdfExportButton({ plan }: PdfExportButtonProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // TODO: Connect to real subscription status
  const isPro = false; 

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Capture the Report View
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High resolution (Retina support)
        useCORS: true, // Handle images if any
        backgroundColor: "#ffffff",
      });

      // 2. Initialize PDF (A4 Size)
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      // 3. Calculate Dimensions to fit A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 4. Add Image to PDF
      // If content is longer than 1 page, we would loop here (Simplified for MVP)
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      
      // 5. Save
      pdf.save(`${plan.projectName}-BusinessPlan.pdf`);

    } catch (error) {
      console.error("PDF Gen Error:", error);
      alert("خطا در ساخت PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* 1. The Trigger Button */}
      {isPro ? (
        <Button
          variant="default"
          onClick={handleDownload}
          disabled={isGenerating}
          loading={isGenerating}
        >
          {!isGenerating && <Download size={18} />}
          دانلود PDF
        </Button>
      ) : (
        <UpgradeModal>
          <Button variant="outline" className="group">
            <Lock size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            دانلود PDF (نسخه حرفه‌ای)
          </Button>
        </UpgradeModal>
      )}

      {/* 2. The Hidden Report Template (A4 Layout - 9-Block BMC) */}
      <div className="absolute top-0 left-[-9999px] w-[210mm] min-h-[297mm] bg-white text-slate-900" ref={reportRef}>
        {/* Cover Page Layout */}
        <div className="p-[15mm] space-y-8 h-full flex flex-col relative overflow-hidden bg-slate-50">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[150mm] h-[150mm] bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[100mm] h-[100mm] bg-emerald-50 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl opacity-50"></div>

          {/* Header */}
          <div className="relative z-10 flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-blue-800 tracking-tighter">کارنکس</h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Business Model Canvas</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">تاریخ گزارش</div>
              <div className="font-mono text-slate-600 text-sm">{new Date().toLocaleDateString('fa-IR')}</div>
            </div>
          </div>

          {/* Title Section */}
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
              بوم مدل کسب‌وکار
            </span>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              {plan.projectName}
            </h1>
            <p className="text-lg text-slate-500 font-light">
              {plan.tagline}
            </p>
          </div>

          {/* 9-Block BMC Grid */}
          <div className="relative z-10 flex-1 grid grid-cols-5 grid-rows-3 gap-2 text-[9px]" style={{ minHeight: '180mm' }}>
            {/* Helper to format content */}
            {(() => {
                const formatContent = (content: any) => {
                    if (!content) return '—';
                    if (typeof content === 'string') return content;
                    if (Array.isArray(content)) {
                        return content.map((c: any) => c.content).join('\n• ');
                    }
                    return '—';
                };

                return (
                    <>
                    {/* Row 1-2: Main blocks */}
                    {/* Key Partners */}
                    <div className="col-span-1 row-span-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
                    <div className="flex items-center gap-1 text-violet-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        شرکای کلیدی
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap">{formatContent(plan.leanCanvas.keyPartners)}</p>
                    </div>
                    
                    {/* Key Activities & Resources */}
                    <div className="col-span-1 row-span-1 p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <div className="flex items-center gap-1 text-rose-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        فعالیت‌های کلیدی
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap">{formatContent(plan.leanCanvas.keyActivities)}</p>
                    </div>
                    
                    {/* Value Proposition */}
                    <div className="col-span-1 row-span-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        ارزش پیشنهادی
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap font-medium">{formatContent(plan.leanCanvas.uniqueValue)}</p>
                    </div>
                    
                    {/* Customer Relationships (Problem/Solution) */}
                    <div className="col-span-1 row-span-1 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-1 text-amber-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        مشکل + راه‌حل
                    </div>
                    <p className="text-slate-600 leading-5"><b>مشکل:</b> {formatContent(plan.leanCanvas.problem)}</p>
                    <p className="text-slate-600 leading-5 mt-1"><b>راه‌حل:</b> {formatContent(plan.leanCanvas.solution)}</p>
                    </div>
                    
                    {/* Customer Segments */}
                    <div className="col-span-1 row-span-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-1 text-blue-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        بخش‌های مشتریان
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap">{formatContent(plan.leanCanvas.customerSegments)}</p>
                    </div>
                    
                    {/* Key Resources */}
                    <div className="col-span-1 row-span-1 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-1 text-orange-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        منابع کلیدی
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap">{formatContent(plan.leanCanvas.keyResources)}</p>
                    </div>
                    
                    {/* Channels (empty filler) */}
                    <div className="col-span-1 row-span-1 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-1 text-cyan-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        کانال‌های ارتباطی
                    </div>
                    <p className="text-slate-600 leading-5">اینستاگرام، وب‌سایت، تلگرام</p>
                    </div>
                    
                    {/* Row 3: Cost Structure & Revenue Streams */}
                    {/* Cost Structure */}
                    <div className="col-span-2 row-span-1 p-3 bg-slate-100 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                        ساختار هزینه
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap">{formatContent(plan.leanCanvas.costStructure)}</p>
                    </div>
                    
                    {/* Revenue Streams */}
                    <div className="col-span-3 row-span-1 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-1 text-green-700 font-bold mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        جریان درآمد
                    </div>
                    <p className="text-slate-600 leading-5 whitespace-pre-wrap">{formatContent(plan.leanCanvas.revenueStream)}</p>
                    </div>
                    </>
                );
            })()}
          </div>

          {/* Visual Identity Strip */}
          <div className="relative z-10">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">هویت بصری</h3>
             <div className="flex gap-2">
                <div className="flex-1 h-12 rounded-lg flex items-end p-2 text-white font-mono text-[10px] shadow-sm" style={{ backgroundColor: plan.brandKit.primaryColorHex }}>
                  {plan.brandKit.primaryColorHex}
                </div>
                <div className="flex-1 h-12 rounded-lg flex items-end p-2 text-white font-mono text-[10px] shadow-sm" style={{ backgroundColor: plan.brandKit.secondaryColorHex }}>
                  {plan.brandKit.secondaryColorHex}
                </div>
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                   <span className="font-bold text-slate-900 text-xs">Aa</span>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>Powered by Karnex AI</span>
            <span>www.karnex.ir</span>
          </div>

        </div>
      </div>
    </>
  );
}
