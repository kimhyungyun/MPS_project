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
              
              {/* === 1번: 이미지 + 블러 + 텍스트 === */}
              {slide.type === "hero" && (
                <>
                  <Image
                    src={slide.src}
                    alt="메인 이미지"
                    fill
                    priority
                    className="object-cover object-center"
                  />

                  {/* 검정 반투명 오버레이 */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* 텍스트 */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-5">
                    <h1 className="text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                      MPS 연구회
                    </h1>

                    <p className="mt-2 text-base text-white/90 drop-shadow-sm">
                      전문적인 의료진과 함께하는 MPS 연구회
                    </p>
                  </div>
                </>
              )}

              {/* === 2,3번: 이미지 슬라이드 === */}
              {slide.type === "image" && slide.src && (
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
