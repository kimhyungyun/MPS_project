"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { menuData } from "@/types/menudata";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import MobileMenu from "../header/MobileMenu";


interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const Header = () => {
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
          console.error("Failed to fetch user profile:", error.message);
          if (error.response?.status === 401 || error.code === "ECONNABORTED") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
          }
        } else {
          console.error("An unexpected error occurred:", error);
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
      className={`group fixed top-0 left-0 w-full z-50 transition-all duration-300
      ${isScrolled ? "shadow-md bg-white/90 backdrop-blur" : "bg-white/90 backdrop-blur"}
      border-b border-gray-200`}
    >
      {/* 상단 바 (공통) */}
      <div className="flex justify-center items-center w-full h-[64px] md:h-[100px] px-4 md:px-6">
        <div className="flex items-center w-full max-w-6xl mx-auto">
          {/* 왼쪽 로고 영역 – 오른쪽과 폭 맞춤 */}
          <div className="shrink-0 w-40 md:w-52 flex items-center">
            <Link href="/">
              <Image
                src="/빈배경로고.png"
                alt="로고"
                width={170}
                height={70}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* 중앙 상단 메뉴 – 데스크탑 전용 */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="grid grid-cols-3 w-full max-w-3xl place-items-center gap-12 font-pretendard text-lg md:text-xl font-medium">
              <li>
                <Link href="/mpspain/introduction">연구회 소개</Link>
              </li>
              <li>
                <Link href="/mpspain/mpschamp">MPS 회원 광장</Link>
              </li>
              <li>MPS 강좌</li>
            </ul>
          </nav>

          {/* 오른쪽 영역 – 데스크탑 */}
          <div className="hidden md:flex shrink-0 w-52 items-center justify-end text-xs font-pretendard gap-2">
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

          {/* 오른쪽 영역 – 모바일 (로그인 + 햄버거) */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
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

            {/* 햄버거 버튼 */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white/70"
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
      </div>

      {/* 데스크탑 드롭다운 – 상단 메뉴 아래로 */}
      <div className="hidden md:block absolute left-0 top-full w-full bg-white/95 backdrop-blur shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40">
        <div className="flex justify-center py-12">
          <div className="w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-3 place-items-center">
              {menuData.map((menu) => (
                <div key={menu.title} className="text-center">
                  <ul className="space-y-8 font-pretendard text-lg font-medium">
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

      {/* 모바일 메뉴 컴포넌트 */}
      <MobileMenu
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Header;
