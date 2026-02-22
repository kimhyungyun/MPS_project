"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "@/types/menudata";

type MenuLink = { title: string; href: string };
type MenuGroup = { title: string; href?: string; submenu?: MenuLink[] };

const HEADER_HEIGHT = 100; // 🔥 헤더 높이와 반드시 동일하게

export default function SectionDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentGroup: MenuGroup | undefined = (menuData as MenuGroup[]).find(
    (group: MenuGroup) => {
      if (group.href && pathname === group.href) return true;
      return group.submenu?.some((sub: MenuLink) =>
        pathname.startsWith(sub.href)
      ) ?? false;
    }
  );

  if (!currentGroup) return null;

  return (
    <>
      {/* 🔘 오른쪽 고정 아이콘 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 z-50 h-12 w-12 rounded-full 
        bg-white/60 backdrop-blur-md 
        shadow-lg border border-white/40 
        flex items-center justify-center 
        hover:bg-white/80 transition"
        style={{ top: HEADER_HEIGHT + 20 }}
        aria-label="섹션 메뉴 열기"
      >
        <Image
          src="/빈배경로고1.png" 
          alt="메뉴"
          width={22}
          height={22}
          priority
        />
      </button>

      {/* 🌫 배경 오버레이 */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 
          bg-black/30 backdrop-blur-sm 
          transition"
        />
      )}

      {/* 📂 우측 슬라이드 패널 (글래스 효과 적용) */}
      <div
        className={`fixed right-0 w-80 
        bg-white/70 backdrop-blur-xl 
        border-l border-white/30 
        shadow-2xl 
        z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        {/* 상단 헤더 영역 */}
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {currentGroup.title}
          </h2>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 w-9 rounded-full 
            bg-white/50 backdrop-blur-md 
            border border-white/30 
            hover:bg-white/80 transition"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 메뉴 목록 */}
        <div className="p-5 space-y-3">
          {currentGroup.href && (
            <Link
              href={currentGroup.href}
              className="block px-4 py-3 rounded-xl 
              bg-white/40 backdrop-blur-md 
              hover:bg-white/70 transition"
              onClick={() => setOpen(false)}
            >
              홈
            </Link>
          )}

          {currentGroup.submenu?.map((sub: MenuLink) => (
            <Link
              key={sub.href}
              href={sub.href}
              className={`block px-4 py-3 rounded-xl 
              backdrop-blur-md transition
              ${
                pathname.startsWith(sub.href)
                  ? "bg-white/80 font-semibold"
                  : "bg-white/40 hover:bg-white/70"
              }`}
              onClick={() => setOpen(false)}
            >
              {sub.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}