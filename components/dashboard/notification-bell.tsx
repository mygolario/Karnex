"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  Check,
  Sparkles,
  Crown,
  AlertCircle,
  Gift,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "promo" | "achievement";
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  action?: {
    label: string;
    href: string;
  };
}

interface NotificationBellProps {
  notifications?: Notification[];
  className?: string;
}

// Generate initial mock notifications
function getDefaultNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "achievement",
      title: "دستاورد جدید! 🏆",
      message: "شما ۱۰ مرحله از نقشه راه را تکمیل کردید.",
      read: false,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      id: "2",
      type: "promo",
      title: "تخفیف ویژه",
      message: "۳۰٪ تخفیف اشتراک سالانه تا پایان هفته",
      read: false,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      action: { label: "مشاهده", href: "/pricing" },
    },
    {
      id: "3",
      type: "info",
      title: "به‌روزرسانی جدید",
      message: "قابلیت خروجی PDF به پلن رایگان اضافه شد.",
      read: true,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  ];
}

const typeConfig = {
  info: {
    icon: Bell,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  success: {
    icon: Check,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  promo: {
    icon: Gift,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  achievement: {
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
  },
};

export function NotificationBell({ notifications: initialNotifications, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(initialNotifications || getDefaultNotifications());
  }, [initialNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "اخیراً";
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    return date.toLocaleDateString("fa-IR");
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl transition-all hover:bg-muted",
          isOpen && "bg-muted"
        )}
      >
        <Bell size={20} className="text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "۹+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Panel */}
          <div className="absolute left-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-foreground">اعلان‌ها</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  خواندن همه
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">اعلانی وجود ندارد</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const config = typeConfig[notification.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-border last:border-b-0 transition-colors",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            config.bg,
                            config.color
                          )}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm line-clamp-1",
                              !notification.read ? "font-bold text-foreground" : "font-medium text-foreground"
                            )}>
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-muted-foreground hover:text-foreground shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <Link 
                                href={notification.action.href}
                                onClick={() => setIsOpen(false)}
                              >
                                <Button variant="ghost" size="sm" className="h-6 text-xs">
                                  {notification.action.label}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
