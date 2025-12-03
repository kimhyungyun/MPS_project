"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/테스트이미지1.png", "/메인사진2.jpg"];

export default function DesktopHero() {
  return (
    <section className="relative w-full h-[calc(100vh-100px)] overflow-hidden hidden md:block">
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
    </section>
  );
}
