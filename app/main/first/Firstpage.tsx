"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/메인사진1.jpg", "/메인사진2.jpg"];
const HEADER_HEIGHT = 72; // 레이아웃에서 main padding-top이랑 맞추기

const Firstpage = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`, // 헤더 제외한 영역 꽉 채우기
      }}
    >
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
              {/* 섹션 기준으로 가운데 정렬 + 꽉 채우기 */}
              <Image
                src={src}
                alt={`메인 이미지 ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />

              {/* 왼쪽만 살짝 어둡게 (사진은 그대로 보이게) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

              {/* 텍스트 영역 */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="mx-auto flex w-full max-w-6xl px-4 sm:px-8 md:px-12">
                  <div className="max-w-xl text-left text-white">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                      MPS 연구회
                    </h1>
                    <p className="mt-5 text-lg sm:text-xl md:text-2xl text-white/90">
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
