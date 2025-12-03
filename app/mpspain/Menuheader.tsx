"use client";


import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import DesktopHeader from "../header/components/DesktopHeader";
import MobileHeader from "../header/components/MobileHeader";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setUser(res.data.data);
      } catch (error) {}
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {/* Desktop */}
      <DesktopHeader user={user} handleLogout={handleLogout} />

      {/* Mobile */}
      <MobileHeader user={user} handleLogout={handleLogout} />
      
      {/* 페이지 컨텐츠는 헤더 아래로 밀리게 */}
      {/* <div className="h-[64px] md:h-[100px]" /> */}
    </>
  );
}
