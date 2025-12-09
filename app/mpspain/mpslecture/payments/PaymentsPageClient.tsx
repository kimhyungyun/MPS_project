// app/mpspain/mpslecture/payments/PaymentsPageClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

type PackageKey = 'C' | 'D' | 'E';

interface PackageInfo {
  key: PackageKey;
  name: string;
  subtitle: string;
  description: string;
  highlight?: string;
  lecturePackageId: number;
  price: number;
}

// 🔥 여기 ID/가격만 실제 DB 기준으로 바꿔줘
const PACKAGE_LIST: PackageInfo[] = [
  {
    key: 'C',
    name: 'C 패키지',
    subtitle: 'PACKAGE C',
    description: '안면부, 어깨, 경추 영역을 묶은 패키지 강의입니다.',
    highlight: '안면부 · 어깨 · 경추 집중 케어',
    lecturePackageId: 1, // TODO: 실제 C 패키지 ID
    price: 99000,        // TODO: 실제 C 패키지 가격
  },
  {
    key: 'D',
    name: 'D 패키지',
    subtitle: 'PACKAGE D',
    description: '허리, 대퇴부에 초점을 맞춘 패키지입니다.',
    highlight: '허리 · 대퇴부 기능 회복 집중',
    lecturePackageId: 2, // TODO: 실제 D 패키지 ID
    price: 129000,       // TODO: 실제 D 패키지 가격
  },
  {
    key: 'E',
    name: 'E 패키지',
    subtitle: 'PACKAGE E',
    description: '상지, 가슴, 슬하부를 통합한 패키지 구성입니다.',
    highlight: '상지 · 흉곽 · 슬하부 통합 패키지',
    lecturePackageId: 3, // TODO: 실제 E 패키지 ID
    price: 149000,       // TODO: 실제 E 패키지 가격
  },
];

export default function PaymentsPageClient() {
  const searchParams = useSearchParams();
  const [loadingKey, setLoadingKey] = useState<PackageKey | null>(null);
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const initialPackageId = searchParams.get('packageId');

  // URL에 ?packageId=3 들어오면 그 패키지를 초기 슬라이드로
  const initialIndex = useMemo(() => {
    if (!initialPackageId) return 0;
    const idNum = Number(initialPackageId);
    const idx = PACKAGE_LIST.findIndex(
      (p) => p.lecturePackageId === idNum,
    );
    return idx >= 0 ? idx : 0;
  }, [initialPackageId]);

  const handlePay = async (pkg: PackageInfo) => {
    if (!pkg.lecturePackageId) {
      alert('패키지 ID가 설정되지 않았습니다. 관리자에게 문의해주세요.');
      return;
    }

    try {
      setLoadingKey(pkg.key);

      // 1) 서버에 결제 생성
      const orderRes = await axios.post(
        `${apiBase}/payments/order`,
        { lecturePackageId: pkg.lecturePackageId },
        { withCredentials: true },
      );

      const { orderId, amount, title } = orderRes.data;

      // 2) Toss 결제창
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName: title ?? pkg.name,
        customerName: '홍길동', // TODO: 로그인 유저 이름으로 교체
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e) {
      console.error(e);
      alert('결제를 시작하는 중 오류가 발생했습니다.');
      setLoadingKey(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-40 max-w-4xl px-4 py-10 lg:py-12">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase text-indigo-500">
            MPS 강의 패키지
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            패키지 결제 페이지
          </h1>

        </header>

        <section className="relative">
          {/* 좌우 화살표 버튼 - Swiper 인스턴스 직접 제어 */}
          <button
            type="button"
            onClick={() => swiperRef?.slidePrev()}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 p-2 text-slate-700 shadow-lg hover:bg-white md:flex"
            aria-label="이전 패키지"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => swiperRef?.slideNext()}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 p-2 text-slate-700 shadow-lg hover:bg-white md:flex"
            aria-label="다음 패키지"
          >
            ›
          </button>

          <Swiper
            onSwiper={(swiper) => {
              setSwiperRef(swiper);
              swiper.slideToLoop(initialIndex, 0);
              setActiveIndex(initialIndex);
            }}
            loop
            spaceBetween={24}
            slidesPerView={1.1}
            centeredSlides
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
            }}
            className="w-full py-4"
          >
            {PACKAGE_LIST.map((pkg, idx) => {
              const isCenter = activeIndex === idx;
              const isLoading = loadingKey === pkg.key;

              return (
                <SwiperSlide key={pkg.key}>
                  <article
                    className={`
                      mx-auto flex h-full min-h-[260px] max-w-2xl flex-col justify-between 
                      rounded-3xl border bg-white p-7 transition-all duration-300 
                      ${
                        isCenter
                          ? 'scale-100 border-indigo-500 shadow-xl shadow-slate-300/70'
                          : 'scale-90 border-slate-200 opacity-60 shadow-md'
                      }
                    `}
                  >
                    {/* 상단 텍스트 영역 */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                        {pkg.subtitle}
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900">
                        {pkg.name}
                      </h2>

                      {pkg.highlight && (
                        <p className="text-sm font-medium text-indigo-600">
                          {pkg.highlight}
                        </p>
                      )}

                      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                        {pkg.description}
                      </p>
                    </div>

                    {/* 하단 가격 + 버튼 */}
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">
                          패키지 이용권 가격
                        </p>
                        <p className="text-2xl font-extrabold text-indigo-600">
                          {pkg.price.toLocaleString()}원
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePay(pkg)}
                        disabled={isLoading}
                        className={`
                          inline-flex items-center justify-center rounded-full px-6 py-3 
                          text-sm font-semibold shadow-md transition
                          ${
                            isLoading
                              ? 'bg-slate-300 text-slate-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-300'
                          }
                        `}
                      >
                        {isLoading ? '결제 준비 중…' : `${pkg.name} 결제하기`}
                      </button>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </section>
      </div>
    </main>
  );
}
