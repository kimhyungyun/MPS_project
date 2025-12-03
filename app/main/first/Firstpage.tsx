"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const images = ["/메인사진1.jpg", "/메인사진2.jpg"];

const Firstpage = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        loop
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="w-full h-full"
      >
        {images.map((src, index) => (
          <SwiperSlide key={src}>
            <div className="relative w-full h-full">
              {/* 메인 이미지 */}
              <Image
                src={src}
                alt={`메인 이미지 ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover brightness-90"
              />

              {/* 명암/비네팅 느낌 그라데이션 (위 예시 느낌) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/60" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />

              {/* 필요하면 아주 살짝만 더 어둡게 */}
              {/* <div className="absolute inset-0 bg-black/15" /> */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Firstpage;
