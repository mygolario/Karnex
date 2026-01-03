"use client";

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-automation';
import { useLocale } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

export function PushNotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const { locale, isRTL } = useLocale();

  useEffect(() => {
    // Don't show if not supported or already granted/denied
    if (!isSupported || permission !== 'default') {
      return;
    }

    // Check if user has dismissed before
    const dismissed = localStorage.getItem('karnex_push_prompt_dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  const handleEnable = async () => {
    const result = await requestPermission();
    setIsVisible(false);
    if (result === 'granted') {
      // Could show a success notification here
      console.log('Push notifications enabled');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('karnex_push_prompt_dismissed', new Date().toISOString());
  };

  if (!isVisible || isDismissed) return null;

  const labels = locale === 'fa' ? {
    title: 'اعلان‌ها را فعال کنید 🔔',
    description: 'از پیشرفت پروژه‌ها، یادآورها و نکات مفید مطلع شوید.',
    enable: 'فعال‌سازی',
    later: 'بعداً',
  } : {
    title: 'Enable Notifications 🔔',
    description: 'Stay updated on project progress, reminders, and helpful tips.',
    enable: 'Enable',
    later: 'Maybe Later',
  };

  return (
    <div 
      className={cn(
        "fixed bottom-4 z-50 mx-4 max-w-sm",
        isRTL ? "left-4" : "right-4"
      )}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 fade-in">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">
              {labels.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {labels.description}
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleEnable}
                className="flex-1"
              >
                {labels.enable}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDismiss}
              >
                {labels.later}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
