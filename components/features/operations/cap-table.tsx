"use client";

import { useState } from "react";
import { CapTable, Shareholder, saveOperations } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, PieChart as ChartIcon } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export function CapTableManager() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [data, setData] = useState<CapTable>(
    plan?.operations?.capTable || {
      totalShares: 1000000,
      shareholders: [
          { id: '1', name: 'بنیان‌گذار ۱', role: 'founder', shares: 600000 },
          { id: '2', name: 'بنیان‌گذار ۲', role: 'founder', shares: 400000 },
      ],
      valuation: 0,
      lastUpdated: new Date().toISOString()
    }
  );

  const addShareholder = () => {
    const newShareholder: Shareholder = {
        id: uuidv4(),
        name: 'سهامدار جدید',
        role: 'employee',
        shares: 0
    };
    setData({ ...data, shareholders: [...data.shareholders, newShareholder] });
  };

  const updateShareholder = (id: string, field: keyof Shareholder, value: any) => {
    const updatedList = data.shareholders.map(s => 
        s.id === id ? { ...s, [field]: value } : s
    );
    setData({ ...data, shareholders: updatedList });
  };

  const removeShareholder = (id: string) => {
    setData({ ...data, shareholders: data.shareholders.filter(s => s.id !== id) });
  };

  const handleSave = async () => {
    if (!user || !plan) return;
    try {
        const dataToSave = { ...data, lastUpdated: new Date().toISOString() };
        await saveOperations(user.uid, 'capTable', dataToSave, plan.id || 'current');
        updateActiveProject({ operations: { ...plan.operations, capTable: dataToSave } });
        toast.success("جدول سهام ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
        <div className="bg-card border border-border p-6 rounded-3xl flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <span className="text-blue-500">Cap Table Lite</span>
                    <span>جدول سهام</span>
                </h2>
                <p className="text-muted-foreground">ساختار مالکیت استارتاپ خود را مدیریت کنید.</p>
            </div>
            <Button onClick={handleSave}>ذخیره تغییرات</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table */}
            <div className="lg:col-span-2 space-y-4">
                <Card className="p-4 bg-muted/30 border-dashed border-2 flex items-center justify-between">
                    <div>
                         <span className="text-sm text-muted-foreground">کل سهام منتشر شده</span>
                         <h3 className="text-xl font-bold font-mono">{data.totalShares.toLocaleString()}</h3>
                    </div>
                </Card>

                {data.shareholders.map((person) => (
                    <Card key={person.id} className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full space-y-2">
                            <Input 
                                value={person.name} 
                                onChange={(e) => updateShareholder(person.id, 'name', e.target.value)}
                                className="font-bold"
                                placeholder="نام سهامدار"
                            />
                             <Select 
                                value={person.role} 
                                onValueChange={(val) => updateShareholder(person.id, 'role', val)}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="founder">بنیان‌گذار (Founder)</SelectItem>
                                    <SelectItem value="investor">سرمایه‌گذار (Investor)</SelectItem>
                                    <SelectItem value="employee">کارمند (Employee)</SelectItem>
                                    <SelectItem value="advisor">مشاور (Advisor)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex flex-col items-center">
                                <Input 
                                    type="number"
                                    value={person.shares}
                                    onChange={(e) => updateShareholder(person.id, 'shares', parseInt(e.target.value))}
                                    className="w-32 text-center font-mono"
                                />
                                <span className="text-xs text-muted-foreground mt-1">
                                    {((person.shares / data.totalShares) * 100).toFixed(1)}%
                                </span>
                            </div>
                            
                            <Button variant="ghost" size="icon" onClick={() => removeShareholder(person.id)} className="text-red-500 hover:bg-red-500/10">
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </Card>
                ))}

                <Button onClick={addShareholder} variant="outline" className="w-full border-dashed py-6 gap-2 text-muted-foreground">
                    <Plus size={18} />
                    افزودن سهامدار
                </Button>
            </div>

            {/* Chart */}
            <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                 <h3 className="font-bold mb-4 flex items-center gap-2">
                    <ChartIcon size={18} />
                    نمودار مالکیت
                 </h3>
                 <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={data.shareholders}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="shares"
                        >
                            {data.shareholders.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                         <Tooltip 
                            formatter={(value: any) => [`${value.toLocaleString()} سهم`, '']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
            </Card>
        </div>
    </div>
  );
}
