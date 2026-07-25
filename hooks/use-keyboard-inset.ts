"use client";

import { useEffect } from "react";

/**
 * Publishes the on-screen keyboard height as the `--keyboard-inset` CSS
 * variable on `<html>`.
 *
 * Mobile browsers do not resize the layout viewport when the keyboard opens,
 * so a `fixed`/`sticky` composer at the bottom of the screen ends up hidden
 * behind it. `visualViewport` is the only thing that reports the real usable
 * height, and it is read-only from JS — hence a CSS variable that layout can
 * subscribe to.
 */
export function useKeyboardInsetVariable() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;

    const update = () => {
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop
      );
      // Below this the "inset" is just browser chrome rounding, not a keyboard.
      root.style.setProperty(
        "--keyboard-inset",
        inset > 80 ? `${Math.round(inset)}px` : "0px"
      );
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      root.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
