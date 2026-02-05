"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { CRMService, CRMCustomer } from "@/lib/services/crm-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Trash2,
  Edit3,
  Loader2,
  User,
  Building2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export function CustomerList() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [customers, setCustomers] = useState<CRMCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  // New States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<CRMCustomer>>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    status: "active",
    lifecycleStage: "lead",
    tags: []
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddOpen) {
      setEditingId(null);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        status: "active",
        lifecycleStage: "lead",
        tags: [],
      });
    }
  }, [isAddOpen]);

  const fetchCustomers = async () => {
    if (!user || !activeProject?.id) {
         setLoading(false);
         return;
    }
    setLoading(true);
    try {
      const data = await CRMService.getCustomers(user.uid, activeProject.id);
      setCustomers(data as CRMCustomer[]);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت لیست مشتریان");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user, activeProject]);

  const handleCreate = async () => {
    if (!user) {
        toast.error("خطا: کاربر وارد نشده است");
        return;
    }
    if (!activeProject?.id) {
        toast.error("خطا: پروژه فعال انتخاب نشده است");
        return;
    }
    
    if (!formData.firstName || !formData.phone) {
      toast.error("نام و شماره تماس الزامی است");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        // Update Mode
        await CRMService.updateCustomer(
          user.uid,
          activeProject.id,
          editingId,
          formData,
        );
        toast.success("اطلاعات مشتری بروزرسانی شد");
      } else {
        // Create Mode
        await CRMService.addCustomer(
          user.uid,
          activeProject.id,
          formData as any,
        );
        toast.success("مشتری با موفقیت اضافه شد");
      }
      setIsAddOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer: CRMCustomer) => {
    setEditingId(customer.id!);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email || "",
      status: customer.status,
      lifecycleStage: customer.lifecycleStage,
      tags: customer.tags || [],
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !activeProject?.id) return;
    if (!confirm("آیا از حذف این مشتری اطمینان دارید؟")) return;
    try {
      await CRMService.deleteCustomer(user.uid, activeProject.id, id);
      toast.success("مشتری حذف شد");
      fetchCustomers();
    } catch (error) {
      toast.error("خطا در حذف");
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.firstName.includes(searchQuery) ||
      c.lastName.includes(searchQuery) ||
      c.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="جستجو نام، شماره..."
            className="pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={isFilterOpen ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title="فیلترها"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4" />
                {editingId ? "ویرایش مشتری" : "مشتری جدید"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "ویرایش اطلاعات مشتری" : "افزودن مشتری جدید"}
                </DialogTitle>
                <DialogDescription>
                  اطلاعات مشتری را وارد کنید.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نام *</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نام خانوادگی</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">شماره تماس *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="font-mono dir-ltr text-right"
                    placeholder="0912..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ایمیل</label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="font-mono dir-ltr text-right"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">وضعیت</label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: any) =>
                        setFormData({ ...formData, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">فعال</SelectItem>
                        <SelectItem value="inactive">غیرفعال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">مرحله</label>
                    <Select
                      value={formData.lifecycleStage}
                      onValueChange={(v: any) =>
                        setFormData({ ...formData, lifecycleStage: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead (سرنخ)</SelectItem>
                        <SelectItem value="customer">مشتری</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="bg-indigo-600 text-white"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "ذخیره"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      {isFilterOpen && (
        <div className="p-4 bg-muted/50 rounded-lg flex gap-4 animate-in slide-in-from-top-2">
          <div className="w-48 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              وضعیت
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 bg-white dark:bg-slate-950">
                <SelectValue placeholder="همه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">مشتری</TableHead>
              <TableHead className="text-right">تماس</TableHead>
              <TableHead className="text-right">مرحله</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">تاریخ ثبت</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  هیچ مشتری یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {customer.firstName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span>
                          {customer.firstName} {customer.lastName}
                        </span>
                        {customer.company && (
                          <span className="text-[10px] text-muted-foreground">
                            {customer.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center gap-1 dir-ltr text-right justify-end">
                        <span>{customer.phone}</span>
                        <Phone className="w-3 h-3" />
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1 dir-ltr text-right justify-end">
                          <span className="truncate max-w-[120px]">
                            {customer.email}
                          </span>
                          <Mail className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-normal capitalize bg-background"
                    >
                      {customer.lifecycleStage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        customer.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : customer.status === "inactive"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {customer.status === "active" ? "فعال" : "غیرفعال"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {new Date(customer.createdAt as any).toLocaleDateString(
                      "fa-IR",
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-indigo-600"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDelete(customer.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
