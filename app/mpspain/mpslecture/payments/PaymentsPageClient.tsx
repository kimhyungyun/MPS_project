'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

type Pkg = { id: number; name: string; price: number };

const NAME_FALLBACK: Record<number, string> = {
  1: 'MPS 강의 모음 A',
  2: 'MPS 강의 모음 B',
  3: 'MPS 강의 모음 C',
  4: 'MPS 강의 모음 A + B + C',
};

function normalizeBase(input: unknown) {
  // 어떤 값이 와도 string으로 만들고 replace 처리
  const base = String(input ?? '').trim();
  return base.replace(/\/$/, '');
}

function requireEnv(name: string, value: string | undefined) {
  const v = (value ?? '').trim();
  if (!v) throw new Error(`${name} 환경변수가 없습니다.`);
  return v;
}

function getPackagesEndpoint(publicApiUrl: string, apiBaseUrl?: string) {
  // 우선순위: NEXT_PUBLIC_API_URL -> NEXT_PUBLIC_API_BASE_URL
  const raw = (publicApiUrl ?? apiBaseUrl ?? '').trim();
  const base = normalizeBase(raw);

  if (!base) throw new Error('API Base URL이 비어있습니다. (NEXT_PUBLIC_API_URL 또는 NEXT_PUBLIC_API_BASE_URL 확인)');

  // 네 기존 로직 유지
  if (base.endsWith('/api')) return `${base}/lecture-packages`;
  return `${base}/api/lecture-packages`;
}

export default function PaymentsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkg, setPkg] = useState<Pkg | null>(null);

  // ✅ env는 컴포넌트 안에서 "확정" 시켜두는 게 안전함 (클라 전용)
  const env = useMemo(() => {
    const clientKey = requireEnv(
      'NEXT_PUBLIC_TOSS_CLIENT_KEY',
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    );

    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').trim(); // optional
    const publicApiUrl = requireEnv(
      'NEXT_PUBLIC_API_URL',
      process.env.NEXT_PUBLIC_API_URL,
    );

    return { clientKey, apiBase, publicApiUrl };
  }, []);

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

        const endpoint = getPackagesEndpoint(env.publicApiUrl, env.apiBase);
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok) throw new Error(`패키지 조회 실패 (${res.status})`);

        const list: Pkg[] = await res.json();
        setPkg(list.find((x) => x.id === lecturePackageId) ?? null);
      } catch (e: any) {
        console.error(e);
        setPkg(null);
        setError(e?.message ?? '패키지 조회 중 오류');
      } finally {
        setPkgLoading(false);
      }
    };

    run();
  }, [lecturePackageId, env.publicApiUrl, env.apiBase]);

  const displayName =
    pkg?.name ??
    (lecturePackageId ? NAME_FALLBACK[lecturePackageId] : undefined) ??
    '선택된 패키지';

  const displayPrice = pkg?.price ?? null;

  const handlePay = async () => {
    if (!lecturePackageId) {
      setError('packageId가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ 주문 생성 API URL 구성 (publicApiUrl을 기본으로 사용)
      // - env.publicApiUrl이 https://api.mpspain.co.kr 라면 -> /payments/order 붙여 호출
      // - env.publicApiUrl이 https://api.mpspain.co.kr/api 라면 -> /payments/order 붙여 호출 (서버 라우팅에 맞게)
      const orderBase = normalizeBase(env.publicApiUrl);
      const orderUrl = `${orderBase}/payments/order`;

      const orderRes = await axios.post(
        orderUrl,
        { lecturePackageId },
        { withCredentials: true },
      );

      // ✅ 응답 확인 로그 (문제 생기면 바로 이걸 보면 됨)
      console.log('orderRes.data =', orderRes.data);

      const orderIdRaw = orderRes.data?.orderId;
      const amountRaw = orderRes.data?.amount;
      const titleRaw = orderRes.data?.title;
      const customerNameRaw = orderRes.data?.customerName;

      // ✅ 여기서 확실히 막아줌: undefined면 requestPayment로 못 넘어가게
      if (orderIdRaw == null || String(orderIdRaw).trim() === '') {
        throw new Error('주문 생성 응답에 orderId가 없습니다.');
      }
      if (amountRaw == null || Number.isNaN(Number(amountRaw))) {
        throw new Error('주문 생성 응답에 amount가 없거나 숫자가 아닙니다.');
      }

      const orderId = String(orderIdRaw);
      const amount = Number(amountRaw);
      const orderName = String(titleRaw ?? 'MPS 강의 패키지');
      const customerName = String(customerNameRaw ?? '고객');

      const tossPayments = await loadTossPayments(env.clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName,
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? '결제를 시작하는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-16 max-w-2xl px-4 pb-10 pt-6 sm:mt-24 sm:py-10">
        <header className="mb-6 text-center sm:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
            MPS PAYMENT
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
            결제 진행
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:mt-3">
            선택한 패키지를 확인한 후 결제를 진행합니다.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_rgba(2,6,23,0.06)] sm:p-7">
          {!lecturePackageId ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-700">
                packageId가 없습니다. 패키지 목록에서 다시 선택해주세요.
              </p>
              <button
                onClick={() => router.push('/mpspain/mpslecture/packages')}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-indigo-700"
              >
                패키지 목록으로
              </button>
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Selected Package
                    </p>

                    <p className="mt-1 flex items-baseline gap-2 min-w-0">
                      <span className="min-w-0 truncate text-base font-extrabold tracking-tight text-slate-900">
                        {pkgLoading ? '불러오는 중…' : displayName}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      가격
                    </p>

                    <p className="mt-1 whitespace-nowrap text-lg font-extrabold tracking-tight text-slate-900">
                      {displayPrice != null ? `${displayPrice.toLocaleString()}` : '-'}
                      <span className="ml-1 text-sm font-bold text-slate-500">원</span>
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="truncate">{error}</p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={loading}
                className={`w-full rounded-full px-6 py-4 text-sm font-extrabold text-white ${
                  loading
                    ? 'bg-slate-300'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600'
                }`}
              >
                {loading ? '결제 준비 중…' : '결제하기'}
              </button>

              <button
                onClick={() => router.back()}
                className="w-full rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                뒤로가기
              </button>
            </div>
          )}
        </section>
      </div>

      {lecturePackageId ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur sm:hidden">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <button
              onClick={handlePay}
              disabled={loading}
              className={`w-full rounded-full px-6 py-4 text-sm font-extrabold text-white ${
                loading
                  ? 'bg-slate-300'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600'
              }`}
            >
              {loading ? '결제 준비 중…' : '결제하기'}
            </button>
          </div>
        </div>
      ) : null}

      {lecturePackageId ? <div className="h-20 sm:hidden" /> : null}
    </main>
  );
}
