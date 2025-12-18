"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BusinessPlan } from "@/lib/db";
import { Loader2, Download, Check, LayoutGrid, Map, Palette, TrendingUp } from "lucide-react";

interface PdfExportButtonProps {
  plan: BusinessPlan;
}

export function PdfExportButton({ plan }: PdfExportButtonProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>در حال ساخت...</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>دانلود PDF</span>
          </>
        )}
      </button>

      {/* 2. The Hidden Report Template (A4 Layout) */}
      <div className="absolute top-0 left-[-9999px] w-[210mm] min-h-[297mm] bg-white text-slate-900" ref={reportRef}>
        {/* Cover Page Layout */}
        <div className="p-[20mm] space-y-12 h-full flex flex-col relative overflow-hidden bg-slate-50">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[150mm] h-[150mm] bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[100mm] h-[100mm] bg-emerald-50 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl opacity-50"></div>

          {/* Header */}
          <div className="relative z-10 flex justify-between items-center border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-3xl font-black text-blue-800 tracking-tighter">کارنکس</h1>
              <span className="text-xs text-slate-400 uppercase tracking-widest">Business Intelligence Report</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">تاریخ گزارش</div>
              <div className="font-mono text-slate-600">{new Date().toLocaleDateString('fa-IR')}</div>
            </div>
          </div>

          {/* Title Section */}
          <div className="relative z-10 space-y-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              طرح کسب‌وکار هوشمند
            </span>
            <h1 className="text-5xl font-black text-slate-900 leading-tight">
              {plan.projectName}
            </h1>
            <p className="text-2xl text-slate-500 font-light leading-relaxed">
              {plan.tagline}
            </p>
          </div>

          {/* Executive Summary Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-8 mt-8">
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="flex items-center gap-2 text-amber-600 font-bold mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                مشکل اصلی
              </h3>
              <p className="text-sm leading-7 text-slate-600 text-justify">
                {plan.leanCanvas.problem}
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="flex items-center gap-2 text-blue-600 font-bold mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                راه حل ما
              </h3>
              <p className="text-sm leading-7 text-slate-600 text-justify">
                {plan.leanCanvas.solution}
              </p>
            </div>
          </div>

          {/* Visual Identity Strip */}
          <div className="relative z-10">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">هویت بصری</h3>
             <div className="flex gap-4">
                <div className="flex-1 h-24 rounded-xl flex items-end p-4 text-white font-mono text-sm shadow-sm" style={{ backgroundColor: plan.brandKit.primaryColorHex }}>
                  {plan.brandKit.primaryColorHex}
                </div>
                <div className="flex-1 h-24 rounded-xl flex items-end p-4 text-white font-mono text-sm shadow-sm" style={{ backgroundColor: plan.brandKit.secondaryColorHex }}>
                  {plan.brandKit.secondaryColorHex}
                </div>
                <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                   <span className="font-bold text-slate-900">Aa</span>
                </div>
             </div>
          </div>

          {/* Roadmap Snapshot */}
          <div className="relative z-10 flex-1">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">نقشه راه (فاز اول)</h3>
             <div className="space-y-3">
                {plan.roadmap[0].steps.slice(0, 4).map((step: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm text-slate-700">{step}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Powered by Karnex AI</span>
            <span>www.karnex.ir</span>
          </div>

        </div>
      </div>
    </>
  );
}
