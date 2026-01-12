"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "@/types/menudata";
import MobileMenu from "./MobileMenu";

export interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

export interface Props {
  user: User | null;
  handleLogout: () => void;
}

export default function DesktopHeader({ user, handleLogout }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ 태블릿(900~1023)에서 열릴 햄버거 메뉴 상태
  const [isTabletMenuOpen, setIsTabletMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ 화면이 lg(1024) 이상으로 커지면 태블릿 메뉴 자동으로 닫기 (선택이지만 안정적)
  useEffect(() => {
    const handleResize = () => {
      // lg = 1024
      if (window.innerWidth >= 1024) setIsTabletMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const introMenu = menuData[0];
  const champMenu = menuData[1];
  const lectureMenu = menuData[2];

  return (
    <header
      className={`
        hidden desktop:block fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${isScrolled ? "bg-white/90 backdrop-blur shadow-md" : "bg-white/90 backdrop-blur"}
        border-b border-gray-200
      `}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto h-[110px] px-8">
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

        {/* ✅ nav는 lg 이상에서만 보여서 태블릿(900~1023)에서 hover 문제 제거 */}
        <nav className="hidden lg:flex flex-1 justify-center">
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
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                  <div
                    className="
                      w-72 bg-white border border-gray-200 rounded-lg shadow-xl
                      opacity-0 invisible translate-y-2
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200
                      py-5 px-4
                      text-center
                    "
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Image
                        src="/빈배경로고1.png"
                        alt="MPS 로고"
                        width={20}
                        height={20}
                        className="object-contain opacity-80"
                      />
                      <p className="text-lg font-semibold text-gray-600">
                        {introMenu.title}
                      </p>
                    </div>

                    <ul className="space-y-2 text-[15px] text-gray-800 font-medium">
                      {introMenu.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="block py-2 hover:text-blue-600 transition-colors"
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
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                  <div
                    className="
                      w-72 bg-white border border-gray-200 rounded-lg shadow-xl
                      opacity-0 invisible translate-y-2
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200
                      py-5 px-4
                      text-center
                    "
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Image
                        src="/빈배경로고1.png"
                        alt="MPS 로고"
                        width={20}
                        height={20}
                        className="object-contain opacity-80"
                      />
                      <p className="text-lg font-semibold text-gray-600">
                        {champMenu.title}
                      </p>
                    </div>

                    <ul className="space-y-2 text-[15px] text-gray-800 font-medium">
                      {champMenu.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="block py-2 hover:text-blue-600 transition-colors"
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

            {/* MPS 강좌 */}
            <li className="relative group whitespace-nowrap">
              <Link href="/mpspain/mpslecture/packages">MPS 강좌</Link>

              {lectureMenu && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                  <div
                    className="
                      w-72 bg-white border border-gray-200 rounded-lg shadow-xl
                      opacity-0 invisible translate-y-2
                      group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                      transition-all duration-200
                      py-5 px-4
                      text-center
                    "
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Image
                        src="/빈배경로고1.png"
                        alt="MPS 로고"
                        width={20}
                        height={20}
                        className="object-contain opacity-80"
                      />
                      <p className="text-lg font-semibold text-gray-600">
                        {lectureMenu.title}
                      </p>
                    </div>

                    <ul className="space-y-2 text-[15px] text-gray-800 font-medium">
                      {lectureMenu.submenu.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="block py-2 hover:text-blue-600 transition-colors"
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

        {/* 로그인 영역 + ✅ 태블릿용 햄버거 */}
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
              <span className="hidden lg:inline">님 반갑습니다!</span>
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

          {/* ✅ 900~1023 에서만 보이는 햄버거: desktop(900)부터 보이고 lg(1024)에서 숨김 */}
          <button
            type="button"
            onClick={() => setIsTabletMenuOpen((v) => !v)}
            className="ml-2 hidden desktop:flex lg:hidden flex-col items-center justify-center h-9 w-9 gap-1.5 border border-gray-300 rounded-md bg-white/70"
            aria-label="메뉴 열기"
          >
            <span className="block h-[2px] w-4 rounded bg-gray-800" />
            <span className="block h-[2px] w-4 rounded bg-gray-800" />
            <span className="block h-[2px] w-4 rounded bg-gray-800" />
          </button>
        </div>
      </div>

      {/* ✅ 태블릿(900~1023)에서만 햄버거로 열리는 메뉴 */}
      <MobileMenu
        user={user}
        isOpen={isTabletMenuOpen}
        onClose={() => setIsTabletMenuOpen(false)}
        onLogout={handleLogout}
      />
    </header>
  );
}
