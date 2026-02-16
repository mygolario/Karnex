"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, XCircle } from "lucide-react";
import Link from "next/link";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limit?: number;
  used?: number;
  message?: string;
  zIndex?: number;
}

export function LimitReachedModal({ 
  isOpen, 
  onClose, 
  limit, 
  used,
  message = "شما به سقف استفاده از هوش مصنوعی در پلن فعلی خود رسیده‌اید.",
  zIndex
}: LimitReachedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl" style={{ zIndex: zIndex }}>
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8 text-destructive" />
            </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            پایان اعتبار هوش مصنوعی
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground leading-relaxed">
            {message}
            <br />
            برای ادامه استفاده از امکانات هوش مصنوعی، لطفاً پلن خود را ارتقا دهید.
          </DialogDescription>
        </DialogHeader>

        {limit !== undefined && used !== undefined && (
            <div className="bg-muted/50 p-4 rounded-lg text-sm flex justify-between items-center my-2">
                <span className="text-muted-foreground">مصرف شما:</span>
                <span className="font-mono font-bold text-foreground">{used} / {limit}</span>
            </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
           <Link href="/pricing" className="w-full sm:w-auto flex-1">
              <Button className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" />
                ارتقای پلن
              </Button>
           </Link>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            متوجه شدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
