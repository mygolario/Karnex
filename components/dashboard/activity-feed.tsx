"use client";

import { useState, useEffect } from "react";
import { 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  FileText,
  Palette,
  Megaphone,
  Bot,
  Clock,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface ActivityItem {
  id: string;
  type: "progress" | "ai" | "marketing" | "brand" | "milestone";
  title: string;
  description?: string;
  timestamp: Date;
  link?: string;
  metadata?: Record<string, string>;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  maxItems?: number;
  className?: string;
  showHeader?: boolean;
}

// Generate mock activities based on project data
function generateMockActivities(): ActivityItem[] {
  const now = new Date();
  return [
    {
      id: "1",
      type: "ai",
      title: "تولید محتوای بازاریابی",
      description: "۳ پست اینستاگرام با AI تولید شد",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      link: "/dashboard/marketing",
    },
    {
      id: "2",
      type: "progress",
      title: "مرحله تکمیل شد",
      description: "تحقیقات بازار انجام شد",
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      link: "/dashboard/roadmap",
    },
    {
      id: "3",
      type: "brand",
      title: "بروزرسانی برند",
      description: "پالت رنگی جدید ذخیره شد",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      link: "/dashboard/brand",
    },
    {
      id: "4",
      type: "milestone",
      title: "دستاورد جدید! 🎉",
      description: "۵۰٪ نقشه راه تکمیل شد",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: "5",
      type: "ai",
      title: "تحلیل کسب‌وکار",
      description: "گزارش تحلیلی آماده شد",
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      link: "/dashboard/canvas",
    },
  ];
}

const typeConfig = {
  progress: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  ai: {
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  marketing: {
    icon: Megaphone,
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
  brand: {
    icon: Palette,
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  milestone: {
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "همین الان";
  if (diffMins < 60) return `${diffMins} دقیقه پیش`;
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  if (diffDays === 1) return "دیروز";
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return date.toLocaleDateString("fa-IR");
}

export function ActivityFeed({ 
  activities, 
  maxItems = 5, 
  className,
  showHeader = true 
}: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Use provided activities or generate mock ones
    setItems(activities || generateMockActivities());
  }, [activities]);

  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">هنوز فعالیتی ثبت نشده</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">فعالیت‌های اخیر</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {items.length} فعالیت
          </Badge>
        </div>
      )}

      <div className="space-y-3">
        {displayItems.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          const content = (
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl transition-colors",
                item.link && "hover:bg-muted/50 cursor-pointer"
              )}
            >
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
                <p className="font-medium text-foreground text-sm line-clamp-1">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock size={10} />
                  {formatRelativeTime(item.timestamp)}
                </div>
              </div>
              {item.link && (
                <ChevronLeft size={16} className="text-muted-foreground shrink-0 mt-1" />
              )}
            </div>
          );

          return item.link ? (
            <Link key={item.id} href={item.link}>
              {content}
            </Link>
          ) : (
            <div key={item.id}>{content}</div>
          );
        })}
      </div>

      {items.length > maxItems && (
        <button className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 transition-colors">
          مشاهده همه ({items.length})
        </button>
      )}
    </div>
  );
}
