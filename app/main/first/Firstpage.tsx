"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/메인사진1.png", "/메인사진2.jpg"];

const Firstpage = () => {
  const swiperRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (!swiperRef.current) return;

    if (isPlaying) {
      swiperRef.current.autoplay.stop();
    } else {
      swiperRef.current.autoplay.start();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <section
      className="
        relative w-full overflow-hidden
        h-[calc(100vh-64px)]
        md:h-[calc(100vh-100px)]
      "
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        loop
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {images.map((src, index) => (
          <SwiperSlide key={src}>
            <div className="relative w-full h-full">
              {/* 이미지 */}
              <Image
                src={src}
                alt={`메인 이미지 ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />

              {/* 명암 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

              {/* 텍스트 영역 */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="mx-auto flex w-full max-w-6xl px-4 sm:px-8 md:px-12">
                  <div className="max-w-xl text-left text-white">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                      MPS 연구회
                    </h1>
                    <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl text-white/90">
                      전문적인 의료진과 함께하는 MPS 연구회
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* ▶ / ❚❚ 버튼 */}
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-3">
          {/* Swiper default pagination 위치 옆으로 */}
          <button
            onClick={togglePlay}
            className="
              text-white/80 hover:text-white
              text-sm sm:text-base
              bg-black/40 hover:bg-black/60
              px-3 py-1 rounded-full
              backdrop-blur
              transition
            "
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
        </div>
      </Swiper>
    </section>
  );
};

export default Firstpage;
