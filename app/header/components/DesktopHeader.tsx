"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "@/types/menudata";

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

interface Props {
  user: User | null;
  handleLogout: () => void;
}

export default function DesktopHeader({ user, handleLogout }: Props) {
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
      <div className="flex items-center justify-between max-w-6xl mx-auto h-[110px] px-8">

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

        {/* 중앙 메뉴 */}
        <nav className="flex-1 flex justify-center">
          <ul
            className="
              grid grid-cols-3
              gap-8 lg:gap-16 xl:gap-24
              font-pretendard font-semibold
              text-sm md:text-base lg:text-lg xl:text-xl
              place-items-center
            "
          >
            <li className="whitespace-nowrap">
              <Link href="/mpspain/introduction">연구회 소개</Link>
            </li>
            <li className="whitespace-nowrap">
              <Link href="/mpspain/mpschamp">MPS 회원 광장</Link>
            </li>
            <li className="whitespace-nowrap">
              MPS 강좌
            </li>
          </ul>
        </nav>

        {/* 로그인 영역 */}
        <div className="flex items-center justify-end w-44 lg:w-56 gap-2 text-sm font-pretendard text-gray-700">
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
            <Link href="/form/login" className="hover:text-blue-600 font-medium">
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
        <div className="flex justify-center py-8">
          <div className="max-w-4xl w-full px-6">

            {/* 메뉴 3열 그리드 */}
            <div className="grid grid-cols-3 gap-12">

              {menuData.map((menu) => (
                <div key={menu.title} className="text-left">

                  {/* 섹션 제목 */}
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    {menu.title}
                  </p>

                  {/* 항목 리스트 */}
                  <ul className="space-y-3 font-medium text-base lg:text-lg text-gray-800">
                    {menu.submenu.map((sub) => (
                      <li key={sub.href}>
                        <Link href={sub.href} className="hover:text-blue-600 transition-colors">
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
      </div>

    </header>
  );
}
