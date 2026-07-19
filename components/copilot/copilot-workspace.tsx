"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { useCopilotStore } from "@/lib/copilot/store";
import type { CopilotPersona } from "@/lib/copilot/types";
import { useShallow } from "zustand/react/shallow";
import { CopilotLeftRail } from "./left-rail/copilot-left-rail";
import { CopilotConversation } from "./conversation/copilot-conversation";
import { CopilotComposer } from "./composer/copilot-composer";
import { CopilotEmptyState } from "./conversation/copilot-empty-state";
import { CopilotRightPane } from "./copilot-right-pane";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useImmersivePage } from "@/hooks/use-immersive-page";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { isPillarAvailableAtLaunch } from "@/lib/launch/config";

const ALL_PERSONAS: { id: CopilotPersona; label: string; color: string; pillar: "startup" | "traditional" | "creator" }[] = [
  { id: "startup", label: "استارتاپ", color: "text-blue-500", pillar: "startup" },
  { id: "traditional", label: "سنتی", color: "text-amber-500", pillar: "traditional" },
  { id: "creator", label: "محتوا", color: "text-purple-500", pillar: "creator" },
];

function personaForProjectType(projectType?: string): CopilotPersona {
  if (projectType === "creator") return "creator";
  if (projectType === "traditional") return "traditional";
  return "startup";
}

export function CopilotWorkspace() {
  const { activeProject: plan } = useProject();
  const {
    leftRailOpen,
    artifactCanvasOpen,
    setArtifactCanvasOpen,
    activeMode,
    setActiveMode,
    setLeftRailOpen,
    activePersona,
    setActivePersona,
    showLimitModal,
    setShowLimitModal,
    messages,
    loadConversations,
    loadInsights,
    refreshUnread,
  } = useCopilotStore(
    useShallow((s) => ({
      leftRailOpen: s.leftRailOpen,
      artifactCanvasOpen: s.artifactCanvasOpen,
      setArtifactCanvasOpen: s.setArtifactCanvasOpen,
      activeMode: s.activeMode,
      setActiveMode: s.setActiveMode,
      setLeftRailOpen: s.setLeftRailOpen,
      activePersona: s.activePersona,
      setActivePersona: s.setActivePersona,
      showLimitModal: s.showLimitModal,
      setShowLimitModal: s.setShowLimitModal,
      messages: s.messages,
      loadConversations: s.loadConversations,
      loadInsights: s.loadInsights,
      refreshUnread: s.refreshUnread,
    }))
  );

  // Set persona based on project type (match switcher ids)
  useEffect(() => {
    useCopilotStore.getState().setActivePersona(personaForProjectType(plan?.projectType));
  }, [plan?.projectType]);

  // If customer_bot is open on a non-traditional project, fall back to cofounder
  useEffect(() => {
    if (
      activeMode === "customer_bot" &&
      plan?.projectType !== "traditional"
    ) {
      setActiveMode("cofounder");
    }
  }, [activeMode, plan?.projectType, setActiveMode]);

  // Load persisted conversations for the active project.
  useEffect(() => {
    if (plan?.id) {
      loadConversations(plan.id);
      loadInsights(plan.id);
      refreshUnread();
    } else {
      refreshUnread();
    }
  }, [plan?.id, loadConversations, loadInsights, refreshUnread]);

  // Mobile left rail toggle state
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const isMobile = useIsMobile();
  useImmersivePage(isMobile);

  const visiblePersonas = ALL_PERSONAS.filter((p) => isPillarAvailableAtLaunch(p.pillar));
  const showCustomerBot = plan?.projectType === "traditional";
  const showPersonaSwitcher = visiblePersonas.length > 1;

  return (
    <div className={cn(
      "flex overflow-hidden bg-background",
      isMobile ? "h-[calc(100dvh-3.5rem)]" : "h-[calc(100vh-4rem)]"
    )}>
      {/* Left Rail — Desktop */}
      <div
        className={cn(
          "hidden md:flex shrink-0 transition-all duration-300",
          leftRailOpen ? "w-72" : "w-0"
        )}
      >
        {leftRailOpen && <CopilotLeftRail />}
      </div>

      {/* Left Rail — Mobile (slide-over from logical start / RTL visual right) */}
      <AnimatePresence>
        {mobileRailOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileRailOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 start-0 z-50 w-[min(20rem,85vw)] md:hidden"
            >
              <CopilotLeftRail onNavigate={() => setMobileRailOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Center: Conversation */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="h-12 shrink-0 border-b border-border/50 flex items-center justify-between px-3 gap-2 bg-card/50 backdrop-blur-sm" data-tour-id="copilot-header">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-11 w-11"
              onClick={() => setMobileRailOpen(true)}
            >
              <PanelLeftOpen size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden md:flex"
              onClick={() => setLeftRailOpen(!leftRailOpen)}
            >
              {leftRailOpen ? (
                <PanelLeftClose size={16} />
              ) : (
                <PanelLeftOpen size={16} />
              )}
            </Button>

            {/* Mode tabs — horizontal scroll on mobile */}
            <div className="flex items-center gap-1 ms-1 overflow-x-auto mobile-scroll-x max-w-[50vw] md:max-w-none">
              <ModeTab
                label="هم‌بنیان‌گذار"
                active={activeMode === "cofounder"}
                onClick={() => setActiveMode("cofounder")}
              />
              {showCustomerBot && (
                <ModeTab
                  label="ربات مشتری"
                  active={activeMode === "customer_bot"}
                  onClick={() => setActiveMode("customer_bot")}
                />
              )}
              <ModeTab
                label="بینش‌ها"
                active={activeMode === "insights"}
                onClick={() => setActiveMode("insights")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Persona switcher — only when multiple pillars are live */}
            {showPersonaSwitcher && (
              <div className="hidden sm:flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-lg">
                {visiblePersonas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={cn(
                      "px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                      activePersona === p.id
                        ? "bg-background shadow-sm " + p.color
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Artifact pane toggle — desktop lg+ and mobile sheet */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => {
                if (isMobile) setMobileRightOpen(true);
                else setArtifactCanvasOpen(!artifactCanvasOpen);
              }}
              title="پنل خروجی"
            >
              <PanelRightOpen size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:flex"
              onClick={() => setArtifactCanvasOpen(!artifactCanvasOpen)}
              title="پنل خروجی"
            >
              {artifactCanvasOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </Button>

            <PageTourHelp tourId="copilot" size="icon-sm" />

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full ai-orb animate-ai-pulse" />
              <span className="font-medium">کارنکس AI</span>
            </div>
          </div>
        </div>

        {/* Conversation area */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <CopilotEmptyState />
          ) : (
            <CopilotConversation />
          )}
        </div>

        {/* Composer — sticky with safe area on mobile */}
        <div className={cn(isMobile && "safe-bottom")}>
          <CopilotComposer />
        </div>
      </div>

      {/* Right Pane: Desktop */}
      <AnimatePresence>
        {artifactCanvasOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "38%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex shrink-0 overflow-hidden"
          >
            <CopilotRightPane />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Pane: Mobile sheet */}
      <Sheet open={mobileRightOpen} onOpenChange={setMobileRightOpen}>
        <SheetContent side="bottom" className="h-[75dvh] p-0 rounded-t-2xl lg:hidden">
          <CopilotRightPane onClose={() => setMobileRightOpen(false)} />
        </SheetContent>
      </Sheet>

      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  );
}

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        active
          ? "bg-ai/10 text-ai"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
