"use client";

import Link from "next/link";
import { useViewMode } from "../providers/ViewModeProvider";


const Footer = () => {
  const { mode, setMode } = useViewMode();

  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div className="text-gray-700 text-sm leading-relaxed text-center sm:text-left">
            <p>유한회사 경근근막엠피에스</p>
            <p>대표 : 문대원 | 사업자번호 : 402-86-04244</p>
            <p>전화 : 063.284.0707 / 010-7942-5854</p>
            <p>
              주소 : 전북 전주시 완산구 용머리로 34 5층 MPS연구회 | E-Mail :
              mdw36900@gmail.com
            </p>
            <p>통신판매신고번호 : 제2013-4650077-30-2-00234</p>

            {/* ✅ 강제 뷰 버튼 */}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
              {mode !== "mobile" && (
                <button
                  type="button"
                  onClick={() => setMode("mobile")}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  모바일 버전
                </button>
              )}

              {mode !== "desktop" && (
                <button
                  type="button"
                  onClick={() => setMode("desktop")}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  PC 버전
                </button>
              )}

              {mode !== "auto" && (
                <button
                  type="button"
                  onClick={() => setMode("auto")}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  자동으로 보기
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end justify-center text-gray-700 text-sm gap-2 mt-2 sm:mt-0">
            <Link href="/footer/policy/privacy" className="cursor-pointer hover:underline whitespace-nowrap">
              개인정보 처리방침
            </Link>
            <Link href="/footer/policy/email" className="cursor-pointer hover:underline whitespace-nowrap">
              이메일 무단수집거부
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
