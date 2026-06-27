"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor,
  PointerSensor, useSensor, useSensors,
  DragStartEvent, DragOverEvent, DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { useCanvasStore } from "@/lib/canvas/store";
import { CanvasSection } from "./canvas-section";
import { CanvasCard } from "./canvas-card";
import { getTemplate } from "@/lib/canvas/templates";
import { toast } from "sonner";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardData, CanvasConnection } from "@/lib/canvas/types";

interface CanvasBoardProps {
  boardRef?: React.MutableRefObject<HTMLDivElement | null>;
}

// Math helpers for SVG connector curves
const getCardCoords = (
  card: CardData,
  fromSectionId: string,
  zones: Record<string, { x: number; y: number; w: number; h: number }>
) => {
  let cx = card.x;
  let cy = card.y;

  if (cx === undefined || cy === undefined) {
    const zone = zones[fromSectionId];
    if (zone) {
      cx = zone.x + 20;
      cy = zone.y + 40 + (card.order * 105);
    } else {
      cx = 100;
      cy = 100;
    }
  }

  const w = card.width || 190;
  const h = card.height || 96;

  return {
    top: { x: cx + w / 2, y: cy },
    bottom: { x: cx + w / 2, y: cy + h },
    left: { x: cx, y: cy + h / 2 },
    right: { x: cx + w, y: cy + h / 2 },
    center: { x: cx + w / 2, y: cy + h / 2 }
  };
};

const getBestConnectionPoints = (
  fromCard: CardData,
  fromSection: string,
  toCard: CardData,
  toSection: string,
  zones: Record<string, { x: number; y: number; w: number; h: number }>
) => {
  const fromCoords = getCardCoords(fromCard, fromSection, zones);
  const toCoords = getCardCoords(toCard, toSection, zones);

  const options = [
    { from: fromCoords.top, to: toCoords.bottom, fromPos: "top", toPos: "bottom" },
    { from: fromCoords.bottom, to: toCoords.top, fromPos: "bottom", toPos: "top" },
    { from: fromCoords.left, to: toCoords.right, fromPos: "left", toPos: "right" },
    { from: fromCoords.right, to: toCoords.left, fromPos: "right", toPos: "left" },
    { from: fromCoords.top, to: toCoords.left, fromPos: "top", toPos: "left" },
    { from: fromCoords.top, to: toCoords.right, fromPos: "top", toPos: "right" },
    { from: fromCoords.bottom, to: toCoords.left, fromPos: "bottom", toPos: "left" },
    { from: fromCoords.bottom, to: toCoords.right, fromPos: "bottom", toPos: "right" },
  ];

  let bestOption = options[0];
  let minDistance = Infinity;

  for (const opt of options) {
    const dx = opt.from.x - opt.to.x;
    const dy = opt.from.y - opt.to.y;
    const dist = dx * dx + dy * dy;
    if (dist < minDistance) {
      minDistance = dist;
      bestOption = opt;
    }
  }

  return bestOption;
};

const getBezierPath = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  fromPos: string,
  toPos: string
) => {
  let cx1 = p1.x;
  let cy1 = p1.y;
  let cx2 = p2.x;
  let cy2 = p2.y;

  const offset = Math.min(120, Math.max(40, Math.abs(p1.x - p2.x) / 1.5));

  if (fromPos === "left") cx1 -= offset;
  else if (fromPos === "right") cx1 += offset;
  else if (fromPos === "top") cy1 -= offset;
  else if (fromPos === "bottom") cy1 += offset;

  if (toPos === "left") cx2 -= offset;
  else if (toPos === "right") cx2 += offset;
  else if (toPos === "top") cy2 -= offset;
  else if (toPos === "bottom") cy2 += offset;

  return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
};

export function CanvasBoard({ boardRef }: CanvasBoardProps) {
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const addCard = useCanvasStore((s) => s.addCard);
  const updateCard = useCanvasStore((s) => s.updateCard);
  const deleteCard = useCanvasStore((s) => s.deleteCard);
  const moveCard = useCanvasStore((s) => s.moveCard);
  const addAICards = useCanvasStore((s) => s.addAICards);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const searchQuery = useCanvasStore((s) => s.searchQuery);
  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const zoomReset = useCanvasStore((s) => s.zoomReset);

  // Reworked States & Actions
  const viewMode = useCanvasStore((s) => s.viewMode);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const connections = useCanvasStore((s) => s.connections);
  const addConnection = useCanvasStore((s) => s.addConnection);
  const deleteConnection = useCanvasStore((s) => s.deleteConnection);
  const updateCardPosition = useCanvasStore((s) => s.updateCardPosition);
  const moveCardToSection = useCanvasStore((s) => s.moveCardToSection);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const [zones, setZones] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const sectionZonesRef = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});

  // Mouse drag connection creation state
  const [connDrag, setConnDrag] = useState<{
    fromCardId: string;
    fromPos: string;
    currentX: number;
    currentY: number;
  } | null>(null);

  const template = getTemplate(canvasType);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allCardIds = useMemo(() => {
    return template.sections.flatMap((s) => (canvasState[s.id] || []).map((c) => c.id));
  }, [canvasState, template.sections]);

  // Flat lookup of all cards for connection rendering
  const cardMap = useMemo(() => {
    const map: Record<string, { card: CardData; sectionId: string }> = {};
    for (const [sectionId, cards] of Object.entries(canvasState)) {
      for (const card of cards) {
        map[card.id] = { card, sectionId };
      }
    }
    return map;
  }, [canvasState]);

  // Measure zones on viewMode switch / template resize
  useEffect(() => {
    if (viewMode !== "freeform") return;

    const measure = () => {
      const container = document.getElementById("bmc-canvas-content-background");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const elements = container.querySelectorAll(".section-zone-bg");
      const newZones: Record<string, { x: number; y: number; w: number; h: number }> = {};

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const sectionId = el.getAttribute("data-section-id");
        if (sectionId) {
          newZones[sectionId] = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            w: rect.width,
            h: rect.height,
          };
        }
      });

      setZones(newZones);
      sectionZonesRef.current = newZones;
    };

    const timer = setTimeout(measure, 150);
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [viewMode, canvasType]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { card } = active.data.current || {};
    setActiveId(active.id as string);
    setActiveCard(card || null);
    setIsDragging(true);
  };

  const handleDragOver = (_event: DragOverEvent) => { void _event; };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);
    setActiveCard(null);
    setIsDragging(false);

    if (!active) return;

    const activeIdStr = active.id as string;
    const activeData = active.data.current;
    if (!activeData) return;

    const currentCard = activeData.card as CardData;
    const fromSection = activeData.sectionId as string;

    if (viewMode === "freeform") {
      // 1. Calculate new coordinates relative to the canvas origin
      const zoom = viewport.zoom;
      
      let x0 = currentCard.x;
      let y0 = currentCard.y;

      if (x0 === undefined || y0 === undefined) {
        const zone = sectionZonesRef.current[fromSection];
        if (zone) {
          x0 = zone.x + 20;
          y0 = zone.y + 40 + (currentCard.order * 105);
        } else {
          x0 = 100;
          y0 = 100;
        }
      }

      const xNew = x0 + delta.x / zoom;
      const yNew = y0 + delta.y / zoom;

      // 2. Bounding box intersection check
      let targetSection = fromSection;
      
      for (const [sectionId, zone] of Object.entries(sectionZonesRef.current)) {
        // card center coordinate approx
        const cx = xNew + (currentCard.width || 190) / 2;
        const cy = yNew + (currentCard.height || 96) / 2;

        if (cx >= zone.x && cx <= zone.x + zone.w && cy >= zone.y && cy <= zone.y + zone.h) {
          targetSection = sectionId;
          break;
        }
      }

      if (targetSection !== fromSection) {
        moveCardToSection(activeIdStr, fromSection, targetSection, xNew, yNew);
      } else {
        updateCardPosition(fromSection, activeIdStr, xNew, yNew);
      }
    } else {
      // Grid Mode re-sort
      const over = event.over;
      if (!over) return;
      const overIdStr = over.id as string;
      const overData = over.data.current;
      if (!overData) return;

      const activeSection = activeData.sortable?.containerId || activeData.sectionId;
      const overSection = overData.sortable?.containerId || overData.sectionId || overIdStr;

      if (activeSection && overSection) {
        moveCard(activeIdStr, overIdStr, activeSection, overSection);
      }
    }
  };

  const handleAISuggest = useCallback(async (sectionId: string) => {
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const store = useCanvasStore.getState();
    store.setSaveStatus("saving");

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-section-cards",
          sectionId,
          sectionTitle: section.title,
          prompt: `۳ ایده کوتاه و کاربردی برای بخش «${section.title}» یک بوم کسب‌وکار تولید کن. هر ایده در یک خط جداگانه.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cards) {
          addAICards(sectionId, data.cards.map((c: string) => ({ content: c })));
          toast.success("پیشنهادهای هوش مصنوعی اضافه شد");
        }
      } else if (response.status === 429) {
        toast.error("محدودیت هوش مصنوعی رسید");
      }
    } catch {
      toast.error("خطا در ارتباط با هوش مصنوعی");
    } finally {
      store.setSaveStatus("saving");
    }
  }, [template, addAICards]);

  // Connection drag event listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "arrow" || viewMode !== "freeform") return;

    const target = e.target as HTMLElement;
    const handle = target.closest(".connection-handle");
    if (!handle) return;

    e.preventDefault();
    e.stopPropagation();

    const fromCardId = handle.getAttribute("data-card-id")!;
    const fromPos = handle.getAttribute("data-handle-pos")!;

    const container = document.getElementById("bmc-canvas-content");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const zoom = viewport.zoom;
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    setConnDrag({
      fromCardId,
      fromPos,
      currentX: mouseX,
      currentY: mouseY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!connDrag) return;

    const container = document.getElementById("bmc-canvas-content");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const zoom = viewport.zoom;
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    setConnDrag({
      ...connDrag,
      currentX: mouseX,
      currentY: mouseY,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!connDrag) return;

    const target = e.target as HTMLElement;
    const handle = target.closest(".connection-handle");
    const cardEl = target.closest(".cyber-pastel-card");

    let toCardId = null;
    if (handle) {
      toCardId = handle.getAttribute("data-card-id");
    } else if (cardEl) {
      toCardId = cardEl.getAttribute("data-card-id");
    }

    if (toCardId && toCardId !== connDrag.fromCardId) {
      addConnection(connDrag.fromCardId, toCardId);
      toast.success("اتصال برقرار شد");
    }

    setConnDrag(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      if (e.key === "Escape") {
        clearSelection();
      } else if (e.key === "n" || e.key === "N") {
        const firstSection = template.sections[0];
        if (firstSection) addCard(firstSection.id);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomIn(); }
        if (e.key === "-") { e.preventDefault(); zoomOut(); }
        if (e.key === "0") { e.preventDefault(); zoomReset(); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [template, clearSelection, addCard, zoomIn, zoomOut, zoomReset]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveId(null); setActiveCard(null); setIsDragging(false); }}
    >
      <div
        className="relative flex-1 overflow-hidden bg-muted/20 dark:bg-black/40"
        onClick={(e) => {
          if (e.target === e.currentTarget) clearSelection();
        }}
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={viewport.zoom}
          minScale={0.25}
          maxScale={2.5}
          centerOnInit={false}
          disablePadding={true}
          wheel={{ step: 0.08, wheelDisabled: false }}
          doubleClick={{ disabled: true }}
          panning={{
            velocityDisabled: true,
            excluded: ["no-pan", "canvas-card-inner", "textarea", "button", "connection-handle"],
            disabled: isDragging || activeTool !== "select" || connDrag !== null
          }}
          onZoom={(ref) => setViewport({ zoom: ref.state.scale })}
          onPanning={(ref) => setViewport({ panX: ref.state.positionX, panY: ref.state.positionY })}
          limitToBounds={false}
        >
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="p-6"
          >
            <div
              ref={(node) => {
                innerRef.current = node;
                if (boardRef) boardRef.current = node;
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              id="bmc-canvas-content"
              data-tour-id="canvas-board"
              className={cn(
                "relative min-w-[1250px] min-h-[920px]",
                viewMode === "freeform" && "canvas-grid-bg"
              )}
              style={viewMode === "grid" ? {
                display: "grid",
                gap: "12px",
                gridTemplateColumns: template.gridTemplateColumns,
                gridTemplateRows: template.gridTemplateRows,
                gridTemplateAreas: template.gridTemplateAreas,
              } : undefined}
            >
              <SortableContext items={allCardIds} strategy={rectSortingStrategy}>
                {/* GRID VIEW RENDERING */}
                {viewMode === "grid" && template.sections.map((section) => {
                  const sectionCards = canvasState[section.id] || [];
                  return (
                    <CanvasSection
                      key={section.id}
                      id={section.id}
                      title={section.title}
                      icon={section.icon}
                      color={section.color}
                      description={section.description}
                      cards={sectionCards}
                      onAddCard={() => addCard(section.id)}
                      onUpdateCard={(cardId, content) => updateCard(section.id, cardId, content)}
                      onDeleteCard={(cardId) => deleteCard(section.id, cardId)}
                      onAISuggest={() => handleAISuggest(section.id)}
                      searchQuery={searchQuery}
                      style={{ gridArea: section.area }}
                    />
                  );
                })}

                {/* FREEFORM VIEW RENDERING */}
                {viewMode === "freeform" && (
                  <>
                    {/* 1. Background Grid Zones */}
                    <div
                      id="bmc-canvas-content-background"
                      className="absolute inset-0 grid gap-3 pointer-events-none opacity-45 select-none"
                      style={{
                        gridTemplateColumns: template.gridTemplateColumns,
                        gridTemplateRows: template.gridTemplateRows,
                        gridTemplateAreas: template.gridTemplateAreas,
                      }}
                    >
                      {template.sections.map((section) => (
                        <div
                          key={section.id}
                          data-section-id={section.id}
                          className="section-zone-bg border-2 border-dashed border-muted-foreground/20 rounded-2xl flex flex-col p-4 bg-muted/5"
                          style={{ gridArea: section.area }}
                        >
                          <span className="text-xs font-bold text-muted-foreground/60 select-none">
                            {section.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 2. SVG Connections overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible select-none z-0">
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="8"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-muted-foreground/60" />
                        </marker>
                      </defs>

                      {/* Connections */}
                      {Object.keys(zones).length > 0 && connections.map((conn) => {
                        const from = cardMap[conn.fromId];
                        const to = cardMap[conn.toId];
                        if (!from || !to) return null;

                        const pts = getBestConnectionPoints(from.card, from.sectionId, to.card, to.sectionId, zones);
                        const pathStr = getBezierPath(pts.from, pts.to, pts.fromPos, pts.toPos);
                        const midX = (pts.from.x + pts.to.x) / 2;
                        const midY = (pts.from.y + pts.to.y) / 2;

                        return (
                          <g key={conn.id} className="pointer-events-auto">
                            <path d={pathStr} className="canvas-arrow-path" markerEnd="url(#arrowhead)" />
                            <foreignObject
                              x={midX - 10}
                              y={midY - 10}
                              width={20}
                              height={20}
                              className="overflow-visible"
                            >
                              <button
                                onClick={() => deleteConnection(conn.id)}
                                className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md scale-95 hover:scale-110 transition-transform cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </foreignObject>
                          </g>
                        );
                      })}

                      {/* Temporary Connection line dragging */}
                      {connDrag && cardMap[connDrag.fromCardId] && (
                        (() => {
                          const from = cardMap[connDrag.fromCardId];
                          const fromCoords = getCardCoords(from.card, from.sectionId, zones);
                          const startPoint = fromCoords[connDrag.fromPos as keyof typeof fromCoords];
                          const tempPath = getBezierPath(
                            startPoint,
                            { x: connDrag.currentX, y: connDrag.currentY },
                            connDrag.fromPos,
                            "center"
                          );
                          return (
                            <path
                              d={tempPath}
                              className="stroke-primary stroke-[2.5] stroke-dasharray-[5,5] fill-none"
                            />
                          );
                        })()
                      )}
                    </svg>

                    {/* 3. Absolute Cards Layer */}
                    {Object.keys(zones).length > 0 && template.sections.flatMap((section) => {
                      const sectionCards = canvasState[section.id] || [];
                      return sectionCards.map((card) => {
                        let cx = card.x;
                        let cy = card.y;

                        if (cx === undefined || cy === undefined) {
                          const zone = zones[section.id];
                          if (zone) {
                            cx = zone.x + 20;
                            cy = zone.y + 40 + (card.order * 105);
                          } else {
                            cx = 100;
                            cy = 100;
                          }
                        }

                        return (
                          <div
                            key={card.id}
                            data-card-id={card.id}
                            className="absolute z-10 pointer-events-auto"
                            style={{
                              left: `${cx}px`,
                              top: `${cy}px`,
                            }}
                          >
                            <CanvasCard
                              card={card}
                              sectionId={section.id}
                              sectionColor={section.color}
                              onUpdate={(cardId, content) => updateCard(section.id, cardId, content)}
                              onDelete={(cardId) => deleteCard(section.id, cardId)}
                              searchQuery={searchQuery}
                            />
                          </div>
                        );
                      });
                    })}
                  </>
                )}
              </SortableContext>
            </div>
          </TransformComponent>
        </TransformWrapper>

        <DragOverlay
          dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
        >
          {activeId && activeCard ? (
            <CanvasCard
              card={activeCard}
              sectionId="overlay"
              onUpdate={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
