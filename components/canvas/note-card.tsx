"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CanvasCard } from "@/lib/db";
import { X, GripVertical } from "lucide-react";

interface NoteCardProps {
  card: CanvasCard;
  onUpdate: (id: string, content: string, color: CanvasCard['color']) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

const colorClasses: Record<CanvasCard['color'], string> = {
  yellow: "note-yellow",
  blue: "note-blue",
  green: "note-green",
  pink: "note-pink",
  purple: "note-purple",
  cyan: "note-cyan"
};

const colors: CanvasCard['color'][] = ['yellow', 'blue', 'green', 'pink', 'purple', 'cyan'];

function NoteCardComponent({ card, onUpdate, onDelete, disabled }: NoteCardProps) {
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
  } = useSortable({ 
    id: card.id, 
    disabled: isEditing || disabled,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      adjustHeight();
    }
  }, [isEditing]);

  useEffect(() => {
    setContent(card.content);
  }, [card.content]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(40, textareaRef.current.scrollHeight) + "px";
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = content.trim();
    if (trimmed && trimmed !== card.content) {
      onUpdate(card.id, trimmed, card.color);
    } else if (!trimmed) {
      setContent(card.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setContent(card.content);
      setIsEditing(false);
    }
  };

  const handleColorChange = (newColor: CanvasCard['color']) => {
    onUpdate(card.id, content, newColor);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`note-card ${colorClasses[card.color]} ${isDragging ? 'dragging' : ''}`}
    >
      {/* Hover Actions */}
      <div className="note-actions">
        <div className="color-dots">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`color-dot dot-${c}`}
              aria-label={c}
            />
          ))}
        </div>
        
        <button 
          {...attributes} 
          {...listeners}
          className="note-btn"
          aria-label="جابجایی"
        >
          <GripVertical />
        </button>
        
        <button 
          onClick={() => onDelete(card.id)}
          className="note-btn delete"
          aria-label="حذف"
        >
          <X />
        </button>
      </div>

      {/* Content */}
      <div 
        onClick={() => !disabled && !isDragging && setIsEditing(true)}
        className="cursor-text"
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              adjustHeight();
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none p-0 text-[13px] leading-relaxed"
            style={{ color: 'inherit' }}
            rows={1}
            dir="rtl"
          />
        ) : (
          <p className="note-text">{card.content}</p>
        )}
      </div>
    </div>
  );
}

// Memoize for performance
export const NoteCard = memo(NoteCardComponent);
