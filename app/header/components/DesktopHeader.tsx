"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "@/types/menudata";

export interface User {
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

  // 각 상단 메뉴에 대응하는 서브메뉴 (index 기준)
  const introMenu = menuData[0];
  const champMenu = menuData[1];
  const lectureMenu = menuData[2];

  return (
    <header
      className={`
        hidden md:block fixed top-0 left-0 w-full z-50 transition-all duration-300
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
            {/* 연구회 소개 */}
            <li className="relative group whitespace-nowrap">
              <Link href="/mpspain/introduction">연구회 소개</Link>

              {introMenu && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                  <div
                    className="
                      w-56 rounded-2xl bg-white border border-gray-100 
                      shadow-[0_12px_30px_rgba(15,23,42,0.18)]
                      opacity-0 invisible translate-y-1
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200
                    "
                  >
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400">
                      {introMenu.title}
                    </p>
                    <ul className="py-2 text-sm text-gray-800">
                      {introMenu.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="block px-4 py-2 hover:bg-gray-50"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* MPS 회원 광장 */}
            <li className="relative group whitespace-nowrap">
              <Link href="/mpspain/mpschamp">MPS 회원 광장</Link>

              {champMenu && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                  <div
                    className="
                      w-56 rounded-2xl bg-white border border-gray-100 
                      shadow-[0_12px_30px_rgba(15,23,42,0.18)]
                      opacity-0 invisible translate-y-1
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200
                    "
                  >
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400">
                      {champMenu.title}
                    </p>
                    <ul className="py-2 text-sm text-gray-800">
                      {champMenu.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="block px-4 py-2 hover:bg-gray-50"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            {/* MPS 강좌 (동영상 강의) */}
            <li className="relative group whitespace-nowrap">
              <span>MPS 강좌</span>

              {lectureMenu && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                  <div
                    className="
                      w-56 rounded-2xl bg-white border border-gray-100 
                      shadow-[0_12px_30px_rgba(15,23,42,0.18)]
                      opacity-0 invisible translate-y-1
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200
                    "
                  >
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400">
                      {lectureMenu.title}
                    </p>
                    <ul className="py-2 text-sm text-gray-800">
                      {lectureMenu.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="block px-4 py-2 hover:bg-gray-50"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>

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
    </header>
  );
}
