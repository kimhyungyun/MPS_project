"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/메인사진1.png", "/메인사진2.jpg"];

export default function MobileHero() {
  return (
    <section className="relative w-full h-[calc(100vh-64px)] overflow-hidden block md:hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        autoplay={{
          delay: 4000,
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
    </section>
  );
}
