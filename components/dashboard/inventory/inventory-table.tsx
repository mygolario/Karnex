"use client";

import { useInventory } from "./inventory-context";
import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, Edit3, Trash2, History, Search, ArrowUpDown, Filter, AlertCircle 
} from "lucide-react";
import { InventoryItem } from "@/lib/db";
import { AddItemModal } from "./add-item-modal";

export function InventoryTable() {
  const { items, deleteItem, loading } = useInventory();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "low": return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "out": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ok": return "موجود";
      case "low": return "رو به اتمام";
      case "out": return "ناموجود";
      default: return "";
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden">
      {/* Table Header / Filters */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'ok', 'low', 'out'].map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className="whitespace-nowrap rounded-xl"
              >
                {f === 'all' && 'همه کالاها'}
                {f === 'ok' && 'موجود'}
                {f === 'low' && 'کمبود موجودی'}
                {f === 'out' && 'ناموجود'}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 text-muted-foreground" size={16} />
            <input 
              placeholder="جستجو در انبار..." 
              className="w-full bg-background border border-input rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="w-[300px] text-right">نام کالا / SKU</TableHead>
                    <TableHead className="text-right">دسته‌بندی</TableHead>
                    <TableHead className="text-center">موجودی</TableHead>
                    <TableHead className="text-center">قیمت واحد</TableHead>
                    <TableHead className="text-center">وضعیت</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            هیچ کالایی یافت نشد
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredItems.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-muted/20">
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span className="font-bold text-base">{item.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{item.sku || '---'}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal opacity-80">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={`font-bold text-lg ${item.quantity <= item.minQuantity ? 'text-red-500' : ''}`}>
                                    {item.quantity}
                                </span>
                            </TableCell>
                            <TableCell className="text-center font-mono text-muted-foreground">
                                {item.unitPrice.toLocaleString()} 
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className={`${getStatusColor(item.status)} border-0`}>
                                    {getStatusText(item.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => setEditingItem(item)}>
                                            <Edit3 className="ml-2 h-4 w-4" /> ویرایش
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteItem(item.id)}>
                                            <Trash2 className="ml-2 h-4 w-4" /> حذف
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
      
      {/* Edit Modal */}
      {editingItem && (
        <AddItemModal 
          isOpen={true} 
          onClose={() => setEditingItem(null)} 
          editItem={editingItem} 
        />
      )}
    </div>
  );
}
