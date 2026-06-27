"use client";

import { motion } from "framer-motion";
import {
  Map,
  LayoutGrid,
  List,
  Calendar,
  BarChart3,
  Download,
  Search,
  Filter,
  X,
  GanttChartSquare,
  Zap,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { RoadmapView, RoadmapFilter } from "@/lib/roadmap/constants";
import {
  VIEW_LABELS,
  STATUS_CONFIG,
  CATEGORY_CONFIG,
  StepStatus,
} from "@/lib/roadmap/constants";

interface ToolbarProps {
  view: RoadmapView;
  onViewChange: (v: RoadmapView) => void;
  filter: RoadmapFilter;
  onFilterChange: (f: Partial<RoadmapFilter>) => void;
  totalSteps: number;
  filteredCount: number;
  onExport: (format: "pdf" | "markdown" | "csv" | "ics") => void;
  sprintMode?: boolean;
  onToggleSprintMode?: () => void;
}

const VIEW_ICONS: Record<RoadmapView, React.ElementType> = {
  journey: Map,
  kanban: LayoutGrid,
  list: List,
  calendar: Calendar,
  analytics: BarChart3,
  gantt: GanttChartSquare,
};

export function RoadmapToolbar({
  view,
  onViewChange,
  filter,
  onFilterChange,
  totalSteps,
  filteredCount,
  onExport,
  sprintMode = false,
  onToggleSprintMode,
}: ToolbarProps) {
  const hasActiveFilters =
    filter.status !== "all" ||
    filter.priority !== "all" ||
    filter.category !== "all" ||
    filter.search.trim() !== "";

  const views = Object.keys(VIEW_LABELS) as RoadmapView[];

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: view switcher pill tabs + search + sprint toggle + export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* View switcher — styled as labeled pill tabs */}
        <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 overflow-x-auto shrink-0">
          {views.map((v) => {
            const Icon = VIEW_ICONS[v];
            const isActive = view === v;
            return (
              <motion.button
                key={v}
                onClick={() => onViewChange(v)}
                layout
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="roadmap-view-pill"
                    className="absolute inset-0 bg-background shadow-sm rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} />
                  {VIEW_LABELS[v]}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={16}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="جستجوی گام..."
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="ps-9 h-9"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filter.status}
            onValueChange={(v) =>
              onFilterChange({ status: v as StepStatus | "all" })
            }
          >
            <SelectTrigger className="w-[130px] h-9">
              <Filter size={14} className="ms-1 text-muted-foreground" />
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              {(
                Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.priority}
            onValueChange={(v) => onFilterChange({ priority: v })}
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="اولویت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه اولویت‌ها</SelectItem>
              <SelectItem value="high">🔥 بالا</SelectItem>
              <SelectItem value="medium">⚑ متوسط</SelectItem>
              <SelectItem value="low">↓ پایین</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.category}
            onValueChange={(v) => onFilterChange({ category: v })}
          >
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="دسته" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sprint mode toggle */}
        {onToggleSprintMode && (
          <Button
            variant={sprintMode ? "gradient" : "outline"}
            size="sm"
            className="h-9 shrink-0 gap-1.5"
            onClick={onToggleSprintMode}
          >
            <Zap size={14} />
            {sprintMode ? "اسپرینت فعال" : "حالت اسپرینت"}
          </Button>
        )}

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5">
              <Download size={14} />
              خروجی
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              📄 PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("markdown")}>
              📝 Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("csv")}>
              📊 CSV (Excel)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport("ics")}>
              📅 تقویم (ICS)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter info */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2"
        >
          <Badge variant="muted" size="sm">
            {toPersianDigits(filteredCount)} از {toPersianDigits(totalSteps)} گام
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() =>
              onFilterChange({
                status: "all",
                priority: "all",
                category: "all",
                search: "",
              })
            }
          >
            <X size={12} />
            پاک کردن فیلترها
          </Button>
        </motion.div>
      )}
    </div>
  );
}
