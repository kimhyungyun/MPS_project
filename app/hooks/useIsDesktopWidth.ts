"use client";

import { useEffect, useState } from "react";

export function useIsDesktopWidth() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768); // md 기준 (원하면 1024로 바꿔도 됨)
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isDesktop;
}
