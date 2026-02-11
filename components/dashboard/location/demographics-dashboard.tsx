"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

// Translation map for common English demographic labels from AI
const LABEL_FA: Record<string, string> = {
  "Young Professionals (25-35)": "جوانان شاغل (۲۵–۳۵)",
  "Young Professionals": "جوانان شاغل",
  "Families": "خانواده‌ها",
  "Students": "دانشجویان",
  "Seniors": "سالمندان",
  "Teenagers": "نوجوانان",
  "Children": "کودکان",
  "Middle-aged": "میان‌سالان",
  "Retirees": "بازنشستگان",
  "Workers": "کارگران",
  "Business Owners": "صاحبان کسب‌وکار",
};

function toPersianLabel(label: string): string {
  // Exact match first
  if (LABEL_FA[label]) return LABEL_FA[label];
  // Partial match (e.g. "Young Professionals (25-35)" contains "Young Professionals")
  for (const [en, fa] of Object.entries(LABEL_FA)) {
    if (label.includes(en)) return fa;
  }
  // If it's already Persian or unknown, return as-is
  return label;
}

export function DemographicsDashboard() {
  const { analysis } = useLocation();

  if (!analysis?.demographics) return null;

  const pieData = analysis.demographics.map((d, index) => ({
    name: toPersianLabel(d.label),
    value: d.percent,
    color: d.color || COLORS[index % COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographic Bars */}
        <Card className="p-6 bg-card/30 border-white/5">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Users size={16} className="text-primary" />
              بافت جمعیتی
            </h4>
            {analysis.population && (
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                {analysis.population}
              </Badge>
            )}
          </div>

          {analysis.populationDesc && (
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{analysis.populationDesc}</p>
          )}

          <div className="space-y-4">
            {analysis.demographics.map((demo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">{toPersianLabel(demo.label)}</span>
                  <span className="font-bold">{demo.percent}٪</span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: demo.color || COLORS[index % COLORS.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${demo.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 bg-card/30 border-white/5 flex flex-col items-center">
          <h4 className="font-bold text-sm self-start mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            ترکیب جمعیتی
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#1e293b',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value: string) => <span className="text-xs text-muted-foreground mr-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Insight */}
      {analysis.aiInsight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-primary mb-1">نکته حرفه‌ای</h4>
                <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                  {analysis.aiInsight}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
