"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

// Swiper 기본 스타일
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    src: "/메인사진1.jpg",
    title: "당신의 콘텐츠를 가장 멋지게",
    subtitle: "mps에서 영상, 강의, 컨텐츠를 한 곳에서 관리하고 보여주세요.",
    badge: "NEW",
  },
  {
    src: "/메인사진2.jpg",
    title: "깔끔하고 감각적인 메인 화면",
    subtitle: "심플하지만 디테일하게, 방문자가 머물고 싶어지는 첫 화면을 만들어요.",
    badge: "FEATURE",
  },
];

const Firstpage = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-screen">
              {/* 배경 이미지 */}
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
              />

              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

              {/* 컨텐츠 영역 */}
              <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
                <div className="max-w-3xl w-full text-center text-white space-y-6">
                  {/* 뱃지 */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium backdrop-blur">
                      <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
                      {slide.badge}
                    </span>
                  </div>

                  {/* 타이틀 */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                    {slide.title}
                  </h1>

                  {/* 서브 텍스트 */}
                  <p className="text-sm sm:text-base md:text-lg text-white/80">
                    {slide.subtitle}
                  </p>

                  {/* 버튼 영역 */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <button className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-md shadow-black/20 transition hover:-translate-y-0.5 hover:bg-neutral-100">
                      시작하기
                    </button>
                    <button className="rounded-full border border-white/40 bg-white/5 px-6 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">
                      자세히 보기
                    </button>
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
