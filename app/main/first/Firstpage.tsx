"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    src: "/메인사진1.jpg",
    titleTop: "MPS 연구소",
    titleMain: "세계가 인정한 통증관리의 기준",
    description:
      "숙련된 전문가가 정확하게 진단하고 치료하여 믿고 맡길 수 있는 통증 관리 솔루션을 제공합니다.",
    buttonText: "자세히 보기",
  },
  {
    src: "/메인사진2.jpg",
    titleTop: "MPS 연구소",
    titleMain: "깔끔하고 감각적인 메인 화면",
    description:
      "심플하지만 디테일하게, 방문자가 머물고 싶어지는 첫 화면을 만들어 보세요.",
    buttonText: "MPS 강좌 보러가기",
  },
];

const Firstpage = () => {
  return (
    // 헤더 높이(대략 88px) 만큼 아래에서 시작하도록 margin + height 조정
    <section className="relative w-full mt-[88px] h-[calc(100vh-88px)] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop
        autoplay={{
          delay: 5000, // 5초마다 자동 슬라이드
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-full">
              {/* 배경 이미지 */}
              <Image
                src={slide.src}
                alt={slide.titleMain}
                fill
                priority={idx === 0}
                className="object-cover"
              />

              {/* 어두운 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

              {/* 컨텐츠 */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:px-8 md:px-10 lg:px-12">
                  <div className="max-w-xl text-left text-white">
                    {/* 상단 작은 텍스트 */}
                    <p className="mb-2 text-sm font-semibold text-emerald-300">
                      {slide.titleTop}
                    </p>

                    {/* 메인 타이틀 */}
                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                      {slide.titleMain}
                    </h1>

                    {/* 설명 */}
                    <p className="mt-4 text-sm text-white/80 sm:text-base md:text-lg">
                      {slide.description}
                    </p>

                    {/* 버튼 영역 */}
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <button className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-blue-600 hover:-translate-y-0.5">
                        {slide.buttonText}
                      </button>
                      <button className="rounded-full border border-white/50 bg-white/5 px-6 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15 hover:-translate-y-0.5">
                        문의하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 프로그래스 느낌의 바 + 페이지 번호 */}
              <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex w-full max-w-6xl -translate-x-1/2 items-center justify-between px-4 sm:px-8 md:px-10 lg:px-12">
                <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
                  {/* Swiper 기본 pagination 동그라미 대신, 아래 progress bar만 쓰고 싶다면
                      pagination type을 progressbar로 바꾸고 CSS로 스타일링 해도 됨 */}
                </div>
                <span className="ml-4 text-xs font-medium text-white/80">
                  {String(idx + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Firstpage;
