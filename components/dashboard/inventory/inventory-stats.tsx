import { Card } from "@/components/ui/card";
import { ArrowUpRight, AlertTriangle, RefreshCw, Truck, TrendingUp, DollarSign, Package } from "lucide-react";
import { useInventory } from "./inventory-context";

export function InventoryStats() {
  const { stats } = useInventory();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
             <DollarSign size={64} />
        </div>
        <p className="text-xs text-muted-foreground mb-1">ارزش کل موجودی</p>
        <h3 className="text-2xl font-black text-foreground mb-2 flex items-baseline gap-1">
            {(stats.totalValue / 1000000).toFixed(1)} <span className="text-xs font-normal text-muted-foreground">میلیون تومان</span>
        </h3>
        <div className="flex items-center gap-1 text-emerald-500 text-xs">
          <TrendingUp size={14} />
          <span>بروز شده</span>
        </div>
      </Card>
      
      <Card className="p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
             <AlertTriangle size={64} />
        </div>
        <p className="text-xs text-muted-foreground mb-1">کالا‌های ناموجود</p>
        <h3 className="text-2xl font-black text-red-600 mb-2">
          {stats.outOfStockCount} <span className="text-xs font-normal text-muted-foreground">قلم</span>
        </h3>
        <div className="flex items-center gap-1 text-red-500 text-xs">
          <AlertTriangle size={14} />
          <span>نیاز به سفارش فوری</span>
        </div>
      </Card>

      <Card className="p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
             <RefreshCw size={64} />
        </div>
        <p className="text-xs text-muted-foreground mb-1">رو به اتمام</p>
        <h3 className="text-2xl font-black text-amber-500 mb-2">
          {stats.lowStockCount} <span className="text-xs font-normal text-muted-foreground">قلم</span>
        </h3>
        <div className="flex items-center gap-1 text-amber-500 text-xs">
          <RefreshCw size={14} />
          <span>نیاز به شارژ</span>
        </div>
      </Card>

      <Card className="p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
             <Package size={64} />
        </div>
        <p className="text-xs text-muted-foreground mb-1">کل اقلام</p>
        <h3 className="text-2xl font-black text-blue-500 mb-2">
            {stats.totalItems} <span className="text-xs font-normal text-muted-foreground">عدد</span>
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Package size={14} />
          <span>در انبار</span>
        </div>
      </Card>
    </div>
  );
}
