"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { ContentPost, HashtagSet, RecurringTemplate, ContentStreak } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Columns3, List, Plus, CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addMonths, subMonths } from "date-fns-jalali";
import {
  addDays, startOfWeek, getDay, startOfMonth,
  isSameWeek, isThisWeek,
} from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { PageTourHelp } from "@/components/tour/page-tour-help";

// Sub-components
import { StatsBar } from "./components/stats-bar";
import { StreakBadge } from "./components/streak-badge";
import { CalendarView } from "./components/calendar-view";
import { KanbanView } from "./components/kanban-view";
import { ListView } from "./components/list-view";
import { PostPanel } from "./components/post-panel";
import { AIStrategyModal } from "./components/ai-strategy-modal";
import { RecurringManager } from "./components/recurring-manager";

type ViewMode = "calendar" | "kanban" | "list";

const VIEW_TABS = [
  { id: "calendar" as ViewMode, label: "تقویم", Icon: CalendarDays },
  { id: "kanban" as ViewMode, label: "پایپ‌لاین", Icon: Columns3 },
  { id: "list" as ViewMode, label: "لیست", Icon: List },
];

const DEFAULT_STREAK: ContentStreak = {
  current: 0,
  best: 0,
  thisWeekPublished: 0,
};

function computeStreak(events: ContentPost[], existingStreak: ContentStreak): ContentStreak {
  const published = events.filter((e) => e.status === "published");
  const thisWeekPublished = published.filter((e) =>
    isThisWeek(new Date(e.date), { weekStartsOn: 6 })
  ).length;

  // Simple streak: count consecutive weeks with at least 1 published post
  let current = existingStreak.current;
  if (thisWeekPublished > 0 && existingStreak.thisWeekPublished === 0) {
    // New post published this week — potentially increment streak
    const lastWeekPublished = published.filter((e) =>
      isSameWeek(new Date(e.date), addDays(new Date(), -7), { weekStartsOn: 6 })
    ).length;
    if (lastWeekPublished > 0 || existingStreak.current === 0) {
      current = existingStreak.current + (lastWeekPublished > 0 ? 1 : 1);
    }
  }
  const best = Math.max(current, existingStreak.best);
  return { current, best, thisWeekPublished };
}

export default function ContentCalendarPage() {
  const { activeProject: plan, updateActiveProject } = useProject();

  // ── Core state ────────────────────────────────────────────────────────
  const [events, setEvents] = useState<ContentPost[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("calendar");
  const [showLimitModal, setShowLimitModal] = useState(false);

  // ── Edit panel state ───────────────────────────────────────────────────
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ContentPost | null>(null);
  const [formData, setFormData] = useState<Partial<ContentPost>>({});

  // ── Filter state ───────────────────────────────────────────────────────
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Extended data ──────────────────────────────────────────────────────
  const [hashtagBank, setHashtagBank] = useState<HashtagSet[]>([]);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([]);
  const [streak, setStreak] = useState<ContentStreak>(DEFAULT_STREAK);

  // ── Load from project ─────────────────────────────────────────────────
  useEffect(() => {
    if (plan) {
      setEvents(plan.contentCalendar || []);
      setHashtagBank(plan.hashtagBank || []);
      setRecurringTemplates(plan.recurringTemplates || []);
      setStreak(plan.contentStreak || DEFAULT_STREAK);
    }
  }, [plan]);

  // ── Sync save ─────────────────────────────────────────────────────────
  const saveAll = useCallback(
    (
      newEvents: ContentPost[],
      newBank?: HashtagSet[],
      newTemplates?: RecurringTemplate[],
      newStreak?: ContentStreak
    ) => {
      setEvents(newEvents);
      const bank = newBank ?? hashtagBank;
      const templates = newTemplates ?? recurringTemplates;
      const streakData = newStreak ?? streak;
      setHashtagBank(bank);
      setRecurringTemplates(templates);
      setStreak(streakData);
      if (updateActiveProject) {
        updateActiveProject({
          contentCalendar: newEvents,
          hashtagBank: bank,
          recurringTemplates: templates,
          contentStreak: streakData,
        });
      }
    },
    [hashtagBank, recurringTemplates, streak, updateActiveProject]
  );

  // ── Filtered events ───────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (platformFilter.length > 0 && !platformFilter.includes(e.platform)) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(e.status)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchTags = (e.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchNotes = (e.notes || "").toLowerCase().includes(q);
        if (!matchTitle && !matchTags && !matchNotes) return false;
      }
      return true;
    });
  }, [events, platformFilter, statusFilter, searchQuery]);

  // ── Filter handlers ───────────────────────────────────────────────────
  const handlePlatformFilter = (pid: string) => {
    setPlatformFilter((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  };
  const handleStatusFilter = (sid: string) => {
    setStatusFilter((prev) =>
      prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid]
    );
  };
  const clearFilters = () => {
    setPlatformFilter([]);
    setStatusFilter([]);
    setSearchQuery("");
  };

  // ── CRUD Handlers ─────────────────────────────────────────────────────
  const handleAddClick = (date?: Date, initialStatus: string = "idea") => {
    setSelectedEvent(null);
    setFormData({
      date: date ? date.toISOString() : new Date().toISOString(),
      platform: "instagram",
      type: "reel",
      status: initialStatus as ContentPost["status"],
      title: "",
      priority: "medium",
      tags: [],
      hashtags: [],
      checklist: {
        script: false,
        filmed: false,
        edited: false,
        captionReady: false,
        hashtagsReady: false,
        thumbnailReady: false,
      },
    });
    setIsPanelOpen(true);
  };

  const handleEditClick = (event: ContentPost) => {
    setSelectedEvent(event);
    setFormData({ ...event });
    setIsPanelOpen(true);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error("عنوان محتوا الزامی است");
      return;
    }

    const eventToSave: ContentPost = {
      id: selectedEvent?.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: formData.title,
      date: formData.date || new Date().toISOString(),
      platform: formData.platform || "instagram",
      type: formData.type || "post",
      status: formData.status || "idea",
      notes: formData.notes || "",
      caption: formData.caption,
      tags: formData.tags || [],
      priority: formData.priority || "medium",
      collaborator: formData.collaborator,
      estimatedHours: formData.estimatedHours,
      thumbnailUrl: formData.thumbnailUrl,
      hashtags: formData.hashtags || [],
      checklist: formData.checklist,
      publishTime: formData.publishTime,
    };

    let newEvents: ContentPost[];
    if (selectedEvent) {
      newEvents = events.map((e) => (e.id === selectedEvent.id ? eventToSave : e));
    } else {
      newEvents = [...events, eventToSave];
    }

    // Update streak if publishing
    let newStreak = streak;
    if (eventToSave.status === "published" && selectedEvent?.status !== "published") {
      newStreak = computeStreak(newEvents, streak);
    }

    saveAll(newEvents, undefined, undefined, newStreak);
    setIsPanelOpen(false);
    toast.success(selectedEvent ? "تغییرات ذخیره شد ✓" : "محتوای جدید ایجاد شد 🎉");
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    const newEvents = events.filter((e) => e.id !== selectedEvent.id);
    saveAll(newEvents);
    setIsPanelOpen(false);
    toast.success("محتوا حذف شد");
  };

  const handleReschedule = (eventId: string, newDate: Date) => {
    const newEvents = events.map((e) =>
      e.id === eventId ? { ...e, date: newDate.toISOString() } : e
    );
    saveAll(newEvents);
    toast.success("تاریخ تغییر یافت");
  };

  const handleMoveStatus = (event: ContentPost, direction: "next" | "prev") => {
    const order = ["idea", "scripting", "filming", "editing", "scheduled", "published"];
    const idx = order.indexOf(event.status);
    const newIdx = direction === "next" ? idx + 1 : idx - 1;
    if (newIdx >= 0 && newIdx < order.length) {
      const newStatus = order[newIdx] as ContentPost["status"];
      const updatedEvent = { ...event, status: newStatus };
      const newEvents = events.map((e) => (e.id === event.id ? updatedEvent : e));
      let newStreak = streak;
      if (newStatus === "published") {
        newStreak = computeStreak(newEvents, streak);
      }
      saveAll(newEvents, undefined, undefined, newStreak);
    }
  };

  const handleEventsGenerated = (newEvents: ContentPost[]) => {
    const merged = [...events, ...newEvents];
    saveAll(merged);
  };

  const handleHashtagBankUpdate = (bank: HashtagSet[]) => {
    saveAll(events, bank);
  };

  const handleRecurringUpdate = (templates: RecurringTemplate[]) => {
    saveAll(events, undefined, templates);
  };

  return (
    <div className="min-h-screen space-y-5 pb-16">
      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4" data-tour-id="calendar-header">
        {/* Title + streak */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <PageTourHelp tourId="calendar" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تقویم محتوا</h1>
              <p className="text-xs text-muted-foreground">مدیریت و برنامه‌ریزی محتوای هوشمند</p>
            </div>
          </div>

          {/* Streak Badge */}
          <StreakBadge streak={streak} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View switcher — sticky on mobile */}
          <div className="sticky top-14 z-20 -mx-1 px-1 py-2 bg-background/95 backdrop-blur-xl md:static md:bg-transparent md:p-0 md:backdrop-blur-none">
            <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-xl overflow-x-auto mobile-scroll-x">
            {VIEW_TABS.map(({ id, label, Icon }) => (
              <Button
                key={id}
                variant={view === id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView(id)}
                className={cn(
                  "h-8 text-xs rounded-lg gap-1.5",
                  view === id
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Button>
            ))}
            </div>
          </div>

          {/* Recurring templates */}
          <RecurringManager
            templates={recurringTemplates}
            onChange={handleRecurringUpdate}
          />

          {/* AI Strategy */}
          {plan && (
            <AIStrategyModal
              plan={plan}
              onEventsGenerated={handleEventsGenerated}
            />
          )}

          {/* Add post */}
          <Button
            onClick={() => handleAddClick()}
            className="bg-gradient-to-r from-pink-600 to-rose-600 border-0 shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform h-9"
          >
            <Plus className="w-4 h-4 ml-1.5" />
            محتوای جدید
          </Button>
        </div>
      </div>

      {/* ── Stats & Filters ──────────────────────────────────────────── */}
      <StatsBar
        events={events}
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onPlatformFilter={handlePlatformFilter}
        onStatusFilter={handleStatusFilter}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
      />

      {/* ── Main Content View ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            data-tour-id="calendar-grid"
          >
            <CalendarView
              events={events}
              filteredEvents={filteredEvents}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onReschedule={handleReschedule}
            />
          </motion.div>
        )}

        {view === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanView
              filteredEvents={filteredEvents}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onMoveStatus={handleMoveStatus}
            />
          </motion.div>
        )}

        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ListView
              filteredEvents={filteredEvents}
              onEditClick={handleEditClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post Editor Panel ─────────────────────────────────────────── */}
      <PostPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        event={selectedEvent}
        formData={formData}
        onFormChange={setFormData}
        onSave={handleSave}
        onDelete={handleDelete}
        hashtagBank={hashtagBank}
        onUpdateHashtagBank={handleHashtagBankUpdate}
        projectNiche={plan?.brandCanvas?.niche}
      />
    </div>
  );
}
