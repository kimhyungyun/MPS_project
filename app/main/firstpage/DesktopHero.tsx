"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// 1번: 빈 배경 + 텍스트
// 2,3번: 이미지 슬라이드 (텍스트/블러 없음)
const slides = [
  { type: "blank" as const },
  { type: "image" as const, src: "/메인이미지.jpg" },
  { type: "image" as const, src: "/메인사진.jpg" },
];

export default function DesktopHero() {
  const [swiper, setSwiper] = useState<any>(null);
  const [paused, setPaused] = useState(false);

  const toggleAutoplay = () => {
    if (!swiper) return;

    if (paused) {
      swiper.autoplay.start();
      setPaused(false);
    } else {
      swiper.autoplay.stop();
      setPaused(true);
    }
  };

  return (
    // 헤더 높이는 레이아웃에서 pt-[100px] 같은 걸로 보정하고, 여기선 h-screen만 사용
    <section className="relative w-full h-screen overflow-hidden hidden md:block">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        onSwiper={setSwiper}
        className="w-full h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-full">
              {/* 1번 슬라이드: 빈 배경 + 텍스트 + 블러 */}
              {slide.type === "blank" && (
                <>
                  {/* 배경: 단색/그라데이션 (원하면 색만 바꿔도 됨) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-500" />

                  {/* 살짝 어둡게 */}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* 텍스트 */}
                  <div className="absolute inset-0 z-10 flex items-center">
                    <div className="w-full max-w-6xl mx-auto px-12">
                      <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                        MPS 연구회
                      </h1>
                      <p className="mt-4 text-2xl text-white/90">
                        전문적인 의료진과 함께하는 MPS 연구회
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* 2,3번: 이미지 슬라이드 (텍스트/블러 없음) */}
              {slide.type === "image" && slide.src && (
                <Image
                  src={slide.src}
                  alt={`메인 이미지 ${idx}`}
                  fill
                  priority={idx === 1} // 첫 이미지 슬라이드만 priority
                  className="object-cover object-center"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ▶️⏸ 버튼 */}
      <button
        onClick={toggleAutoplay}
        className="
          absolute bottom-6 right-6 z-20
          bg-black/50 text-white rounded-full
          w-10 h-10 flex items-center justify-center
          backdrop-blur-sm
          hover:bg-black/70
          transition
        "
      >
        {paused ? "▶" : "⏸"}
      </button>
    </section>
  );
}
