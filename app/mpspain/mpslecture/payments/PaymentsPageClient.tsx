'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

type Pkg = { id: number; name: string; price: number };

function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

// packages 조회 엔드포인트 자동 구성
function getPackagesEndpoint() {
  // 우선순위: NEXT_PUBLIC_API_URL (서버컴포에서 쓰던 값) -> NEXT_PUBLIC_API_BASE_URL
  const base = normalizeBase(publicApiUrl ?? apiBase);

  // base가 이미 /api 로 끝나면 /lecture-packages, 아니면 /api/lecture-packages
  if (base.endsWith('/api')) return `${base}/lecture-packages`;
  return `${base}/api/lecture-packages`;
}

// API에서 못 가져왔을 때 최소한의 이름 표시 fallback
const NAME_FALLBACK: Record<number, string> = {
  1: 'A 패키지',
  2: 'B 패키지',
  3: 'C 패키지',
  4: 'A + B + C 패키지',
};

export default function PaymentsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkg, setPkg] = useState<Pkg | null>(null);

  const lecturePackageId = useMemo(() => {
    const v = searchParams.get('packageId');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  useEffect(() => {
    if (!lecturePackageId) {
      setPkg(null);
      return;
    }

    const run = async () => {
      try {
        setPkgLoading(true);
        setError(null);

        const endpoint = getPackagesEndpoint();
        const res = await fetch(endpoint, { cache: 'no-store' });

        if (!res.ok) throw new Error(`패키지 조회 실패 (${res.status})`);

        const list: Pkg[] = await res.json();
        const found = list.find((x) => x.id === lecturePackageId) ?? null;

        setPkg(found);
      } catch (e: any) {
        console.error(e);
        setPkg(null);
        setError(e?.message ?? '패키지 조회 중 오류');
      } finally {
        setPkgLoading(false);
      }
    };

    run();
  }, [lecturePackageId]);

  const displayName =
    pkg?.name ??
    (lecturePackageId ? NAME_FALLBACK[lecturePackageId] : undefined) ??
    '선택된 패키지';

  const displayPrice = pkg?.price ?? null;

  const handlePay = async () => {
    if (!lecturePackageId) {
      setError('packageId가 없습니다. 패키지 목록에서 다시 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1) 서버에 결제 생성 (DB 가격/제목 사용)
      const orderRes = await axios.post(
        `${normalizeBase(apiBase)}/payments/order`,
        { lecturePackageId },
        { withCredentials: true },
      );

      const { orderId, amount, title, customerName } = orderRes.data;

      // 2) Toss 결제창
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName: title ?? 'MPS 강의 패키지',
        customerName: customerName ?? '고객',
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e: any) {
      console.error(e);
      setError('결제를 시작하는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-24 max-w-xl px-4 py-10">
        <header className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            MPS PAYMENT
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            결제 진행
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            선택한 패키지를 확인한 후 결제를 진행합니다.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_rgba(2,6,23,0.06)]">
          {!lecturePackageId ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                packageId가 없습니다. 목록에서 패키지를 선택해주세요.
              </p>
              <button
                type="button"
                onClick={() => router.push('/mpspain/mpslecture/packages')}
                className="
                  w-full rounded-full px-6 py-3 text-sm font-extrabold text-white
                  bg-gradient-to-r from-indigo-600 to-indigo-500
                  hover:from-indigo-700 hover:to-indigo-600
                "
              >
                패키지 목록으로
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* ✅ 요청한 영역: 패키지명 + 금액 표시 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Selected Package
                    </p>

                    <p className="mt-1 truncate text-base font-extrabold tracking-tight text-slate-900">
                      {pkgLoading ? '불러오는 중…' : displayName}{' '}
                      <span className="text-sm font-semibold text-slate-500">
                        (ID: {lecturePackageId})
                      </span>
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      금액/상품명은 결제 생성 시 서버(DB) 기준으로 최종 확정됩니다.
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Price
                    </p>
                    <p className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                      {displayPrice != null ? (
                        <>
                          {Number(displayPrice).toLocaleString()}
                          <span className="ml-1 text-sm font-bold text-slate-500">원</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">-</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-2xl border border-red-100 bg-red-50/70 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className={`
                  w-full rounded-full px-6 py-3 text-sm font-extrabold text-white
                  shadow-[0_12px_30px_rgba(79,70,229,0.25)]
                  ${loading
                    ? 'bg-slate-300 shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600'}
                `}
              >
                {loading ? '결제 준비 중…' : '결제하기'}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="
                  w-full rounded-full border border-slate-200 bg-white px-6 py-3
                  text-sm font-bold text-slate-700 hover:bg-slate-50
                "
              >
                뒤로가기
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
