"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { menuData } from "@/types/menudata";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

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
      {/* 헤더 높이 72px */}
      <div className="flex justify-center items-center w-full h-[100px] px-6">
        <div className="flex items-center w-full max-w-6xl mx-auto">
          {/* 왼쪽 로고 영역 : 오른쪽이랑 폭 맞춤 */}
          <div className="shrink-0 w-52 flex items-center">
            <Link href="/">
              <Image
                src="/빈배경로고.png"
                alt="로고"
                width={150}
                height={50}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* 중앙 상단 메뉴 */}
          <nav className="flex-1 flex justify-center">
            <ul className="grid grid-cols-3 w-full max-w-3xl place-items-center gap-10 font-pretendard text-base">
              <li>
                <Link href="/mpspain/introduction">연구회 소개</Link>
              </li>
              <li>
                <Link href="/mpspain/mpschamp">MPS 회원 광장</Link>
              </li>
              <li>MPS 강좌</li>
            </ul>
          </nav>

          {/* 오른쪽 로그인/유저 영역 – 왼쪽과 같은 폭 */}
          <div className="shrink-0 w-52 flex items-center justify-end text-xs font-pretendard gap-2">
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
        </div>
      </div>

      {/* 드롭다운 – 위 중앙 메뉴와 같은 max-w-3xl + 같은 3칸 그리드 */}
      <div className="absolute left-0 top-full w-full bg-white/95 backdrop-blur shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40">
        <div className="flex justify-center py-12">
          <div className="w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-3 place-items-center">
              {menuData.map((menu) => (
                <div key={menu.title} className="text-center">
                  <ul className="space-y-8 font-pretendard text-sm font-medium">
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
    </header>
  );
};

export default Header;
