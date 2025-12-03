"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "./DesktopHeader";
import MobileMenu from "./MobileMenu";

export interface MobileHeaderProps {
  user: User | null;
  handleLogout: () => void;
}

const MobileHeader = ({ user, handleLogout }: MobileHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="md:hidden fixed top-0 left-0 w-full z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="flex justify-between items-center w-full h-[64px] px-4 max-w-6xl mx-auto">
        {/* 로고 */}
        <Link href="/" className="flex items-center">
          <Image
            src="/빈배경로고.png"
            alt="로고"
            width={130}
            height={60}
            className="object-contain"
            priority
          />
        </Link>

        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 text-[11px] text-gray-700 font-pretendard">
              <button
                type="button"
                onClick={() =>
                  router.push(user.mb_level >= 8 ? "/admin" : "/mypage")
                }
              >
                {user.mb_name} 님
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="underline"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/form/login")}
              className="text-[11px] text-gray-700 font-pretendard"
            >
              로그인
            </button>
          )}

          {/* 햄버거 */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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

      {/* 여기서 MobileMenu props 타입이 정확히 맞음 */}
      <MobileMenu
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default MobileHeader;
