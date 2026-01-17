"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import DesktopHeader, {
  type User as HeaderUser,
} from "./components/DesktopHeader";
import MobileHeader from "./components/MobileHeader";

export default function HeaderPage() {
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

  if (isLoading) {
    // 필요하면 로딩상태 처리, 아니면 바로 헤더 렌더링해도 됨
  }

  return (
    <>
      <DesktopHeader user={user} handleLogout={handleLogout} />
      <MobileHeader user={user} handleLogout={handleLogout} />
      {/* 필요하면 헤더 높이만큼 여백 */}
      {/* <div className="h-[64px] md:h-[110px]" /> */}
    </>
  );
}
