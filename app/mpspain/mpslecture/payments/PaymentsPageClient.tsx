// app/mpspain/mpslecture/payments/PaymentsPageClient.tsx
'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

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

// 🔥 여기 ID/가격만 네 DB 기준으로 바꿔주면 됨
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

  const initialPackageId = searchParams.get('packageId');

  // URL에 ?packageId=3 같은 거 들어오면 해당 패키지를 초기 활성 슬라이드로
  const initialIndex = useMemo(() => {
    if (!initialPackageId) return 0;
    const idNum = Number(initialPackageId);
    const idx = PACKAGE_LIST.findIndex(
      (p) => p.lecturePackageId === idNum,
    );
    return idx >= 0 ? idx : 0;
  }, [initialPackageId]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

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
          <p className="mt-2 text-sm text-slate-600">
            C / D / E 패키지를 왼쪽·오른쪽으로 넘기며 선택하고 결제할 수 있습니다.
          </p>
        </header>

        <section className="relative">
          {/* 좌우 화살표 버튼 */}
          <button
            className="swiper-button-prev absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white/80 p-2 text-slate-700 shadow hover:bg-white md:flex"
            aria-label="이전 패키지"
          >
            ‹
          </button>
          <button
            className="swiper-button-next absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white/80 p-2 text-slate-700 shadow hover:bg-white md:flex"
            aria-label="다음 패키지"
          >
            ›
          </button>

          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            loop
            spaceBetween={24}
            slidesPerView={1.2}
            centeredSlides
            initialSlide={initialIndex}
            onSlideChange={(swiper) => {
              // loop 사용 시 realIndex를 써야 0~2로 고정됨
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
                    className={`mx-auto flex h-full max-w-md flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition 
                      ${isCenter
                        ? 'scale-100 border-indigo-500 shadow-lg'
                        : 'scale-90 border-slate-200 opacity-60'
                      }
                    `}
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-indigo-500">
                        {pkg.subtitle}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-slate-900">
                        {pkg.name}
                      </h2>
                      {pkg.highlight && (
                        <p className="mt-1 text-xs font-medium text-indigo-600">
                          {pkg.highlight}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-slate-600">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">
                          패키지 이용권 가격
                        </p>
                        <p className="text-xl font-bold text-indigo-600">
                          {pkg.price.toLocaleString()}원
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePay(pkg)}
                        disabled={isLoading}
                        className={`inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition md:w-auto ${
                          isLoading
                            ? 'bg-slate-300 text-slate-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isLoading
                          ? '결제 준비 중…'
                          : `${pkg.name} 결제하기`}
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
