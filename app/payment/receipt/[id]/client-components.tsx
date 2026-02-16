"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function ReceiptPrintButton() {
  return (
    <Button 
        variant="secondary" 
        className="w-full h-11 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm rounded-xl"
        onClick={() => typeof window !== 'undefined' && window.print()}
    >
      <Printer className="w-4 h-4 ml-2" />
      چاپ رسید
    </Button>
  );
}
