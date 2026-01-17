"use client";

import { useViewMode } from "@/app/hooks/useViewMode";
import DesktopHero from "../firstpage/DesktopHero";
import MobileHero from "../firstpage/MobileHero";


export default function HeroWrapper() {
  const { mode } = useViewMode();

  if (mode === "mobile") return <MobileHero />;
  if (mode === "desktop") return <DesktopHero />;

  return (
    <>
      <MobileHero />
      <DesktopHero />
    </>
  );
}
