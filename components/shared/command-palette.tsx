"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Map,
  LayoutGrid,
  Palette,
  Megaphone,
  Settings,
  HelpCircle,
  ArrowRight,
  Command,
  Sparkles,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category: "navigation" | "action" | "ai";
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Navigation commands
  const commands: CommandItem[] = useMemo(() => [
    {
      id: "overview",
      title: "نمای کلی",
      subtitle: "داشبورد اصلی",
      icon: <LayoutDashboard size={20} />,
      action: () => router.push("/dashboard/overview"),
      keywords: ["dashboard", "home", "overview", "خانه"],
      category: "navigation",
    },
    {
      id: "roadmap",
      title: "نقشه راه",
      subtitle: "مراحل اجرایی پروژه",
      icon: <Map size={20} />,
      action: () => router.push("/dashboard/roadmap"),
      keywords: ["roadmap", "steps", "timeline", "مراحل"],
      category: "navigation",
    },
    {
      id: "canvas",
      title: "بوم کسب‌وکار",
      subtitle: "مدل کسب‌وکار لین",
      icon: <LayoutGrid size={20} />,
      action: () => router.push("/dashboard/canvas"),
      keywords: ["canvas", "business", "model", "بوم"],
      category: "navigation",
    },
    // {
    //   id: "brand",
    //   title: "هویت بصری",
    //   subtitle: "لوگو و رنگ‌های برند",
    //   icon: <Palette size={20} />,
    //   action: () => router.push("/dashboard/brand"),
    //   keywords: ["brand", "logo", "colors", "برند", "لوگو"],
    //   category: "navigation",
    // },
    {
      id: "marketing",
      title: "بازاریابی",
      subtitle: "استراتژی‌های رشد",
      icon: <Megaphone size={20} />,
      action: () => router.push("/dashboard/marketing"),
      keywords: ["marketing", "growth", "strategy", "بازاریابی"],
      category: "navigation",
    },
    {
      id: "settings",
      title: "تنظیمات",
      subtitle: "مدیریت حساب کاربری",
      icon: <Settings size={20} />,
      action: () => router.push("/dashboard/settings"),
      keywords: ["settings", "account", "profile", "تنظیمات"],
      category: "navigation",
    },
    {
      id: "help",
      title: "راهنما",
      subtitle: "سوالات متداول و پشتیبانی",
      icon: <HelpCircle size={20} />,
      action: () => router.push("/dashboard/help"),
      keywords: ["help", "support", "faq", "راهنما", "کمک"],
      category: "navigation",
    },
    {
      id: "projects",
      title: "پروژه‌ها",
      subtitle: "مدیریت همه پروژه‌ها",
      icon: <LayoutGrid size={20} />,
      action: () => router.push("/projects"),
      keywords: ["projects", "list", "پروژه"],
      category: "navigation",
    },
    {
      id: "new-project",
      title: "پروژه جدید",
      subtitle: "شروع یک کسب‌وکار جدید",
      icon: <Sparkles size={20} />,
      action: () => router.push("/new-project"),
      keywords: ["new", "create", "project", "جدید", "ایجاد"],
      category: "action",
    },
  ], [router]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const query = search.toLowerCase();
    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(query) ||
      cmd.subtitle?.toLowerCase().includes(query) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(query))
    );
  }, [commands, search]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch("");
        setSelectedIndex(0);
      }

      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }

      // Arrow navigation
      if (isOpen && filteredCommands.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        }
        if (e.key === "Enter") {
          e.preventDefault();
          filteredCommands[selectedIndex]?.action();
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const executeCommand = useCallback((command: CommandItem) => {
    command.action();
    setIsOpen(false);
    setSearch("");
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-200 group"
      >
        <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-sm font-medium">جستجو...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50 border border-border/50 text-xs font-mono text-muted-foreground">
          <Command size={12} />
          <span>K</span>
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-xl mx-4 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-4 p-4 border-b border-border/50">
                <Search size={20} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در کارنکس..."
                  className="flex-1 bg-transparent text-lg font-medium placeholder:text-muted-foreground/60 outline-none"
                  autoFocus
                  dir="rtl"
                />
                <kbd className="px-2 py-1 rounded-lg bg-muted text-xs font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">نتیجه‌ای یافت نشد</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">عبارت دیگری امتحان کنید</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCommands.map((command, index) => (
                      <motion.button
                        key={command.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.03 }}
                        onClick={() => executeCommand(command)}
                        className={cn(
                          "w-full flex items-center gap-4 p-3 rounded-xl text-right transition-all duration-150",
                          index === selectedIndex
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50 text-foreground"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          index === selectedIndex
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base">{command.title}</div>
                          {command.subtitle && (
                            <div className="text-sm text-muted-foreground truncate">
                              {command.subtitle}
                            </div>
                          )}
                        </div>
                        <ArrowRight size={16} className={cn(
                          "shrink-0 transition-opacity",
                          index === selectedIndex ? "opacity-100" : "opacity-0"
                        )} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/30">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd>
                    انتخاب
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd>
                    باز کردن
                  </span>
                </div>
                <Sparkles size={14} className="text-primary animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
