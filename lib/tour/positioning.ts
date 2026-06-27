import type { TourStep, TourPosition } from "./types";

const CARD_WIDTH_COMPACT = 360;
const CARD_WIDTH_FEATURE = 420;
const CARD_HEIGHT_EST = 240;
const GAP = 20;
const SCREEN_PAD = 16;

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

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function computeTooltipPosition(
  targetRect: DOMRect,
  position: TourPosition = "auto",
  offset = 0,
  hasMedia = false,
  isCentered = false
): TooltipPosition {
  if (isMobileViewport() && !isCentered) {
    return {
      top: window.innerHeight - 16,
      left: SCREEN_PAD,
      transform: "translateY(-100%)",
      placement: "bottom",
      isMobileSheet: true,
    };
  }

  if (isCentered) {
    return {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
      transform: "translate(-50%, -50%)",
      placement: "bottom",
      isMobileSheet: false,
    };
  }

  const cardWidth = hasMedia ? CARD_WIDTH_FEATURE : CARD_WIDTH_COMPACT;
  const gap = GAP + offset;
  let pos = position === "auto" ? "bottom" : position;

  if ((pos === "top" || pos === "bottom") && targetRect.height > window.innerHeight * 0.75) {
    pos = targetRect.left > window.innerWidth / 2 ? "left" : "right";
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
  else if (visualRight > window.innerWidth - SCREEN_PAD) {
    left = window.innerWidth - SCREEN_PAD - cardWidth;
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
  } else if (visualBottom > window.innerHeight - SCREEN_PAD) {
    if (pos === "bottom") {
      top = targetRect.top - gap;
      transform = "translate(0, -100%)";
      pos = "top";
    } else if (pos === "left" || pos === "right") {
      top = window.innerHeight - SCREEN_PAD - CARD_HEIGHT_EST / 2;
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
