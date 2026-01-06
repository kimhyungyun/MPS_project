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
  return String(input ?? '').trim().replace(/\/$/, '');
}

function getPackagesEndpoint(baseUrl: string) {
  const base = normalizeBase(baseUrl);
  if (!base) return null;

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

  // ✅ throw 금지: 없으면 null로 두고 화면에 표시
  const env = useMemo(() => {
    const clientKey = (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '').trim();
    const publicApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').trim();

    return { clientKey, publicApiUrl, apiBase };
  }, []);

  useEffect(() => {
    // env 체크를 렌더 이후로 미룸(앱 안 죽게)
    if (!env.clientKey) setError((prev) => prev ?? 'NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다. (Vercel Production env 확인)');
    if (!env.publicApiUrl && !env.apiBase) setError((prev) => prev ?? 'NEXT_PUBLIC_API_URL 또는 NEXT_PUBLIC_API_BASE_URL이 없습니다. (Vercel Production env 확인)');
  }, [env.clientKey, env.publicApiUrl, env.apiBase]);

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

    const baseUrl = env.publicApiUrl || env.apiBase;
    const endpoint = getPackagesEndpoint(baseUrl);

    if (!endpoint) {
      setPkg(null);
      setError('API Base URL이 비어있습니다. (NEXT_PUBLIC_API_URL 또는 NEXT_PUBLIC_API_BASE_URL 확인)');
      return;
    }

    const run = async () => {
      try {
        setPkgLoading(true);
        setError(null);

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
    if (!env.clientKey) {
      setError('NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다. (Vercel Production env 확인)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderBase = normalizeBase(env.publicApiUrl || env.apiBase);
      if (!orderBase) throw new Error('API Base URL이 비어있습니다.');

      const orderUrl = `${orderBase}/payments/order`;

      const orderRes = await axios.post(
        orderUrl,
        { lecturePackageId },
        { withCredentials: true },
      );

      console.log('orderRes.data =', orderRes.data);

      const orderIdRaw = orderRes.data?.orderId;
      const amountRaw = orderRes.data?.amount;

      if (!orderIdRaw || String(orderIdRaw).trim() === '') throw new Error('주문 생성 응답에 orderId가 없습니다.');
      if (amountRaw == null || Number.isNaN(Number(amountRaw))) throw new Error('주문 생성 응답에 amount가 없거나 숫자가 아닙니다.');

      const titleRaw = orderRes.data?.title;
      const customerNameRaw = orderRes.data?.customerName;

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
        </header>

        <section className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-7">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!lecturePackageId ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-700">packageId가 없습니다.</p>
              <button
                onClick={() => router.push('/mpspain/mpslecture/packages')}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white"
              >
                패키지 목록으로
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-base font-extrabold text-slate-900">
                  {pkgLoading ? '불러오는 중…' : displayName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {displayPrice != null ? `${displayPrice.toLocaleString()}원` : '-'}
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full rounded-full bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white disabled:bg-slate-300"
              >
                {loading ? '결제 준비 중…' : '결제하기'}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
