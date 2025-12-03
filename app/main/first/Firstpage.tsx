"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const images = ["/메인사진1.jpg", "/메인사진2.jpg"];
const HEADER_HEIGHT = 72; // Header 높이(px)랑 맞추기

const Firstpage = () => {
  return (
    // 섹션은 높이 강제 X, 안쪽 div에서 위치/높이 계산
    <section className="relative w-full overflow-hidden">
      {/* 이 div가 실제로 화면에 보이는 영역 */}
      <div
        className="relative w-full"
        style={{
          marginTop: HEADER_HEIGHT,                 // 헤더만큼 아래로 내리고
          height: `calc(100vh - ${HEADER_HEIGHT}px)`, // 헤더 높이만큼 뺀 만큼만 채움
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
                {/* 사진 잘 보이게: 오버레이 최소화 */}
                <Image
                  src={src}
                  alt={`메인 이미지 ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />

                {/* 왼쪽만 살짝 어둡게 해서 글자만 보이게 */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

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
      </div>
    </section>
  );
};

export default Firstpage;
