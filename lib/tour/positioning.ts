import { MOBILE_BREAKPOINT } from "@/hooks/use-is-mobile";
import type { TourStep, TourPosition } from "./types";

const CARD_WIDTH_COMPACT = 360;
const CARD_WIDTH_FEATURE = 420;
const CARD_HEIGHT_EST = 240;
const GAP = 20;
const SCREEN_PAD = 16;

/** Rough height of the mobile sheet, used to keep the spotlight clear of it. */
const MOBILE_SHEET_CLEARANCE = 280;

export interface TooltipPosition {
  top: number;
  left: number;
  transform: string;
  placement: TourPosition;
  isMobileSheet: boolean;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The *visual* viewport, which shrinks when the on-screen keyboard opens.
 * `window.innerHeight` keeps reporting the full layout viewport, which is why
 * the tour card used to end up underneath the keyboard and the bottom nav.
 */
function viewport() {
  const visual = window.visualViewport;
  return {
    width: visual?.width ?? window.innerWidth,
    height: visual?.height ?? window.innerHeight,
  };
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return viewport().width < MOBILE_BREAKPOINT;
}

/**
 * Scrolls a spotlight target into the band of the screen that the mobile sheet
 * does not cover. `scrollIntoView({ block: "center" })` centres on the full
 * viewport and so can leave the target hidden behind the card.
 */
export function scrollTargetIntoView(element: Element): void {
  if (!isMobileViewport()) {
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    return;
  }

  const { height } = viewport();
  const usable = Math.max(0, height - MOBILE_SHEET_CLEARANCE);
  const rect = element.getBoundingClientRect();
  const desiredTop = SCREEN_PAD + Math.max(0, (usable - rect.height) / 2);
  const delta = rect.top - desiredTop;

  if (Math.abs(delta) < 8) return;
  window.scrollBy({ top: delta, behavior: "smooth" });
}

export function computeTooltipPosition(
  targetRect: DOMRect,
  position: TourPosition = "auto",
  offset = 0,
  hasMedia = false,
  isCentered = false
): TooltipPosition {
  const { width: viewportWidth, height: viewportHeight } = viewport();

  // Below `md` the card is a bottom sheet positioned purely in CSS, so it can
  // track `--mobile-bottom-nav-offset` and `--keyboard-inset` live.
  if (isMobileViewport()) {
    return {
      top: 0,
      left: 0,
      transform: "",
      placement: "bottom",
      isMobileSheet: true,
    };
  }

  if (isCentered) {
    return {
      top: viewportHeight / 2,
      left: viewportWidth / 2,
      transform: "translate(-50%, -50%)",
      placement: "bottom",
      isMobileSheet: false,
    };
  }

  const cardWidth = hasMedia ? CARD_WIDTH_FEATURE : CARD_WIDTH_COMPACT;
  const gap = GAP + offset;
  let pos = position === "auto" ? "bottom" : position;

  if ((pos === "top" || pos === "bottom") && targetRect.height > viewportHeight * 0.75) {
    pos = targetRect.left > viewportWidth / 2 ? "left" : "right";
  }

  let top = 0;
  let left = 0;
  let transform = "";

  switch (pos) {
    case "left":
      left = targetRect.left - gap - cardWidth;
      top = targetRect.top + targetRect.height / 2;
      transform = "translate(0, -50%)";
      break;
    case "right":
      left = targetRect.right + gap;
      top = targetRect.top + targetRect.height / 2;
      transform = "translate(0, -50%)";
      break;
    case "top":
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      top = targetRect.top - gap;
      transform = "translate(0, -100%)";
      break;
    case "bottom":
    default:
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
      top = targetRect.bottom + gap;
      transform = "translate(0, 0)";
      break;
  }

  const visualLeft = left;
  const visualRight = left + cardWidth;
  if (visualLeft < SCREEN_PAD) left = SCREEN_PAD;
  else if (visualRight > viewportWidth - SCREEN_PAD) {
    left = viewportWidth - SCREEN_PAD - cardWidth;
  }

  let visualTop = top;
  let visualBottom = top + CARD_HEIGHT_EST;
  if (pos === "left" || pos === "right") {
    visualTop = top - CARD_HEIGHT_EST / 2;
    visualBottom = top + CARD_HEIGHT_EST / 2;
  } else if (pos === "top") {
    visualTop = top - CARD_HEIGHT_EST;
    visualBottom = top;
  }

  if (visualTop < SCREEN_PAD) {
    if (pos === "top") {
      top = targetRect.bottom + gap;
      transform = "translate(0, 0)";
      pos = "bottom";
    } else if (pos === "left" || pos === "right") {
      top = SCREEN_PAD + CARD_HEIGHT_EST / 2;
    }
  } else if (visualBottom > viewportHeight - SCREEN_PAD) {
    if (pos === "bottom") {
      top = targetRect.top - gap;
      transform = "translate(0, -100%)";
      pos = "top";
    } else if (pos === "left" || pos === "right") {
      top = viewportHeight - SCREEN_PAD - CARD_HEIGHT_EST / 2;
    }
  }

  return {
    top,
    left,
    transform,
    placement: pos as TourPosition,
    isMobileSheet: false,
  };
}

export function getSpotlightPadding(step?: TourStep): number {
  return step?.type === "interactive" ? 14 : 10;
}
