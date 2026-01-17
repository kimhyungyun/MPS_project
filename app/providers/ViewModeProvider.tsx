"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ViewMode = "auto" | "mobile" | "desktop";
const KEY = "viewMode";

type Ctx = { mode: ViewMode; setMode: (m: ViewMode) => void };
const ViewModeContext = createContext<Ctx | null>(null);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("auto");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as ViewMode | null;
      if (saved === "auto" || saved === "mobile" || saved === "desktop") {
        setModeState(saved);
      }
    } catch {}
  }, []);

  const setMode = (next: ViewMode) => {
    setModeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}
