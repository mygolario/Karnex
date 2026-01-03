"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, Info, Loader2 } from "lucide-react";
import { automationEngine } from "@/lib/automation";

type NotificationType = "success" | "error" | "info" | "loading";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be within NotificationProvider");
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, message, duration }]);

    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Connect automation engine to notification system
  useEffect(() => {
    automationEngine.setNotificationHandler((smartNotification) => {
      // Map smart notification to simple notification
      const typeMap: Record<string, NotificationType> = {
        welcome: 'success',
        milestone: 'success',
        achievement: 'success',
        reminder: 'info',
        suggestion: 'info',
        update: 'info',
        warning: 'error',
        system: 'info',
      };
      
      const notificationType = typeMap[smartNotification.type] || 'info';
      showNotification(notificationType, smartNotification.message, 6000);
    });
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}


function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[]; 
  onRemove: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success": return <CheckCircle2 size={20} className="text-emerald-500" />;
      case "error": return <AlertTriangle size={20} className="text-rose-500" />;
      case "info": return <Info size={20} className="text-blue-500" />;
      case "loading": return <Loader2 size={20} className="text-primary animate-spin" />;
    }
  };

  const getBg = (type: NotificationType) => {
    switch (type) {
      case "success": return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800";
      case "error": return "bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800";
      case "info": return "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800";
      case "loading": return "bg-primary/5 border-primary/20";
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] space-y-2 max-w-sm w-full px-4">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
            animate-in slide-in-from-top-2 fade-in duration-300
            ${getBg(notification.type)}
          `}
        >
          {getIcon(notification.type)}
          <span className="flex-1 text-sm font-medium text-foreground">
            {notification.message}
          </span>
          {notification.type !== "loading" && (
            <button 
              onClick={() => onRemove(notification.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
