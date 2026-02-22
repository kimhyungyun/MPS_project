"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { menuData } from "@/types/menudata";

// ✅ alias(@) 안 쓰고 상대경로로 확정

type MenuLink = { title: string; href: string };
type MenuGroup = { title: string; href?: string; submenu?: MenuLink[] };

export default function SectionDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ✅ 타입 명시해서 implicit any 제거
  const currentGroup: MenuGroup | undefined = (menuData as MenuGroup[]).find((group: MenuGroup) => {
    if (group.href && pathname === group.href) return true;
    return group.submenu?.some((sub: MenuLink) => pathname.startsWith(sub.href)) ?? false;
  });

  if (!currentGroup) return null;

  return (
    <>
      {/* 📌 오른쪽 고정 아이콘 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-28 z-50 h-11 w-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
        aria-label="섹션 메뉴 열기"
      >
        ☰
      </button>

      {/* 배경 오버레이 */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* 📌 우측 슬라이드 패널 */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{currentGroup.title}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 w-9 rounded-full border border-gray-200 hover:bg-gray-50"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-2">
          {currentGroup.href && (
            <Link
              href={currentGroup.href}
              className="block p-3 rounded-lg hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              홈
            </Link>
          )}

          {currentGroup.submenu?.map((sub: MenuLink) => (
            <Link
              key={sub.href}
              href={sub.href}
              className={`block p-3 rounded-lg ${
                pathname.startsWith(sub.href)
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-100"
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