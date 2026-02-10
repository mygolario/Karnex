"use client";

import { Card } from "@/components/ui/card";
import { useLocation } from "./location-context";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042', '#A28CDA'];

export function AnalysisCharts() {
  const { analysis } = useLocation();

  if (!analysis?.demographics) return null;

  // Transform demographics for Pie Chart
  const pieData = analysis.demographics.map((d, index) => ({
    name: d.label,
    value: d.percent,
    color: d.color || COLORS[index % COLORS.length]
  }));

  // Mock data for "Trend" if not available (since prompt doesn't strictly provide historical data yet)
  const trafficData = [
    { name: 'شنبه', traffic: 65 },
    { name: '۱شنبه', traffic: 59 },
    { name: '۲شنبه', traffic: 80 },
    { name: '۳شنبه', traffic: 81 },
    { name: '۴شنبه', traffic: 90 }, // Peak usually
    { name: '۵شنبه', traffic: 95 },
    { name: 'جمعه', traffic: 40 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Demographics Pie Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 h-[350px] flex flex-col items-center justify-center bg-card/40 backdrop-blur-md border-white/10">
          <h3 className="text-sm font-semibold mb-4 self-start text-muted-foreground">ترکیب جمعیتی (Demographics)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Traffic Trend (Mock/Estimated) - Placeholder for future "Peak Hours" real data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6 h-[350px] bg-card/40 backdrop-blur-md border-white/10">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground">روند ترافیک هفتگی (تخمین)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
              />
              <Bar dataKey="traffic" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

    </div>
  );
}
