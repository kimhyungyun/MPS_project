"use client";

import { useViewMode } from "@/app/hooks/useViewMode";
import DesktopHeader, { User } from "./DesktopHeader";
import MobileHeader from "./MobileHeader";


export default function HeaderWrapper({
  user,
  handleLogout,
}: {
  user: User | null;
  handleLogout: () => void;
}) {
  const { mode } = useViewMode();

  if (mode === "mobile") return <MobileHeader user={user} handleLogout={handleLogout} />;
  if (mode === "desktop") return <DesktopHeader user={user} handleLogout={handleLogout} />;

  // auto: 기존 반응형대로 (둘 다 렌더링해도 됨)
  return (
    <>
      <MobileHeader user={user} handleLogout={handleLogout} />
      <DesktopHeader user={user} handleLogout={handleLogout} />
    </>
  );
}
