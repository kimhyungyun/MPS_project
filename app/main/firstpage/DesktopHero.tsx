"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/메인이미지.jpg", "/메인사진1.jpg"];

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

              {/* 명암 */}
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
