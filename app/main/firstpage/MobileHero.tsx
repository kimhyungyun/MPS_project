"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/테스트이미지2.png", "/메인사진2.jpg"];

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
    // 여기서도 calc 빼고 h-screen만, 헤더 보정은 레이아웃에서
    <section className="relative w-full h-screen overflow-hidden block md:hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        onSwiper={setSwiper}
        className="w-full h-full"
      >
        {images.map((src, idx) => (
          <SwiperSlide key={src}>
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={`메인 이미지 ${idx + 1}`}
                fill
                priority={idx === 0}
                className="object-cover object-center"
              />

              {/* mobile overlay: 좀 더 진하게 */}
              <div className="absolute inset-0 bg-black/40" />

              {/* 텍스트 */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl font-extrabold text-white leading-tight">
                  MPS 연구회
                </h1>

                <p className="mt-3 text-base text-white/90">
                  전문적인 의료진과 함께하는 MPS 연구회
                </p>
              </div>
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
