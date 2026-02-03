"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, Boxes, TrendingDown, AlertTriangle, 
  RefreshCw, Truck, ArrowUpRight, ArrowDownRight,
  Filter, Download, Plus, Search, Archive,
  History as HistoryIcon, BarChart2, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle2, MoreHorizontal, 
  Edit3, Trash2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  lastRestock: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export default function InventoryPage() {
  const { activeProject: plan } = useProject();
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "قهوه عربیکا ۱۰۰٪",
      sku: "CF-001",
      category: "مواد اولیه",
      quantity: 15,
      minQuantity: 10,
      price: 450000,
      supplier: "قهوه تابان",
      lastRestock: "1402/11/01",
      status: "in-stock"
    },
    {
      id: "2",
      name: "شیر پرچرب",
      sku: "MK-204",
      category: "لبنیات",
      quantity: 4,
      minQuantity: 12,
      price: 35000,
      supplier: "پگاه",
      lastRestock: "1402/11/10",
      status: "low-stock"
    },
    {
      id: "3",
      name: "لیوان بیرون‌بر",
      sku: "CP-100",
      category: "ملزومات",
      quantity: 0,
      minQuantity: 100,
      price: 2500,
      supplier: "پلاستیک صنعت",
      lastRestock: "1402/10/25",
      status: "out-of-stock"
    }
  ]);
  const [filter, setFilter] = useState("all");

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Package size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">مدیریت موجودی برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "low-stock": return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "out-of-stock": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in-stock": return "موجود";
      case "low-stock": return "رو به اتمام";
      case "out-of-stock": return "ناموجود";
      default: return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">مدیریت هوشمند موجودی</h1>
              <p className="text-muted-foreground">پیگیری کالاها، هشدار اتمام موجودی و سفارش‌گذاری خودکار</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={18} />
            خروجی اکسل
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
            <Plus size={18} />
            کالای جدید
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">ارزش کل موجودی</p>
          <h3 className="text-2xl font-black text-foreground mb-2">۴۵.۸ <span className="text-sm font-normal text-muted-foreground">میلیون</span></h3>
          <div className="flex items-center gap-1 text-emerald-500 text-xs">
            <ArrowUpRight size={14} />
            <span>۱۲٪ نسبت به ماه قبل</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">کالا‌های ناموجود</p>
          <h3 className="text-2xl font-black text-red-600 mb-2">۳ <span className="text-sm font-normal text-muted-foreground">قلم</span></h3>
          <div className="flex items-center gap-1 text-red-500 text-xs">
            <AlertTriangle size={14} />
            <span>نیاز به سفارش فوری</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">کالا‌های رو به اتمام</p>
          <h3 className="text-2xl font-black text-amber-500 mb-2">۵ <span className="text-sm font-normal text-muted-foreground">قلم</span></h3>
          <div className="flex items-center gap-1 text-amber-500 text-xs">
            <RefreshCw size={14} />
            <span>در حال پردازش</span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">تامین‌کنندگان فعال</p>
          <h3 className="text-2xl font-black text-blue-500 mb-2">۸ <span className="text-sm font-normal text-muted-foreground">شرکت</span></h3>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Truck size={14} />
            <span>۲ سفارش در راه</span>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['all', 'in-stock', 'low-stock', 'out-of-stock'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className="whitespace-nowrap"
              >
                {f === 'all' && 'همه کالاها'}
                {f === 'in-stock' && 'موجود'}
                {f === 'low-stock' && 'کمبود موجودی'}
                {f === 'out-of-stock' && 'ناموجود'}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
            <input 
              placeholder="جستجو در انبار..." 
              className="input-premium w-full pr-10 py-2 text-sm"
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="p-4 text-right font-medium text-muted-foreground">نام کالا / SKU</th>
                <th className="p-4 text-right font-medium text-muted-foreground">دسته‌بندی</th>
                <th className="p-4 text-center font-medium text-muted-foreground">موجودی</th>
                <th className="p-4 text-center font-medium text-muted-foreground">وضعیت</th>
                <th className="p-4 text-center font-medium text-muted-foreground">آخرین خرید</th>
                <th className="p-4 text-left font-medium text-muted-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <Badge variant="outline" className="font-normal opacity-70">{item.category}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-bold">{item.quantity}</div>
                    <div className="text-[10px] text-muted-foreground">حداقل: {item.minQuantity}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="p-4 text-center text-muted-foreground">
                    {item.lastRestock}
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HistoryIcon size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit3 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* AI Bot Suggestion */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">دستیار هوشمند انبار</h3>
              <p className="text-blue-100 max-w-lg">
                بر اساس الگوی مصرف ماه گذشته، پیش‌بینی می‌شود موجودی "قهوه عربیکا" تا ۳ روز دیگر تمام شود. آیا سفارش جدید ثبت شود؟
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
               فعلاً نه
             </Button>
             <Button className="bg-white text-blue-700 hover:bg-blue-50">
               ثبت سفارش خودکار
             </Button>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />
      </div>
    </div>
  );
}
