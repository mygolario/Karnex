"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
  Sparkles,
  ImageIcon,
  Sliders,
  Shield,
  CircleHelp,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import { useTourStore } from "@/lib/tour/store";
import { getToursForProjectType } from "@/lib/tour/registry";

interface CommandMenuProps {
  mobile?: boolean;
}

export function CommandMenu({ mobile = false }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { activeProject } = useProject();
  const startTour = useTourStore((s) => s.startTour);
  const { setPendingPrefill, clearMessages } = useCopilotStore();

  const askCopilot = React.useCallback((prefill?: string) => {
    clearMessages();
    if (prefill) setPendingPrefill(prefill);
    setOpen(false);
    router.push("/dashboard/copilot");
  }, [router, setPendingPrefill, clearMessages]);

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
      {mobile ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-muted/80 transition-colors mobile-touch-target"
          aria-label="جستجو"
        >
          <Search size={20} className="text-muted-foreground" />
        </button>
      ) : (
      <button 
         onClick={() => setOpen(true)}
         className="hidden md:flex items-center justify-between w-64 px-4 py-2.5 bg-muted/40 hover:bg-muted/60 dark:bg-white/5 dark:hover:bg-white/10 hover:shadow-lg hover:scale-[1.02] border border-border/50 rounded-2xl text-sm text-muted-foreground cursor-pointer transition-all duration-300 group backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
           <Search size={16} className="text-muted-foreground/70 group-hover:text-primary transition-colors" />
           <span className="opacity-50 group-hover:opacity-100 transition-opacity font-medium">جستجو...</span>
        </div>
        <div className="flex items-center gap-1">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-background/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-white/10 shadow-sm opacity-50 group-hover:opacity-100">
            <span className="text-xs">⌘</span>K
            </kbd>
        </div>
      </button>
      )}

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className={
          mobile
            ? "fixed inset-x-0 top-0 bottom-0 w-full max-w-none h-dvh bg-popover/98 backdrop-blur-xl border-0 shadow-2xl rounded-none overflow-hidden z-[9999] animate-in slide-in-from-bottom duration-200"
            : "fixed top-1/2 start-1/2 translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-100"
        }
      >
        <DialogPrimitive.Title className="sr-only">Command Menu</DialogPrimitive.Title>
        <div className="flex items-center border-b border-border/50 px-3" cmdk-input-wrapper="">
          <Search className="me-2 h-4 w-4 shrink-0 opacity-50" />
          <Command.Input 
             placeholder="چه کاری می‌خواهید انجام دهید؟"
             className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-end dir-rtl"
          />
        </div>
        
        <Command.List className={mobile ? "flex-1 max-h-none overflow-y-auto overflow-x-hidden p-2 dir-rtl" : "max-h-[300px] overflow-y-auto overflow-x-hidden p-2 dir-rtl"}>
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
             نتیجه‌ای یافت نشد.
          </Command.Empty>

          <Command.Group heading="پیشنهادات">
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/new-project'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Plus className="ms-2 h-4 w-4" />
              <span>پروژه جدید</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/overview'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <LayoutDashboard className="ms-2 h-4 w-4" />
              <span>داشبورد</span>
            </Command.Item>
             <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/roadmap'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Map className="ms-2 h-4 w-4" />
              <span>نقشه راه</span>
            </Command.Item>
             <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/canvas'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <ImageIcon className="ms-2 h-4 w-4" />
              <span>هویت بصری</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="راهنمای تعاملی">
            {getToursForProjectType(activeProject?.projectType)
              .filter((t) => t.id !== "whats-new")
              .slice(0, 6)
              .map((tour) => (
                <Command.Item
                  key={tour.id}
                  onSelect={() => runCommand(() => startTour(tour.id, 0, true))}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <CircleHelp className="ms-2 h-4 w-4 text-primary" />
                  <span>شروع تور: {tour.title.replace("تور ", "")}</span>
                </Command.Item>
              ))}
            <Command.Item
              onSelect={() => runCommand(() => startTour("dashboard", 0, true))}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <CircleHelp className="ms-2 h-4 w-4" />
              <span>بازپخش تور پیشخوان</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="دستیار AI">
            <Command.Item
                onSelect={() => askCopilot()}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <Sparkles className="ms-2 h-4 w-4 text-primary" />
              <span>پرسش از دستیار کارنکس</span>
              <kbd className="ms-auto me-1 text-[10px] text-muted-foreground">⏎</kbd>
            </Command.Item>
            <Command.Item
                onSelect={() => askCopilot("/plan برام یه برنامه عملی هفته‌آینده بنویس")}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <Sparkles className="ms-2 h-4 w-4 text-muted-foreground" />
              <span>برنامه‌ریزی هفته</span>
            </Command.Item>
            <Command.Item
                onSelect={() => askCopilot("/critique ایده و استراتژی پروژه‌ام رو نقد کن")}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <Sparkles className="ms-2 h-4 w-4 text-muted-foreground" />
              <span>نقد استراتژی پروژه</span>
            </Command.Item>
            <Command.Item
                onSelect={() => askCopilot("/competitors رقبای اصلی پروژه‌ام رو تحلیل کن")}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <Sparkles className="ms-2 h-4 w-4 text-muted-foreground" />
              <span>تحلیل رقبا</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="تنظیمات">
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/account'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <User className="ms-2 h-4 w-4" />
              <span>حساب کاربری و تنظیمات</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/account?section=preferences'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Sliders className="ms-2 h-4 w-4" />
              <span>ترجیحات ظاهری</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard/account?section=security'))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <Shield className="ms-2 h-4 w-4" />
              <span>امنیت</span>
            </Command.Item>
            <Command.Item 
                onSelect={() => runCommand(() => signOut().then(() => router.push('/')))}
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-destructive/10 aria-selected:text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
            >
              <LogOut className="ms-2 h-4 w-4" />
              <span>خروج</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
