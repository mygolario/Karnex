"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { 
  Calculator, 
  User, 
  CreditCard, 
  Settings, 
  Plus, 
  LayoutDashboard, 
  Map, 
  LogOut,
  Search,
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { user } = useAuth();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div 
         onClick={() => setOpen(true)}
         className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border/50 rounded-lg text-xs text-muted-foreground cursor-pointer transition-colors"
      >
        <Search size={14} />
        <span className="opacity-70">جستجو و دستورات...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border shadow-sm">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center border-b border-border/50 px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input 
             placeholder="چه کاری می‌خواهید انجام دهید؟"
             className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-right dir-rtl"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 dir-rtl">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
             نتیجه‌ای یافت نشد.
          </Command.Empty>

          <Command.Group heading="پیشنهادات">
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/new-project'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Plus className="ml-2 h-4 w-4" />
              <span>پروژه جدید</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/overview'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <LayoutDashboard className="ml-2 h-4 w-4" />
              <span>داشبورد</span>
            </Command.Item>
             <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/roadmap'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Map className="ml-2 h-4 w-4" />
              <span>نقشه راه</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="تنظیمات">
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/profile'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <User className="ml-2 h-4 w-4" />
              <span>پروفایل من</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/settings'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Settings className="ml-2 h-4 w-4" />
              <span>تنظیمات</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => signOut(auth).then(() => router.push('/')))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-destructive/10 aria-selected:text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
            >
              <LogOut className="ml-2 h-4 w-4" />
              <span>خروج</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
