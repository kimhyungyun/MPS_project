'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Mps = () => {
  const router = useRouter();

  const pages = [
    "/페이지1.png",
    "/페이지2.png",
    "/페이지3.png",
    "/페이지4.png",
    "/페이지5.png",
    "/페이지6.png",
    "/페이지7.png",
    "/페이지8.png",
    "/페이지9.png",
    "/페이지10.png",
    "/페이지11.png",
    "/페이지12.png",
    "/페이지13.png",
    "/페이지14.png",
  ];

  // 로그인 체크 후 이동
  const handleApplyClick = () => {
    try {
      const raw = localStorage.getItem('user');

      // 로그인 안 된 경우
      if (!raw) {
        alert('로그인이 필요합니다.');
        router.push('/form/login');
        return;
      }

      // 로그인 정보 검증
      try {
        JSON.parse(raw);
      } catch (error) {
        console.error('user parse error:', error);
        alert('로그인 정보가 올바르지 않습니다. 다시 로그인 해주세요.');
        router.push('/form/login');
        return;
      }

      // 로그인 된 경우 이동
      router.push('/mpspain/mpschamp/30');
    } catch (error) {
      console.error('Login check error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {pages.map((src, index) => (
          <div key={index} className="relative w-full mb-6">
            <img
              src={src}
              alt={`페이지 ${index + 1}`}
              className="w-full h-auto block rounded-lg"
            />

            {/* 첫 번째 페이지에만 버튼 표시 */}
            {index === 0 && (
              <button
                type="button"
                onClick={handleApplyClick}
                className="
                  absolute
                  bottom-[40px]
                  left-1/2
                  -translate-x-1/2
                  px-6
                  py-3
                  rounded-2xl
                  bg-black
                  text-white
                  text-base
                  font-semibold
                  hover:bg-gray-800
                  transition
                  shadow-lg
                  whitespace-nowrap
                  cursor-pointer
                "
              >
                MPS 연구회 캠프 신청 바로가기 →
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Mps;