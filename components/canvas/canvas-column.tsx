"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CanvasCard } from "@/lib/db";
import { NoteCard } from "./note-card";
import { Plus } from "lucide-react";

interface CanvasColumnProps {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  cards: CanvasCard[];
  onAddCard: () => void;
  onUpdateCard: (id: string, content: string, color: CanvasCard['color']) => void;
  onDeleteCard: (id: string) => void;
  className?: string;
}

function CanvasColumnComponent({ 
  id, 
  title, 
  icon: Icon, 
  iconColor,
  cards, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard, 
  className = "" 
}: CanvasColumnProps) {
  
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={`block-card ${isOver ? 'is-over' : ''} ${className}`}>
      {/* Header */}
      <div className="block-header">
        <div className="block-title">
          <div className={`block-icon ${iconColor}`}>
            <Icon />
          </div>
          <div>
            <div className="block-label">{title}</div>
            <div className="block-count">{cards.length} مورد</div>
          </div>
        </div>

        <div className="block-actions">
          <button 
            onClick={onAddCard}
            className="block-btn"
            title="افزودن یادداشت"
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={setNodeRef} className="block-content">
        <SortableContext id={id} items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="notes-container">
            {cards.length === 0 ? (
              <div onClick={onAddCard} className="empty-state">
                <div className="empty-state-icon">
                  <Plus size={18} />
                </div>
                <span className="empty-state-text">افزودن یادداشت</span>
              </div>
            ) : (
              cards.map((card, index) => (
                <NoteCard 
                  key={card.id} 
                  card={card}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// Memoize for better performance
export const CanvasColumn = memo(CanvasColumnComponent);
