"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type MenuLink = { title: string; href: string };
type MenuItem = { title: string; href?: string; submenu?: MenuLink[] };

export default function SectionDropdown({
  menuData,
  className = "",
}: {
  menuData: MenuItem[];
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 현재 pathname이 속한 "상위 메뉴" 찾기
  const currentGroup = useMemo(() => {
    return (
      menuData.find((m) => {
        if (m.href && pathname === m.href) return true;
        return m.submenu?.some((s) => pathname.startsWith(s.href)) ?? false;
      }) ?? null
    );
  }, [menuData, pathname]);

  // 현재 페이지 표시용 라벨
  const currentLabel = useMemo(() => {
    if (!currentGroup) return "메뉴";
    const hit = currentGroup.submenu?.find((s) => pathname.startsWith(s.href));
    return hit?.title ?? currentGroup.title;
  }, [currentGroup, pathname]);

  // 바깥 클릭 닫기
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!currentGroup) return null;

  const items: MenuLink[] = [
    ...(currentGroup.href ? [{ title: `${currentGroup.title} 홈`, href: currentGroup.href }] : []),
    ...(currentGroup.submenu ?? []),
  ];

  return (
    <div ref={wrapRef} className={`w-full ${className}`}>
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{currentGroup.title}</p>
          <p className="truncate text-base font-semibold text-gray-900">{currentLabel}</p>
        </div>

        <button
          type="button"
          aria-label="섹션 메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          ▼
        </button>
      </div>

      {open && (
        <div className="relative">
          <div className="absolute right-0 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <ul className="flex flex-col">
              {items.map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={[
                        "block rounded-lg px-3 py-2 text-sm",
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                      onClick={() => setOpen(false)}
                    >
                      {it.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}