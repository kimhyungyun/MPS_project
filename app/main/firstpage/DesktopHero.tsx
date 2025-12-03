"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// 1번: 이미지 + 텍스트 + 블러
// 2,3번: 이미지 슬라이드
const slides = [
  { type: "hero" as const, src: "/메인흰이미지.avif" }, 
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
              {/* === 1번 슬라이드: 기존 스타일 그대로 === */}
              {slide.type === "hero" && (
                <>
                  <Image
                    src={slide.src}
                    alt="메인 이미지"
                    fill
                    priority
                    className="object-cover object-center"
                  />

                  {/* 기존 명암 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

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

              {/* === 2,3번 슬라이드: 이미지만 === */}
              {slide.type === "image" && (
                <Image
                  src={slide.src}
                  alt={`메인 이미지 ${idx}`}
                  fill
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
