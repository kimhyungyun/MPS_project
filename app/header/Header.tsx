"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { menuData } from "@/types/menudata";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
            timeout: 5000,
          }
        );

        if (response.data.success) {
          setUser(response.data.data);
        }
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

    fetchUserProfile();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 border-b border-gray-200 transition-all duration-300 
      ${isScrolled ? "bg-white/90 backdrop-blur shadow-md" : "bg-white/90 backdrop-blur"}`}
    >
      <div className="flex justify-between items-center w-full h-[64px] md:h-[100px] px-4 md:px-6 max-w-6xl mx-auto">

        {/* 로고 */}
        <Link href="/" className="flex items-center">
          <Image
            src="/빈배경로고.png"
            alt="로고"
            width={150}
            height={70}
            className="object-contain"
            priority
          />
        </Link>

        {/* PC 메뉴 */}
        <nav className="hidden md:flex flex-1 justify-center mx-6">
          <ul className="flex gap-10 lg:gap-14 font-pretendard font-medium text-sm md:text-base lg:text-lg xl:text-xl">
            <li>
              <Link href="/mpspain/introduction">연구회 소개</Link>
            </li>
            <li>
              <Link href="/mpspain/mpschamp">MPS 회원 광장</Link>
            </li>
            <li>
              <span>MPS 강좌</span>
            </li>
          </ul>
        </nav>

        {/* PC 로그인 영역 */}
        <div className="hidden md:flex items-center gap-2 font-pretendard text-sm">
          {!isLoading &&
            (user ? (
              <>
                <Link
                  href={user.mb_level >= 8 ? "/admin" : "/mypage"}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {user.mb_name}
                </Link>
                <span className="text-gray-700">님 반갑습니다!</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/form/login"
                className="text-gray-700 hover:text-blue-600"
              >
                로그인
              </Link>
            ))}
        </div>

        {/* 모바일 오른쪽 영역 */}
        <div className="flex md:hidden items-center gap-2">

          {/* 모바일 로그인 */}
          {!isLoading &&
            (user ? (
              <button
                onClick={() =>
                  router.push(user.mb_level >= 8 ? "/admin" : "/mypage")
                }
                className="text-[11px] text-gray-700 font-pretendard"
              >
                {user.mb_name} 님
              </button>
            ) : (
              <button
                onClick={() => router.push("/form/login")}
                className="text-[11px] text-gray-700 font-pretendard"
              >
                로그인
              </button>
            ))}

          {/* 햄버거 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center justify-center h-8 w-8 gap-1.5 border border-gray-300 rounded-md bg-white/70"
          >
            <span
              className={`block h-[2px] w-4 rounded bg-gray-800 transition-transform ${
                isMobileMenuOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-4 rounded bg-gray-800 transition-opacity ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-[2px] w-4 rounded bg-gray-800 transition-transform ${
                isMobileMenuOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* PC 드롭다운 */}
      <div className="hidden md:block absolute left-0 top-full w-full bg-white/95 shadow-md
      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        <div className="flex justify-center py-10">
          <div className="max-w-3xl w-full">
            <div className="grid grid-cols-3 place-items-center gap-8">
              {menuData.map((menu) => (
                <div key={menu.title} className="text-center">
                  <ul className="space-y-6 font-pretendard text-sm md:text-base lg:text-lg">
                    {menu.submenu.map((sub) => (
                      <li key={sub.href}>
                        <Link href={sub.href}>{sub.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <MobileMenu
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
