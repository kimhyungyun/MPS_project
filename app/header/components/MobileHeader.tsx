"use client";

import { menuData } from "@/types/menudata";
import { useRouter } from "next/navigation";

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

interface Props {
  user: User | null;
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
    <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* 메인 메뉴 */}
        <div className="flex flex-col gap-3 font-pretendard text-base font-medium">
          <button className="text-left" onClick={() => handleLink("/mpspain/introduction")}>
            연구회 소개
          </button>
          <button className="text-left" onClick={() => handleLink("/mpspain/mpschamp")}>
            MPS 회원 광장
          </button>
          <span className="text-left">MPS 강좌</span>
        </div>

        <div className="h-px bg-gray-200" />

        {/* 전체 메뉴 */}
        <div className="space-y-4">
          {menuData.map((menu) => (
            <div key={menu.title}>
              <p className="mb-1 text-xs font-semibold text-gray-500">
                {menu.title}
              </p>

              <ul className="space-y-2">
                {menu.submenu.map((sub) => (
                  <li key={sub.href}>
                    <button
                      className="w-full text-left text-gray-800 py-1"
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

        <div className="h-px bg-gray-200" />

        {/* 유저 정보 */}
        <div className="text-[11px] text-gray-600 flex justify-between items-center">
          {user ? (
            <>
              <span>{user.mb_name} 님</span>
              <button
                onClick={() => handleLink(user.mb_level >= 8 ? "/admin" : "/mypage")}
                className="underline"
              >
                마이페이지
              </button>
            </>
          ) : (
            <button
              onClick={() => handleLink("/form/login")}
              className="underline"
            >
              로그인 하러가기
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
