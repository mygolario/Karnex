"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CanvasCard as ICanvasCard } from "@/lib/db";
import { CanvasCard } from "./canvas-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  icon?: any;
  color: string;
  cards: ICanvasCard[];
  onAddCard: () => void;
  onUpdateCard: (id: string, content: string) => void;
  onDeleteCard: (id: string) => void;
}

export function CanvasSection({
  id,
  title,
  icon: Icon,
  color,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  className,
  ...props
}: CanvasSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Section",
      sectionId: id,
    },
  });

  const variants: Record<string, string> = {
    blue: "from-blue-50/80 to-blue-50/20 border-blue-100 dark:from-blue-900/20 dark:to-blue-900/5 dark:border-blue-800/30",
    green: "from-green-50/80 to-green-50/20 border-green-100 dark:from-green-900/20 dark:to-green-900/5 dark:border-green-800/30",
    red: "from-red-50/80 to-red-50/20 border-red-100 dark:from-red-900/20 dark:to-red-900/5 dark:border-red-800/30",
    yellow: "from-yellow-50/80 to-yellow-50/20 border-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/5 dark:border-yellow-800/30",
    purple: "from-purple-50/80 to-purple-50/20 border-purple-100 dark:from-purple-900/20 dark:to-purple-900/5 dark:border-purple-800/30",
    pink: "from-pink-50/80 to-pink-50/20 border-pink-100 dark:from-pink-900/20 dark:to-pink-900/5 dark:border-pink-800/30",
    orange: "from-orange-50/80 to-orange-50/20 border-orange-100 dark:from-orange-900/20 dark:to-orange-900/5 dark:border-orange-800/30",
    cyan: "from-cyan-50/80 to-cyan-50/20 border-cyan-100 dark:from-cyan-900/20 dark:to-cyan-900/5 dark:border-cyan-800/30",
    indigo: "from-indigo-50/80 to-indigo-50/20 border-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/5 dark:border-indigo-800/30",
    rose: "from-rose-50/80 to-rose-50/20 border-rose-100 dark:from-rose-900/20 dark:to-rose-900/5 dark:border-rose-800/30",
    violet: "from-violet-50/80 to-violet-50/20 border-violet-100 dark:from-violet-900/20 dark:to-violet-900/5 dark:border-violet-800/30",
    emerald: "from-emerald-50/80 to-emerald-50/20 border-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/5 dark:border-emerald-800/30",
    amber: "from-amber-50/80 to-amber-50/20 border-amber-100 dark:from-amber-900/20 dark:to-amber-900/5 dark:border-amber-800/30",
  };

  const iconVariants: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    red: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    pink: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  };

  return (
    <div
      ref={setNodeRef}
      {...props}
      className={cn(
        "flex flex-col rounded-2xl border bg-gradient-to-b shadow-sm transition-all duration-300 h-full min-h-[240px] overflow-hidden group hover:shadow-md canvas-section",
        variants[color] || variants.blue,
        // Glassmorphism base
        "bg-white/60 dark:bg-black/20 backdrop-blur-sm",
        isOver && "ring-2 ring-primary ring-inset bg-white/80 dark:bg-black/40 scale-[1.01] shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
           <div className={cn("p-1.5 rounded-lg transition-transform group-hover:scale-110", iconVariants[color] || iconVariants.blue)}>
              {Icon && <Icon size={14} className="stroke-[2.5px]" />}
           </div>
           
           <div className="flex flex-col">
              <h3 className="font-bold text-xs text-foreground/90 tracking-tight">{title}</h3>
           </div>
           
           <span className={cn(
               "ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors",
               cards.length > 0 
                  ? "bg-black/5 text-foreground/70 dark:bg-white/10" 
                  : "bg-transparent text-muted-foreground/40 group-hover:bg-black/5 dark:group-hover:bg-white/10"
           )}>
               {cards.length}
           </span>
        </div>
        
        <Button 
           variant="ghost" 
           size="icon" 
           className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground/50 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
           onClick={onAddCard}
        >
            <Plus size={14} />
        </Button>
      </div>

      {/* Cards Area */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {(() => {
           // Dedup cards to prevent key errors and ensure valid IDs
           const uniqueCards = Array.from(new Map(cards.filter(c => c && c.id).map(c => [c.id, c])).values());
           
           return (
            <SortableContext items={uniqueCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {uniqueCards.map(card => (
                <CanvasCard 
                  key={card.id} 
                  card={card} 
                  sectionId={id} 
                  sectionColor={color}
                  onUpdate={onUpdateCard} 
                  onDelete={onDeleteCard}
                />
              ))}
            </SortableContext>
           );
        })()}
        
        {cards.length === 0 && !isOver && (
            <div 
               className="h-full min-h-[120px] flex flex-col items-center justify-center text-muted-foreground/30 gap-2 cursor-pointer hover:text-muted-foreground/50 transition-all group/empty"
               onClick={onAddCard}
            >
                <div className="p-3 rounded-full border border-dashed border-current bg-transparent group-hover/empty:bg-black/5 dark:group-hover/empty:bg-white/5 transition-colors">
                    <Plus size={16} />
                </div>
                <span className="text-[10px] font-medium">افزودن مورد </span>
            </div>
        )}
      </div>
    </div>
  );
}
