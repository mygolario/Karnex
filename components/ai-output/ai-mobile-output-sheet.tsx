"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AIActionBar } from "./ai-action-bar";

export function AIMobileOutputSheet({
  open,
  onOpenChange,
  title,
  children,
  actionBarProps,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  actionBarProps?: React.ComponentProps<typeof AIActionBar>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto flex-1 py-4 max-h-[calc(85vh-8rem)]">
          {children}
        </div>
        {actionBarProps && (
          <div className="sticky bottom-0 border-t bg-background pt-3 pb-safe">
            <AIActionBar {...actionBarProps} compact />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
