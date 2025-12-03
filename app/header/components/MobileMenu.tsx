"use client";

import { useRouter } from "next/navigation";
import { menuData } from "@/types/menudata";
import type { User } from "./DesktopHeader";

export interface MobileMenuProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const MobileMenu = ({ user, isOpen, onClose, onLogout }: MobileMenuProps) => {
  const router = useRouter();

  const handleLink = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
    router.push("/");
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* 유저 정보 / 로그인 박스 */}
        <div className="flex justify-between items-center rounded-xl bg-gray-50 px-4 py-3 text-gray-700">
          {user ? (
            <>
              <div className="flex flex-col max-w-[60%]">
                <span className="font-semibold text-[clamp(11px,3.4vw,13px)] truncate">
                  {user.mb_name} 님
                </span>
                <span className="text-[clamp(9px,3vw,11px)] text-gray-500 truncate">
                  MPS 서비스 이용 중
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleLink(user.mb_level >= 8 ? "/admin" : "/mypage")
                  }
                  className="text-[clamp(10px,3.2vw,12px)] underline underline-offset-2"
                >
                  마이페이지
                </button>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="text-[clamp(10px,3.2vw,12px)] text-red-500 underline underline-offset-2"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col max-w-[60%]">
                <span className="font-semibold text-[clamp(11px,3.4vw,13px)] truncate">
                  로그인이 필요합니다
                </span>
                <span className="text-[clamp(9px,3vw,11px)] text-gray-500">
                  회원 전용 콘텐츠 이용을 위해 로그인 해주세요.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleLink("/form/login")}
                className="rounded-full border border-gray-300 px-3 py-1 text-[clamp(10px,3.2vw,12px)] font-medium"
              >
                로그인 하러가기
              </button>
            </>
          )}
        </div>

        {/* 메인 메뉴 - 빠른 이동 */}
        <div>
          <p className="mb-2 text-[clamp(11px,3.3vw,12px)] font-semibold text-gray-500">
            빠른 이동
          </p>

          <div className="grid grid-cols-3 gap-2 font-pretendard font-medium">
            <button
              type="button"
              className="
                flex items-center justify-center
                rounded-xl border border-gray-200 bg-white
                px-3 py-2 text-gray-800 shadow-sm
                active:scale-[0.98] transition
              "
              onClick={() => handleLink("/mpspain/introduction")}
            >
              <span className="text-[clamp(11px,3.3vw,13px)] truncate max-w-full">
                연구회 소개
              </span>
            </button>

            <button
              type="button"
              className="
                flex items-center justify-center
                rounded-xl border border-gray-200 bg-white
                px-3 py-2 text-gray-800 shadow-sm
                active:scale-[0.98] transition
              "
              onClick={() => handleLink("/mpspain/mpschamp")}
            >
              <span className="text-[clamp(11px,3.3vw,13px)] truncate max-w-full">
                정회원 캠프안내
              </span>
            </button>

            <button
              type="button"
              className="
                flex items-center justify-center
                rounded-xl border border-gray-200 bg-white
                px-3 py-2 text-gray-800 shadow-sm
                active:scale-[0.98] transition
              "
              onClick={() => handleLink("/mpspain/lecture")}
            >
              <span className="text-[clamp(11px,3.3vw,13px)] truncate max-w-full">
                MPS 강의 듣기
              </span>
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* 전체 메뉴 섹션 */}
        <div className="space-y-4">
          {menuData.map((menu) => (
            <div
              key={menu.title}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70"
            >
              {/* 상단 타이틀 */}
              <div className="flex items-center border-b border-gray-100 px-4 py-3">
                <img
                  src="/빈배경로고1.png"
                  alt=""
                  className="w-4 h-4 object-contain opacity-80 mr-2"
                />
                <p className="text-[clamp(11px,3.3vw,13px)] font-semibold text-gray-600 truncate">
                  {menu.title}
                </p>
              </div>

              {/* 서브 메뉴 리스트 */}
              <ul className="py-1">
                {menu.submenu.map((sub) => (
                  <li key={sub.href}>
                    <button
                      type="button"
                      className="
                        flex w-full items-center justify-between
                        px-4 py-2.5 text-left
                        text-gray-800 hover:bg-white active:bg-gray-100
                      "
                      onClick={() => handleLink(sub.href)}
                    >
                      <span
                        className="
                          text-[clamp(11px,3.3vw,13px)]
                          font-medium
                          truncate
                          max-w-[90%]
                          block
                        "
                      >
                        {sub.title}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        〉
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 닫기 버튼 */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[clamp(10px,3.2vw,12px)] text-gray-400 underline underline-offset-4"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
