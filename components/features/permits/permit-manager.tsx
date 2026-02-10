"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { PermitItem, savePermits } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText,
  Building2,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Default starter permits (could be better with AI later)
const DEFAULT_PERMITS: PermitItem[] = [
  { id: '1', title: 'جواز کسب', issuingAuthority: 'اتحادیه مربوطه', cost: '۲ تا ۵ میلیون', status: 'not_started', priority: 'high', notes: 'مهم‌ترین مجوز برای شروع فعالیت' },
  { id: '2', title: 'گواهی عدم سوء پیشینه', issuingAuthority: 'پلیس +۱۰', cost: '۱۰۰ هزار تومان', status: 'not_started', priority: 'medium' },
  { id: '3', title: 'تاییدیه اماکن', issuingAuthority: 'نیروی انتظامی', cost: 'رایگان', status: 'not_started', priority: 'high' }
];

export function PermitManager() {
  const { user } = useAuth();
  const { activeProject, updateActiveProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [permits, setPermits] = useState<PermitItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Permit Form State
  const [newPermit, setNewPermit] = useState<Partial<PermitItem>>({
    title: '', issuingAuthority: '', cost: '', priority: 'medium'
  });

  // Load Info or Set Defaults
  useEffect(() => {
    if (activeProject?.permits && activeProject.permits.length > 0) {
      setPermits(activeProject.permits);
    } else {
      setPermits(DEFAULT_PERMITS);
    }
  }, [activeProject]);

  const handleSave = async (updatedPermits: PermitItem[]) => {
    if (!user || !activeProject?.id) return;
    setPermits(updatedPermits);
    
    // Auto-save debounced or immediate
    try {
      await savePermits(user.id, updatedPermits, activeProject.id);
      updateActiveProject({ permits: updatedPermits });
    } catch (err) {
      console.error(err);
      toast.error("خطا در ذخیره تغییرات");
    }
  };

  const toggleStatus = (id: string) => {
    const updated = permits.map(p => {
      if (p.id === id) {
        let nextStatus: PermitItem['status'] = 'not_started';
        if (p.status === 'not_started') nextStatus = 'in_progress';
        else if (p.status === 'in_progress') nextStatus = 'done';
        else nextStatus = 'not_started';
        
        // Show celebration toast if done
        if (nextStatus === 'done') toast.success(`مجوز "${p.title}" تکمیل شد! 🎉`);
        
        return { ...p, status: nextStatus };
      }
      return p;
    });
    handleSave(updated);
  };

  const deletePermit = (id: string) => {
    if (confirm("آیا مطمئن هستید؟")) {
      const updated = permits.filter(p => p.id !== id);
      handleSave(updated);
    }
  };

  const addNewPermit = async () => {
    if (!newPermit.title) return;
    
    const item: PermitItem = {
      id: Date.now().toString(),
      title: newPermit.title,
      issuingAuthority: newPermit.issuingAuthority || 'نامشخص',
      cost: newPermit.cost || '؟',
      status: 'not_started',
      priority: (newPermit.priority as any) || 'medium',
      notes: ''
    };
    
    const updated = [...permits, item];
    handleSave(updated);
    setNewPermit({ title: '', issuingAuthority: '', cost: '', priority: 'medium' });
    setIsAdding(false);
    toast.success("مجوز جدید اضافه شد");
  };

  // Calculations
  const completedCount = permits.filter(p => p.status === 'done').length;
  const progress = permits.length > 0 ? (completedCount / permits.length) * 100 : 0;

  return (
    <div className="space-y-8">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="default" className="flex items-center gap-4 border-l-4 border-l-green-500">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <FileText size={24} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">تعداد کل مجوزها</p>
                <p className="text-2xl font-black">{permits.length}</p>
            </div>
        </Card>
        <Card padding="default" className="flex items-center gap-4 border-l-4 border-l-yellow-500">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600">
                <Clock size={24} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">در حال پیگیری</p>
                <p className="text-2xl font-black">{permits.filter(p => p.status === 'in_progress').length}</p>
            </div>
        </Card>
        <Card padding="default" className="flex items-center gap-4 border-l-4 border-l-green-500">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={24} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">تکمیل شده</p>
                <p className="text-2xl font-black">{completedCount}</p>
            </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
             <span>پیشرفت کلی</span>
             <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-4 w-full bg-secondary/20 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
            />
        </div>
      </div>

      {/* Main List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-bold flex items-center gap-2">
                <Building2 size={18} />
                لیست مجوزها
            </h3>
            <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                <Plus size={16} className="mr-1" />
                افزودن مجوز
            </Button>
        </div>

        {/* Add Form */}
        {isAdding && (
            <div className="p-4 bg-primary/5 border-b border-primary/20 grid gap-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        placeholder="عنوان مجوز (مثلاً پروانه بهداشت)" 
                        value={newPermit.title}
                        onChange={e => setNewPermit({...newPermit, title: e.target.value})}
                        autoFocus
                    />
                    <Input 
                        placeholder="مرجع صادرکننده (مثلاً شهرداری)" 
                        value={newPermit.issuingAuthority}
                        onChange={e => setNewPermit({...newPermit, issuingAuthority: e.target.value})}
                    />
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={addNewPermit}>ثبت</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>انصراف</Button>
                </div>
            </div>
        )}

        <div className="divide-y divide-border">
            {permits.map((permit) => (
                <div 
                    key={permit.id} 
                    className={`p-4 flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:bg-muted/10 ${permit.status === 'done' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                >
                    {/* Status Toggle */}
                    <button 
                        onClick={() => toggleStatus(permit.id)}
                        className={`
                            shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all
                            ${permit.status === 'done' ? 'bg-green-500 text-white' : 
                              permit.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400' : 
                              'bg-muted text-muted-foreground hover:bg-gray-300'}
                        `}
                        title="تغییر وضعیت"
                    >
                        {permit.status === 'done' ? <CheckCircle2 size={18} /> : 
                         permit.status === 'in_progress' ? <Clock size={16} /> : 
                         <Circle size={16} />}
                    </button>

                    {/* Details */}
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-bold ${permit.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                {permit.title}
                            </h4>
                            {permit.priority === 'high' && <Badge variant="danger" size="sm" className="text-[10px] px-1 h-5">ضروری</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Building2 size={12} />
                                {permit.issuingAuthority}
                            </span>
                             <span className="flex items-center gap-1">
                                <DollarSign size={12} />
                                {permit.cost}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:justify-end">
                       {/* Dropdown or simple delete for now */}
                       <Button variant="ghost" size="icon-sm" onClick={() => deletePermit(permit.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 size={16} />
                       </Button>
                    </div>
                </div>
            ))}
            
            {permits.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                    هیچ مجوزی ثبت نشده است.
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}
