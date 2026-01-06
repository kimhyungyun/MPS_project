'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { createPaymentOrder } from '@/app/services/payments';
import Image from 'next/image';

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

// ✅ env는 도메인만(https://api.mpspain.co.kr) 두고, 코드에서 /api를 한 번만 붙인다.
function ensureApiBase(baseUrl: string) {
  const base = normalizeBase(baseUrl);
  if (!base) return null;
  return base.endsWith('/api') ? base : `${base}/api`;
}

function getPackagesEndpoint(baseUrl: string) {
  const apiBase = ensureApiBase(baseUrl);
  if (!apiBase) return null;
  return `${apiBase}/lecture-packages`;
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
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').trim(); // optional

    return { clientKey, publicApiUrl, apiBase };
  }, []);

  useEffect(() => {
    if (!env.clientKey) {
      setError((prev) => prev ?? 'NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다. (Vercel Production env 확인)');
    }
    if (!env.publicApiUrl && !env.apiBase) {
      setError((prev) => prev ?? 'NEXT_PUBLIC_API_URL 또는 NEXT_PUBLIC_API_BASE_URL이 없습니다. (Vercel Production env 확인)');
    }
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
  const priceText = displayPrice != null ? `${displayPrice.toLocaleString()}원` : '-';

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

      // ✅ 주문 생성: 결제 서비스(토큰 자동 첨부) 사용
      const order = await createPaymentOrder(lecturePackageId);

      const orderIdRaw = order?.orderId;
      const amountRaw = order?.amount;

      if (!orderIdRaw || String(orderIdRaw).trim() === '') {
        throw new Error('주문 생성 응답에 orderId가 없습니다.');
      }
      if (amountRaw == null || Number.isNaN(Number(amountRaw))) {
        throw new Error('주문 생성 응답에 amount가 없거나 숫자가 아닙니다.');
      }

      const orderId = String(orderIdRaw);
      const amount = Number(amountRaw);
      const orderName = String(order?.title ?? 'MPS 강의 패키지');
      const customerName = String(order?.customerName ?? '고객');

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
      console.error('PAY ERROR FULL =', e);

      const msg =
        e?.message
          ? String(e.message)
          : JSON.stringify(e ?? { message: 'Unknown error' }, null, 2);

      setError(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-16 max-w-4xl px-4 pb-12 pt-6 sm:mt-24 sm:pt-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
            MPS PAYMENT
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
            결제 진행
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            선택한 패키지 정보를 확인하고 결제를 진행하세요.
          </p>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!lecturePackageId ? (
          <section className="rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8">
            <p className="text-sm text-slate-700">packageId가 없습니다.</p>
            <button
              onClick={() => router.push('/mpspain/mpslecture/packages')}
              className="mt-4 w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-indigo-700"
            >
              패키지 목록으로
            </button>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
            {/* ✅ 상품 카드 */}
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-7 h-full flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500">선택 상품</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                    {pkgLoading ? '불러오는 중…' : displayName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{priceText}</p>
                </div>

                <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  카드결제
                </span>
              </div>

              {/* 이미지 + 설명 */}
              <div className="mt-5 grid gap-4 sm:grid-cols-[220px_1fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/상품테스트이미지.jpg"
                      alt="상품 이미지"
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      className="object-contain p-3"
                      priority
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-sm font-bold text-slate-900">구성 안내</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    <li>• 결제 후 즉시 수강 권한이 활성화됩니다.</li>
                    <li>• 결제는 토스페이먼츠를 통해 안전하게 진행됩니다.</li>
                    <li>• 패키지 구성/가격은 프로모션에 따라 변동될 수 있습니다.</li>
                  </ul>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-500">선택된 패키지</p>
                    <p className="mt-1 text-sm font-extrabold text-slate-900">
                      {pkgLoading ? '불러오는 중…' : displayName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">결제 금액</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">{priceText}</p>
                </div>

                <button
                  onClick={() => router.push('/mpspain/mpslecture/packages')}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  다른 패키지 보기
                </button>
              </div>
            </div>

            {/* ✅ 결제 요약 카드 (높이 맞춤 + 버튼 하단 고정) */}
            <aside className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-7 h-full flex flex-col">
              <p className="text-sm font-extrabold text-slate-900">결제 요약</p>

              <div className="mt-4 flex flex-col gap-3 grow">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold text-slate-500">상품명</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {pkgLoading ? '불러오는 중…' : displayName}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700">상품 금액</p>
                    <p className="text-sm font-bold text-slate-900">{priceText}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-slate-700">할인</p>
                    <p className="text-sm font-bold text-slate-900">0원</p>
                  </div>
                  <div className="mt-3 h-px bg-slate-200" />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-extrabold text-slate-900">총 결제금액</p>
                    <p className="text-base font-extrabold text-slate-900">{priceText}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full rounded-full bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white hover:bg-indigo-700 disabled:bg-slate-300"
                  >
                    {loading ? '결제 준비 중…' : '결제하기'}
                  </button>

                  <p className="text-xs text-slate-500">
                    결제 진행 시 이용약관 및 결제 정책에 동의한 것으로 간주됩니다.
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
