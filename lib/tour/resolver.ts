import type { ResolvedTarget } from "./types";

const DEFAULT_TIMEOUT_MS = 8000;
const RETRY_INTERVAL_MS = 100;

function findElement(target: string): Element | null {
  if (!target) return null;
  if (target.startsWith("[") || target.startsWith(".") || target.startsWith("#")) {
    return document.querySelector(target);
  }
  return document.querySelector(`[data-tour-id="${target}"]`);
}

function toResolved(element: Element): ResolvedTarget | null {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return { element, rect };
}

export function getCenterRect(): ResolvedTarget {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const rect = new DOMRect(centerX, centerY, 0, 0);
  return {
    element: document.body,
    rect,
  };
}

export function resolveTargetSync(target?: string, centered = false): ResolvedTarget | null {
  if (centered || !target || target === "center" || target === "dashboard-root") {
    return getCenterRect();
  }
  const el = findElement(target);
  if (!el) return null;
  return toResolved(el);
}

export function waitForTarget(
  target: string | undefined,
  centered = false,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ResolvedTarget> {
  return new Promise((resolve, reject) => {
    const immediate = resolveTargetSync(target, centered);
    if (immediate) {
      immediate.element.scrollIntoView?.({ behavior: "smooth", block: "center", inline: "nearest" });
      resolve(immediate);
      return;
    }

    const deadline = Date.now() + timeoutMs;
    let observer: MutationObserver | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const cleanup = () => {
      observer?.disconnect();
      if (interval) clearInterval(interval);
    };

    const tryResolve = () => {
      const result = resolveTargetSync(target, centered);
      if (result) {
        cleanup();
        result.element.scrollIntoView?.({ behavior: "smooth", block: "center", inline: "nearest" });
        resolve(result);
        return true;
      }
      if (Date.now() > deadline) {
        cleanup();
        if (centered || !target) {
          resolve(getCenterRect());
        } else {
          reject(new Error(`Tour target not found: ${target}`));
        }
        return true;
      }
      return false;
    };

    interval = setInterval(tryResolve, RETRY_INTERVAL_MS);

    observer = new MutationObserver(() => {
      tryResolve();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export function watchTarget(
  target: string | undefined,
  centered: boolean,
  onUpdate: (resolved: ResolvedTarget | null) => void
): () => void {
  const update = () => onUpdate(resolveTargetSync(target, centered));
  update();

  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);

  let observer: MutationObserver | null = null;
  if (target && !centered) {
    observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update, true);
    observer?.disconnect();
  };
}
