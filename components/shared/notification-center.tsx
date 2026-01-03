"use client";

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Rocket, Lightbulb, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SmartNotification } from '@/lib/automation';
import { useLocale } from '@/hooks/use-translations';
import Link from 'next/link';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { locale, isRTL } = useLocale();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('karnex_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SmartNotification[];
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.readAt).length);
      } catch (e) {
        console.warn('Failed to parse notifications:', e);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('karnex_notifications', JSON.stringify(notifications.slice(0, 50)));
    }
  }, [notifications]);

  const addNotification = (notification: SmartNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.readAt) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('karnex_notifications');
  };

  const getIcon = (type: SmartNotification['type']) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'welcome':
      case 'achievement':
        return <CheckCircle2 className={cn(iconClass, "text-emerald-500")} />;
      case 'milestone':
        return <Rocket className={cn(iconClass, "text-primary")} />;
      case 'suggestion':
        return <Lightbulb className={cn(iconClass, "text-amber-500")} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-rose-500")} />;
      case 'reminder':
        return <Clock className={cn(iconClass, "text-blue-500")} />;
      default:
        return <Bell className={cn(iconClass, "text-muted-foreground")} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (locale === 'fa') {
      if (diffMins < 1) return 'همین الان';
      if (diffMins < 60) return `${diffMins} دقیقه پیش`;
      if (diffHours < 24) return `${diffHours} ساعت پیش`;
      return `${diffDays} روز پیش`;
    } else {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    }
  };

  const labels = locale === 'fa' ? {
    notifications: 'اعلان‌ها',
    markAllRead: 'خواندن همه',
    clearAll: 'پاک کردن همه',
    noNotifications: 'اعلانی ندارید',
    noNotificationsDesc: 'وقتی خبر جدیدی باشد، اینجا می‌بینید.',
  } : {
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    clearAll: 'Clear all',
    noNotifications: 'No notifications',
    noNotificationsDesc: 'When there\'s news, you\'ll see it here.',
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className={cn(
            "absolute top-full mt-2 w-80 sm:w-96 bg-background rounded-xl shadow-2xl border border-border z-50",
            isRTL ? "left-0" : "right-0"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{labels.notifications}</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      {labels.markAllRead}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAll}
                      className="text-xs text-muted-foreground"
                    >
                      {labels.clearAll}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium text-foreground">{labels.noNotifications}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {labels.noNotificationsDesc}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer",
                      !notification.readAt && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.actionUrl && notification.actionLabel && (
                            <Link
                              href={notification.actionUrl}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                              }}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              {notification.actionLabel}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
