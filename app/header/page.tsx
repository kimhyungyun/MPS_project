"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import DesktopHeader, { type User as HeaderUser } from "./components/DesktopHeader";
import MobileHeader from "./components/MobileHeader";
import { useViewMode } from "../providers/ViewModeProvider";

export default function HeaderPage() {
  const { mode } = useViewMode();

  const [user, setUser] = useState<HeaderUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            timeout: 5000,
          }
        );

        if (res.data.success) setUser(res.data.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401 || error.code === "ECONNABORTED") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // 로딩 중에도 헤더는 보여줘도 되지만, 원하면 여기서 skeleton 처리해도 됨.
  // if (isLoading) return null;

  // ✅ 강제 모드면 "하나만" 렌더링 (CSS breakpoint 무시)
  if (mode === "desktop") {
    return <DesktopHeader user={user} handleLogout={handleLogout} />;
  }

  if (mode === "mobile") {
    return <MobileHeader user={user} handleLogout={handleLogout} />;
  }

  // ✅ auto 모드면 기존 반응형대로 (둘 다 렌더링 후 md:hidden/md:block로 제어)
  return (
    <>
      <DesktopHeader user={user} handleLogout={handleLogout} />
      <MobileHeader user={user} handleLogout={handleLogout} />
    </>
  );
}
