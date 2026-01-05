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

function getPackagesEndpoint() {
  const base = normalizeBase(publicApiUrl ?? apiBase);
  if (base.endsWith('/api')) return `${base}/lecture-packages`;
  return `${base}/api/lecture-packages`;
}

const NAME_FALLBACK: Record<number, string> = {
  1: 'MPS 강의 모음 A',
  2: 'MPS 강의 모음 B',
  3: 'MPS 강의 모음 C',
  4: 'MPS 강의 모음 A + B + C',
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

        const res = await fetch(getPackagesEndpoint(), { cache: 'no-store' });
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
  }, [lecturePackageId]);

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

      const orderRes = await axios.post(
        `${normalizeBase(apiBase)}/payments/order`,
        { lecturePackageId },
        { withCredentials: true },
      );

      const { orderId, amount, title, customerName } = orderRes.data;
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName: title ?? 'MPS 강의 패키지',
        customerName: customerName ?? '고객',
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e) {
      console.error(e);
      setError('결제를 시작하는 중 오류가 발생했습니다.');
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
              {/* ✅ Mobile: stack / Desktop: row, and prevent 2-line wrap */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Selected Package
                    </p>

                    {/* 한 줄 고정: truncate */}
                    <p className="mt-1 flex items-baseline gap-2 min-w-0">
                      <span className="min-w-0 truncate text-base font-extrabold tracking-tight text-slate-900">
                        {pkgLoading ? '불러오는 중…' : displayName}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-slate-500">
                        (ID: {lecturePackageId})
                      </span>
                    </p>


                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      가격
                    </p>

                    {/* 가격도 한 줄 고정 */}
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

      {/* ✅ Mobile sticky bottom CTA (optional but good) */}
      {/* 버튼이 이미 있어서 중복 싫으면 아래 블록 삭제하면 됨 */}
      {/* lecturePackageId가 있을 때만 보여줌 */}
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

      {/* sticky footer 때문에 내용 가리는 것 방지 */}
      {lecturePackageId ? <div className="h-20 sm:hidden" /> : null}
    </main>
  );
}
