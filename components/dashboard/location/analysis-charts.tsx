"use client";

import { Card } from "@/components/ui/card";
import { useLocation } from "./location-context";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { Clock, Info } from "lucide-react";

export function AnalysisCharts() {
  const { analysis } = useLocation();

  if (!analysis?.hourlyFootfall && !analysis?.peakHours) return null;

  // Fallback traffic data if AI didn't provide specific coordinates/hours
  const defaultTrafficData = [
    { hour: '۰۸:۰۰', trafficIndex: 25 },
    { hour: '۱۰:۰۰', trafficIndex: 45 },
    { hour: '۱۲:۰۰', trafficIndex: 65 },
    { hour: '۱۴:۰۰', trafficIndex: 50 },
    { hour: '۱۶:۰۰', trafficIndex: 60 },
    { hour: '۱۸:۰۰', trafficIndex: 85 },
    { hour: '۲۰:۰۰', trafficIndex: 95 },
    { hour: '۲۲:۰۰', trafficIndex: 70 },
  ];

  const chartData = analysis.hourlyFootfall && analysis.hourlyFootfall.length > 0
    ? analysis.hourlyFootfall.map(item => ({
        hour: item.hour.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]),
        trafficIndex: item.trafficIndex
      }))
    : defaultTrafficData;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-card/30 border-white/5 shadow-xl backdrop-blur-md text-right dir-rtl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            تحلیل زمانی تردد عابرین پیاده (پاخور)
          </h4>
          {analysis.peakHours && (
            <div className="text-xs text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              ساعات پیک: {analysis.peakHours}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          میزان تخمینی شلوغی و ترافیک عابرین پیاده در محدوده مغازه در ساعات مختلف روز
        </p>

        <div className="h-[240px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="hour" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                stroke="#64748b" 
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                stroke="#64748b" 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  backgroundColor: '#0f172a', 
                  color: '#fff', 
                  fontSize: '11px',
                  textAlign: 'right',
                  direction: 'rtl'
                }}
                formatter={(value: any) => [`${value}٪`, 'شاخص شلوغی']}
                labelFormatter={(label) => `ساعت: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="trafficIndex" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#trafficGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {analysis.aiInsight && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-[11px] text-muted-foreground leading-relaxed">
            <Info size={14} className="text-primary shrink-0 mt-0.5" />
            <span>پیشنهاد کارنکس: با تکیه بر پیک شلوغی در ساعات مشخص شده، بازه‌های تخفیفی پویا یا شیفت‌های کاری پرسنل را بهینه‌سازی کنید.</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
