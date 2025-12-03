"use client";

import { useState, useEffect, FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "@/types/menudata";

export interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

export interface DesktopHeaderProps {
  user: User | null;
  handleLogout: () => void;
}

const DesktopHeader: FC<DesktopHeaderProps> = ({ user, handleLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        hidden md:block fixed top-0 left-0 w-full z-50 transition-all duration-300 group
        ${isScrolled ? "bg-white/90 backdrop-blur shadow-md" : "bg-white/90 backdrop-blur"}
        border-b border-gray-200
      `}
    >
      {/* 상단 헤더 바 */}
      <div
        className="
          flex items-center justify-between
          max-w-6xl mx-auto h-[110px] px-8
          gap-16
        "
      >
        {/* 로고 */}
        <Link href="/" className="flex items-center w-44 lg:w-56 shrink-0">
          <Image
            src="/빈배경로고.png"
            alt="로고"
            width={190}
            height={80}
            className="object-contain"
            priority
          />
        </Link>

        {/* 중앙 메뉴: 위/아래 둘 다 같은 width/grid 사용 */}
        <div className="flex-1 flex justify-center">
          <nav className="w-full max-w-3xl">
            <ul
              className="
                grid grid-cols-3
                gap-8 lg:gap-16 xl:gap-24
                font-pretendard font-semibold
                text-sm md:text-base lg:text-lg xl:text-xl
                text-center
              "
            >
              {menuData.map((menu) => (
                <li key={menu.title} className="whitespace-nowrap">
                  <Link
                    href={menu.submenu[0]?.href || "#"}
                    className="inline-block"
                  >
                    {menu.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 로그인 영역 */}
        <div
          className="
            flex items-center justify-end
            w-44 lg:w-56
            gap-1 lg:gap-2
            text-[10px] lg:text-xs xl:text-sm
            font-pretendard text-gray-700
            whitespace-nowrap
          "
        >
          {user ? (
            <>
              <Link
                href={user.mb_level >= 8 ? "/admin" : "/mypage"}
                className="hover:text-blue-600 font-medium"
              >
                {user.mb_name}
              </Link>
              <span>님 반갑습니다!</span>
              <button
                onClick={handleLogout}
                className="hover:text-blue-600 font-medium"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/form/login"
              className="hover:text-blue-600 font-medium"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* 드롭다운 전체 메뉴 */}
      <div
        className="
          absolute left-0 top-full w-full 
          bg-white/95 backdrop-blur shadow-md 
          opacity-0 invisible 
          group-hover:opacity-100 group-hover:visible 
          transition-all duration-300
        "
      >
        <div className="py-8">
          {/* 위 헤더와 같은 max-w-6xl + 좌우 여백 구조 */}
          <div className="max-w-6xl mx-auto px-8">
            <div className="flex items-stretch">
              {/* 위에서 로고/로그인 쓰던 폭만큼 비워서 x축 맞추기 */}
              <div className="w-44 lg:w-56 shrink-0" />
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-3xl">
                  <div
                    className="
                      grid grid-cols-3
                      gap-8 lg:gap-16 xl:gap-24
                      text-center
                    "
                  >
                    {menuData.map((menu) => (
                      <div key={menu.title}>
                        <ul className="space-y-3 font-medium text-base lg:text-lg text-gray-800">
                          {menu.submenu.map((sub) => (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-44 lg:w-56 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
