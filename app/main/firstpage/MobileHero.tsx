"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// 1번: 빈 배경 + 텍스트
// 2,3번: 이미지 슬라이드
const slides = [
  { type: "blank" as const },
  { type: "image" as const, src: "/테스트이미지2.png" },
  { type: "image" as const, src: "/메인모바일사진.jpg" },
];

export default function MobileHero() {
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
    // 헤더 보정은 레이아웃에서, 여기서는 h-screen만
    <section className="relative w-full h-screen overflow-hidden block md:hidden">
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
              {/* 1번: 빈 배경 + 텍스트 */}
              {slide.type === "blank" && (
                <>
                  {/* 배경 그라데이션 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-500" />
                  {/* 살짝 어둡게 */}
                  <div className="absolute inset-0 bg-black/25" />

                  {/* 텍스트 */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-3xl font-extrabold text-white leading-tight">
                      MPS 연구회
                    </h1>
                    <p className="mt-3 text-base text-white/90">
                      전문적인 의료진과 함께하는 MPS 연구회
                    </p>
                  </div>
                </>
              )}

              {/* 2, 3번: 이미지만 (텍스트/블러 없음) */}
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

      {/* ▶️⏸ 버튼 (모바일용은 조금 작게) */}
      <button
        onClick={toggleAutoplay}
        className="
          absolute bottom-4 right-4 z-20
          bg-black/55 text-white rounded-full
          w-8 h-8 flex items-center justify-center
          text-xs
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
