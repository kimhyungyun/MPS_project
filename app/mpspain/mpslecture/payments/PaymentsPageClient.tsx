// app/mpspain/mpslecture/payments/PaymentsPageClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

// C / D / E 패키지 메타 (ID / 가격 / 설명)
// 🔥 여기 lecturePackageId / price를 실제 DB 기준으로 바꿔줘
type PackageKey = 'C' | 'D' | 'E';

interface PackageInfo {
  key: PackageKey;
  name: string;
  subtitle: string;
  description: string;
  highlight?: string;
  lecturePackageId: number; // lecture_package PK
  price: number;            // 판매 가격
}

const PACKAGE_LIST: PackageInfo[] = [
  {
    key: 'C',
    name: 'C 패키지',
    subtitle: 'PACKAGE C',
    description: '안면부, 어깨, 경추 영역을 묶은 패키지 강의입니다.',
    highlight: '안면부 · 어깨 · 경추 집중 케어',
    lecturePackageId: 1,  // TODO: 실제 C 패키지 ID로 변경
    price: 99000,         // TODO: 실제 C 패키지 가격으로 변경
  },
  {
    key: 'D',
    name: 'D 패키지',
    subtitle: 'PACKAGE D',
    description: '허리, 대퇴부에 초점을 맞춘 패키지입니다.',
    highlight: '허리 · 대퇴부 기능 회복 집중',
    lecturePackageId: 2,  // TODO: 실제 D 패키지 ID로 변경
    price: 129000,        // TODO: 실제 D 패키지 가격으로 변경
  },
  {
    key: 'E',
    name: 'E 패키지',
    subtitle: 'PACKAGE E',
    description: '상지, 가슴, 슬하부를 통합한 패키지 구성입니다.',
    highlight: '상지 · 흉곽 · 슬하부 통합 패키지',
    lecturePackageId: 3,  // TODO: 실제 E 패키지 ID로 변경
    price: 149000,        // TODO: 실제 E 패키지 가격으로 변경
  },
];

export default function PaymentsPageClient() {
  const searchParams = useSearchParams();
  const [loadingKey, setLoadingKey] = useState<PackageKey | null>(null);

  // URL에 ?packageId=3 이런 식으로 들어왔으면, 해당 패키지 카드에 "선택됨" 표시용
  const initialPackageId = searchParams.get('packageId');
  const initialSelectedKey = useMemo<PackageKey | null>(() => {
    if (!initialPackageId) return null;
    const idNum = Number(initialPackageId);
    const found = PACKAGE_LIST.find((p) => p.lecturePackageId === idNum);
    return found?.key ?? null;
  }, [initialPackageId]);

  const handlePay = async (pkg: PackageInfo) => {
    if (!pkg.lecturePackageId) {
      alert('패키지 ID가 설정되지 않았습니다. 관리자에게 문의해주세요.');
      return;
    }

    try {
      setLoadingKey(pkg.key);

      // 1) 서버에 결제 생성 (패키지 기준)
      const orderRes = await axios.post(
        `${apiBase}/payments/order`,
        { lecturePackageId: pkg.lecturePackageId },
        { withCredentials: true },
      );

      const { orderId, amount, title } = orderRes.data;

      // 2) Toss 결제창 호출
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
            C / D / E 패키지 중 원하는 구성을 선택하여 결제할 수 있습니다.
          </p>

          {initialSelectedKey && (
            <p className="mt-1 text-xs text-indigo-600">
              URL로 선택된 패키지:{' '}
              <span className="font-semibold">{initialSelectedKey} 패키지</span>
            </p>
          )}
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {PACKAGE_LIST.map((pkg) => {
            const isLoading = loadingKey === pkg.key;
            const isSelected = initialSelectedKey === pkg.key;

            return (
              <article
                key={pkg.key}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition ${
                  isSelected
                    ? 'border-indigo-500 ring-1 ring-indigo-200'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
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
                    {isLoading ? '결제 준비 중…' : `${pkg.name} 결제하기`}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
