"use client";

import { useEffect, useState } from "react";

export type ViewMode = "auto" | "mobile" | "desktop";
const KEY = "viewMode";

export function useViewMode() {
  const [mode, setMode] = useState<ViewMode>("auto");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as ViewMode | null;
      if (saved === "auto" || saved === "mobile" || saved === "desktop") {
        setMode(saved);
      }
    } catch {}
  }, []);

  const updateMode = (next: ViewMode) => {
    setMode(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  return { mode, setMode: updateMode };
}
