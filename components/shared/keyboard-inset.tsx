"use client";

import { useKeyboardInsetVariable } from "@/hooks/use-keyboard-inset";

/** Mounted once at the app root; renders nothing. */
export function KeyboardInset() {
  useKeyboardInsetVariable();
  return null;
}
