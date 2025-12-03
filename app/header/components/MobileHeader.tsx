"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "./MobileMenu";

export default function MobileHeader({ user, handleLogout }: any) {
  const [open, setOpen] = useState(false);

  return (
    <header className="block md:hidden fixed top-0 left-0 w-full h-[64px] bg-white/90 backdrop-blur border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full">

        {/* 로고 */}
        <Link href="/">
          <Image
            src="/빈배경로고.png"
            alt="로고"
            width={120}
            height={50}
            className="object-contain"
          />
        </Link>

        {/* 로그인 + 햄버거 */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/mypage" className="text-[11px] text-gray-700">
              {user.mb_name} 님
            </Link>
          ) : (
            <Link href="/form/login" className="text-[11px] text-gray-700">
              로그인
            </Link>
          )}

          {/* 햄버거 */}
          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col justify-center items-center h-8 w-8 gap-1 border border-gray-300 rounded-md bg-white/70"
          >
            <span className={`h-[2px] w-4 bg-gray-800 rounded transition ${open ? "rotate-45 translate-y-[5px]" : ""}`} />
            <span className={`h-[2px] w-4 bg-gray-800 rounded transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-4 bg-gray-800 rounded transition ${open ? "-rotate-45 -translate-y-[5px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <MobileMenu user={user} isOpen={open} onClose={() => setOpen(false)} />
    </header>
  );
}
