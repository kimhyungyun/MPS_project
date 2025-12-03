"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/메인사진1.jpg", "/메인사진2.jpg"];

const Firstpage = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
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
              {/* 배경 이미지 */}
              <Image
                src={src}
                alt={`메인 이미지 ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover brightness-[0.6]" // 사진 더 진하게
              />

              {/* 명암/그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

              {/* 텍스트 영역 */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="mx-auto flex w-full max-w-6xl px-4 sm:px-8 md:px-12">
                  <div className="max-w-xl text-left text-white">
                    {/* 타이틀 */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                      MPS 연구회
                    </h1>
                    {/* 본문 */}
                    <p className="mt-4 text-base sm:text-lg md:text-xl text-white/85">
                      전문적인 의료진과 함께하는 MPS 연구회
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Firstpage;
