"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function ReceiptPrintButton() {
  return (
    <Button 
        variant="outline" 
        className="w-full h-11 bg-white hover:bg-slate-50 rounded-xl border-slate-200"
        onClick={() => typeof window !== 'undefined' && window.print()}
    >
      <Printer className="w-4 h-4 ml-2" />
      چاپ رسید
    </Button>
  );
}
