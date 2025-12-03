"use client";

import { menuData } from "@/types/menudata";
import { useRouter } from "next/navigation";

interface Props {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ user, isOpen, onClose }: Props) {
  const router = useRouter();

  const handleLink = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">

        {/* 상단 3개 메인 메뉴 */}
        <div className="flex flex-col gap-3 font-pretendard text-base font-medium">
          <button className="text-left" onClick={() => handleLink("/mpspain/introduction")}>
            연구회 소개
          </button>
          <button className="text-left" onClick={() => handleLink("/mpspain/mpschamp")}>
            MPS 회원 광장
          </button>
          <span className="text-left">MPS 강좌</span>
        </div>

        <div className="h-px bg-gray-200 my-2" />

        {/* 전체 드롭다운 메뉴 */}
        <div className="grid grid-cols-1 gap-4 text-sm font-pretendard">
          {menuData.map((menu) => (
            <div key={menu.title}>
              <p className="mb-1 text-xs font-semibold text-gray-500">
                {menu.title}
              </p>

              <ul className="space-y-1">
                {menu.submenu.map((sub) => (
                  <li key={sub.href}>
                    <button
                      className="text-left text-gray-800"
                      onClick={() => handleLink(sub.href)}
                    >
                      {sub.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
