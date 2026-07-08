"use client";

import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import { useTourStore } from "@/lib/tour/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Trash2,
  Pin,
  PinOff,
  Pencil,
  Check,
  X,
  Bell,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopilotPersonalize } from "../copilot-personalize";
import type { CopilotInsight } from "@/lib/copilot/types";

interface CopilotLeftRailProps {
  onNavigate?: () => void;
}

export function CopilotLeftRail({ onNavigate }: CopilotLeftRailProps) {
  const { user } = useAuth();
  const { activeProject: plan } = useProject();
  const {
    clearMessages,
    conversations,
    activeConversationId,
    selectConversation,
    deleteConversation,
    togglePinConversation,
    renameConversation,
    insights,
    unreadInsights,
    loadInsights,
    refreshUnread,
    markInsightRead,
    dismissInsight,
    setPendingPrefill,
  } = useCopilotStore();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [insightsOpen, setInsightsOpen] = useState(true);

  const handleNewChat = async () => {
    clearMessages();
    onNavigate?.();
  };

  const handleSelect = async (id: string) => {
    if (id === activeConversationId) {
      onNavigate?.();
      return;
    }
    await selectConversation(id);
    onNavigate?.();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
    toast.success("گفتگو حذف شد");
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string, pinned: boolean) => {
    e.stopPropagation();
    await togglePinConversation(id, !pinned);
  };

  const startEditing = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const commitRename = async (id: string) => {
    const title = editTitle.trim();
    if (title) {
      await renameConversation(id, title);
    }
    setEditingId(null);
  };

  const userName = user?.name || user?.email || "کاربر";
  const initials = userName.charAt(0).toUpperCase();

  const applyInsight = async (insight: CopilotInsight) => {
    await markInsightRead(insight.id);
    const action = insight.actionPayload;
    if (action?.type === "open_page" && action.href) {
      onNavigate?.();
      router.push(action.href);
      return;
    }
    if (action?.type === "open_copilot") {
      clearMessages();
      if (action.prefill) setPendingPrefill(action.prefill);
      onNavigate?.();
    }
  };

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessagePreview || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinned = filtered.filter((c) => c.pinned);
  const others = filtered.filter((c) => !c.pinned);

  const renderConversation = (conv: (typeof conversations)[number]) => {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;
    return (
      <div
        key={conv.id}
        onClick={() => handleSelect(conv.id)}
        className={cn(
          "conversation-item group px-3 py-2.5 rounded-lg cursor-pointer",
          isActive && "active"
        )}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-ai shrink-0" />
          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(conv.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="flex-1 text-sm font-medium bg-background border border-ai/30 rounded px-1.5 py-0.5 outline-none"
              dir="rtl"
            />
          ) : (
            <span className="text-sm font-medium truncate flex-1">{conv.title}</span>
          )}
          {isEditing ? (
            <div className="flex items-center gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); commitRename(conv.id); }}
                className="hover:bg-ai/20 rounded p-0.5 text-ai"
              >
                <Check size={12} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                className="hover:bg-muted rounded p-0.5 text-muted-foreground"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleTogglePin(e, conv.id, conv.pinned)}
                className="hover:bg-muted rounded p-0.5 text-muted-foreground hover:text-foreground"
                title={conv.pinned ? "برداشتن پین" : "پین کردن"}
              >
                {conv.pinned ? <PinOff size={12} /> : <Pin size={12} />}
              </button>
              <button
                onClick={(e) => startEditing(e, conv.id, conv.title)}
                className="hover:bg-muted rounded p-0.5 text-muted-foreground hover:text-foreground"
                title="تغییر نام"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => handleDelete(e, conv.id)}
                className="hover:bg-destructive/15 rounded p-0.5 text-muted-foreground hover:text-destructive"
                title="حذف"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        {!isEditing && conv.lastMessagePreview && (
          <p className="text-[11px] text-muted-foreground truncate mt-1 ps-5">
            {conv.lastMessagePreview}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-card border-e border-border/50">
      {/* Header */}
      <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg ai-orb flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm">دستیار کارنکس</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          onClick={() => useTourStore.getState().startTour("copilot", 0, true)}
          title="راهنمای دستیار"
        >
          <HelpCircle size={15} />
        </Button>
      </div>

      {/* New Chat */}
      <div className="p-3 shrink-0">
        <Button
          variant="soft"
          className="w-full gap-2 justify-start"
          onClick={handleNewChat}
        >
          <Plus size={16} />
          گفتگوی جدید
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2 shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در گفتگوها..."
            className="w-full h-9 ps-9 pe-3 rounded-lg bg-muted/50 border border-border/50 text-xs outline-none focus:border-ai/30 transition-colors"
            dir="rtl"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto copilot-scroll px-2">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {pinned.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
                  <Pin size={10} /> پین‌شده
                </p>
                {pinned.map(renderConversation)}
              </div>
            )}
            <div className="space-y-1">
              {pinned.length > 0 && others.length > 0 && (
                <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                  سایر گفتگوها
                </p>
              )}
              {others.map(renderConversation)}
            </div>
          </div>
        ) : (
          <div className="px-3 py-8 text-center">
            <MessageSquare size={32} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "موردی یافت نشد" : "هنوز گفتگویی شروع نشده"}
            </p>
          </div>
        )}
      </div>

      {/* User profile */}
      <div className="shrink-0 p-3 border-t border-border/50">
        {/* Insights inbox */}
        {insights.length > 0 && (
          <div className="mb-3 rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
            <button
              onClick={() => setInsightsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-muted/40 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <Bell size={12} />
                پیشنهادات هوشمند
                {unreadInsights > 0 && (
                  <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-ai text-white text-[9px] font-bold">
                    {unreadInsights}
                  </span>
                )}
              </span>
              <ChevronDown
                size={12}
                className={cn("text-muted-foreground transition-transform", insightsOpen && "rotate-180")}
              />
            </button>
            {insightsOpen && (
              <div className="px-1.5 pb-1.5 space-y-1 max-h-56 overflow-y-auto copilot-scroll">
                {insights.slice(0, 8).map((ins) => {
                  const Icon =
                    ins.priority === "urgent"
                      ? AlertTriangle
                      : ins.type === "streak" || ins.type === "competitor"
                        ? TrendingUp
                        : Lightbulb;
                  const tone =
                    ins.priority === "urgent"
                      ? "text-red-500"
                      : ins.priority === "warning"
                        ? "text-amber-500"
                        : "text-ai";
                  const hasAction = !!ins.actionPayload;
                  return (
                    <div
                      key={ins.id}
                      className="group relative rounded-md p-2 hover:bg-background transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Icon size={13} className={cn("mt-0.5 shrink-0", tone)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold leading-snug truncate">{ins.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                            {ins.body}
                          </p>
                          {hasAction && ins.actionPayload?.label && (
                            <button
                              onClick={() => applyInsight(ins)}
                              className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-ai hover:underline"
                            >
                              {ins.actionPayload.label}
                              <ArrowLeft size={10} />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissInsight(ins.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground rounded p-0.5"
                          title="رد کردن"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {plan?.projectName || "بدون پروژه"}
            </p>
          </div>
          <CopilotPersonalize />
        </div>
      </div>
    </div>
  );
}
