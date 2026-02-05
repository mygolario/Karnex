"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { CRMService, CRMDeal } from "@/lib/services/crm-service";
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const STAGES = [
  { id: 'new', title: 'سرنخ جدید', color: 'bg-blue-100 text-blue-800' },
  { id: 'qualification', title: 'ارزیابی', color: 'bg-purple-100 text-purple-800' },
  { id: 'proposal', title: 'ارسال پروپوزال', color: 'bg-amber-100 text-amber-800' },
  { id: 'negotiation', title: 'مذاکره', color: 'bg-orange-100 text-orange-800' },
  { id: 'closed-won', title: 'برنده شده', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'closed-lost', title: 'از دست رفته', color: 'bg-red-100 text-red-800' },
];

export function PipelineBoard() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<CRMDeal>>({
    title: "", value: 0, stageId: "new", probability: 50
  });

  const fetchDeals = async () => {
    if (!user || !activeProject?.id) return;
    try {
      const data = await CRMService.getDeals(user.uid, activeProject.id);
      setDeals(data as CRMDeal[]);
    } catch (e) {
      console.error(e);
      toast.error("خطا در دریافت معاملات");
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [user, activeProject]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
       // active.id is the deal ID
       // over.id is the Stage ID (container)
       const dealId = active.id as string;
       const newStageId = over.id as string;

       // Optimistic update
       setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId: newStageId } : d));

       try {
          if (!user || !activeProject?.id) return;
          await CRMService.updateDealStage(user.uid, activeProject.id, dealId, newStageId);
          toast.success("مرحله تغییر کرد");
       } catch (e) {
          toast.error("خطا در ذخیره تغییرات");
          fetchDeals(); // Revert
       }
    }
  };

  const handleAddDeal = async () => {
      if (!user || !activeProject?.id) return;
      try {
          // Ideally we select a customer here, simplified for now
          await CRMService.addDeal(user.uid, activeProject.id, {
             ...newDeal,
             currency: 'IRT',
             customerId: 'temp', // Needs customer selection
             customerName: 'مشتری موقت',
             priority: 'medium'
          } as any);
          toast.success("معامله ایجاد شد");
          setIsAddOpen(false);
          fetchDeals();
      } catch (e) {
          toast.error("خطا در ایجاد معامله");
      }
  }

  return (
    <div className="h-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1000px] h-full items-start">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
           {STAGES.map(stage => (
              <StageColumn key={stage.id} stage={stage} deals={deals.filter(d => d.stageId === stage.id)} />
           ))}
           
           <DragOverlay>
              {activeId ? (
                <DealCard deal={deals.find(d => d.id === activeId)!} isOverlay />
              ) : null}
           </DragOverlay>
        </DndContext>

        {/* Add Deal Button (Floating or in header) - put here for context */}
        <div className="fixed bottom-8 left-8 z-50">
             <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full h-14 w-14 shadow-xl bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-6 h-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>معامله جدید</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>عنوان معامله</Label>
                            <Input value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>مبلغ (تومان)</Label>
                            <Input type="number" value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label>مرحله</Label>
                            <Select value={newDeal.stageId} onValueChange={v => setNewDeal({...newDeal, stageId: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddDeal}>ثبت</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>
        </div>
      </div>
    </div>
  );
}

function StageColumn({ stage, deals }: { stage: any, deals: CRMDeal[] }) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div ref={setNodeRef} className="w-80 shrink-0 flex flex-col gap-3 bg-muted/30 rounded-xl p-3 h-[calc(100vh-200px)] border border-border/50">
      <div className={`p-3 rounded-lg ${stage.color} font-bold flex justify-between items-center text-sm`}>
         <span>{stage.title}</span>
         <span className="bg-white/50 px-2 py-0.5 rounded text-xs">{deals.length}</span>
      </div>
      <div className="text-xs text-muted-foreground px-1 font-mono">
         {totalValue.toLocaleString()} تومان
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
         {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
         ))}
      </div>
    </div>
  );
}

function DealCard({ deal, isOverlay }: { deal: CRMDeal, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: deal.id!,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card 
       ref={setNodeRef} 
       style={style} 
       {...listeners} 
       {...attributes}
       className={`p-3 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative group ${isOverlay ? 'shadow-xl rotate-2 scale-105 z-50' : ''}`}
    >
       <div className="flex justify-between items-start">
          <h4 className="font-bold text-sm line-clamp-2">{deal.title}</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 opacity-0 group-hover:opacity-100">
             <GripVertical className="w-3 h-3 text-muted-foreground" />
          </Button>
       </div>
       
       <div className="flex items-center gap-1 text-xs text-muted-foreground">
           <DollarSign className="w-3 h-3" />
           <span className="font-mono font-medium text-foreground">{deal.value?.toLocaleString()}</span>
       </div>

       {deal.customerName && (
           <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
               {deal.customerName}
           </div>
       )}

       {deal.expectedCloseDate && (
           <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 border-t pt-2">
               <Calendar className="w-3 h-3" />
               {new Date(deal.expectedCloseDate as any).toLocaleDateString('fa-IR')}
           </div>
       )}
    </Card>
  )
}
