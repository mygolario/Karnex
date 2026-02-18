"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  LayoutGrid, Map, Bot, Calendar, Video, 
  Share2, Target, BarChart3, FileText, ArrowUpRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAccessGridProps {
  projectType?: string;
}

export function QuickAccessGrid({ projectType }: QuickAccessGridProps) {
  const items = [
    { href: "/dashboard/roadmap", icon: Map, label: "نقشه راه", color: "from-blue-500 to-cyan-500", desc: "مسیر پیشرفت" },
    { href: "/dashboard/canvas", icon: Target, label: "تحلیل کسب و کار", color: "from-amber-500 to-orange-500", desc: "مدل بیزینس" },
    { href: "/dashboard/copilot", icon: Bot, label: "دستیار کارنکس", color: "from-rose-500 to-pink-500", desc: "مشاوره AI", badge: "AI" },
    
    // Creator Specific
    ...(projectType === 'creator' ? [
       { href: "/dashboard/content-calendar", icon: Calendar, label: "تقویم محتوا", color: "from-purple-500 to-violet-500", desc: "برنامه‌ریزی" },
       { href: "/dashboard/scripts", icon: Video, label: "اسکریپت‌نویسی", color: "from-emerald-500 to-green-500", desc: "مدیریت ویدیو" },
    ] : []),

    // Traditional Specific
    ...(projectType === 'traditional' ? [
        { href: "/dashboard/location", icon: Map, label: "تحلیل مکان", color: "from-emerald-500 to-teal-500", desc: "انتخاب لوکیشن" },
        // Add more traditional items if they exist, e.g. Inventory? (Removed in previous cleanup)
     ] : []),
 
     // Startup Specific
     ...(projectType === 'startup' ? [
        { href: "/dashboard/pitch-deck", icon: Share2, label: "پیچ دک", color: "from-blue-500 to-indigo-500", desc: "ارائه سرمایه‌گذار" },
     ] : [])
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            دسترسی سریع
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <Link key={item.href} href={item.href} className="group">
             <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
             >
                <Card 
                  className="p-4 h-full border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/50 backdrop-blur-sm relative overflow-hidden"
                  data-tour-id={item.label === "نقشه راه" ? "quick-roadmap" : item.label === "دستیار هوشمند" ? "quick-copilot" : undefined}
                >
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br", item.color)} />
                    
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md mb-1",
                            "bg-gradient-to-br", item.color
                        )}>
                            <item.icon size={22} className="drop-shadow-sm" />
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-sm text-foreground mb-0.5">{item.label}</h4>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                    </div>

                    {item.badge && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-primary text-white shadow-sm">
                            {item.badge}
                        </span>
                    )}
                </Card>
             </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
