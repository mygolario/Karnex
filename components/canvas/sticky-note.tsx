"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CanvasCard } from "@/lib/db";
import { X, GripVertical } from "lucide-react";

interface StickyNoteProps {
  card: CanvasCard;
  onUpdate: (id: string, content: string, color: CanvasCard['color']) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
  style?: CSSProperties;
}

const colorClasses: Record<CanvasCard['color'], string> = {
  yellow: "sticky-yellow",
  blue: "sticky-blue",
  green: "sticky-green",
  pink: "sticky-pink",
  purple: "sticky-purple",
  cyan: "sticky-cyan",
  red: "sticky-red",
  orange: "sticky-orange"
};

const colorDotClasses: Record<CanvasCard['color'], string> = {
  yellow: "color-dot-yellow",
  blue: "color-dot-blue",
  green: "color-dot-green",
  pink: "color-dot-pink",
  purple: "color-dot-purple",
  cyan: "color-dot-cyan",
  red: "color-dot-red",
  orange: "color-dot-orange"
};

const colors: CanvasCard['color'][] = ['yellow', 'blue', 'green', 'pink', 'purple', 'cyan'];

export function StickyNote({ card, onUpdate, onDelete, disabled, style }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(card.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id, disabled: isEditing || disabled });

  const combinedStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...style
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  // Sync content when card changes externally
  useEffect(() => {
    setContent(card.content);
  }, [card.content]);

  const handleBlur = () => {
    setIsEditing(false);
    if (content.trim() !== card.content) {
      onUpdate(card.id, content, card.color);
    }
  };

  const handleColorChange = (newColor: CanvasCard['color']) => {
    onUpdate(card.id, content, newColor);
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={`
        sticky-note 
        ${colorClasses[card.color]} 
        ${isDragging ? 'is-dragging' : ''}
        animate-fade-in
      `}
    >
      {/* Actions Overlay */}
      <div className="sticky-note-actions">
        {/* Color Picker */}
        <div className="color-picker">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`
                color-dot 
                ${colorDotClasses[c]}
                ${card.color === c ? 'active' : ''}
              `}
              aria-label={`تغییر رنگ به ${c}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* Drag Handle */}
          <button 
            {...attributes} 
            {...listeners} 
            className="p-1 hover:bg-black/5 rounded cursor-grab active:cursor-grabbing"
            aria-label="جابجایی"
          >
            <GripVertical size={14} className="text-black/40" />
          </button>
          
          {/* Delete */}
          <button 
            onClick={() => onDelete(card.id)} 
            className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded text-black/40 transition-colors"
            aria-label="حذف"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        onClick={() => !disabled && setIsEditing(true)} 
        className="sticky-note-content min-h-[40px] cursor-text pt-6"
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleBlur();
              }
            }}
            className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none p-0 text-inherit font-medium leading-relaxed"
            rows={2}
            dir="rtl"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {card.content}
          </p>
        )}
      </div>
    
      {/* ID Badge */}
      <span className="sticky-note-id">
        #{card.id.slice(-4)}
      </span>
    </div>
  );
}
