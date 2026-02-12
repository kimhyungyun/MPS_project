'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ANONYMOUS, loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { createPaymentOrder } from '@/app/services/payments';
import Image from 'next/image';
import Link from 'next/link';

type Pkg = { id: number; name: string; price: number };

const NAME_FALLBACK: Record<number, string> = {
  1: 'MPS 강의 모음 A',
  2: 'MPS 강의 모음 B',
  3: 'MPS 강의 모음 C',
  4: 'MPS 강의 모음 A + B + C',
};

const MOBILE_IMAGE_BY_ID: Record<number, string> = {
  1: '/최종상품M이미지1.jpg',
  2: '/최종상품M이미지2.jpg',
  3: '/최종상품M이미지3.jpg',
  4: '/최종상품M이미지4.jpg',
};

const MOBILE_IMAGE_FALLBACK = '/최종상품M이미지1.jpg';

function normalizeBase(input: unknown) {
  return String(input ?? '').trim().replace(/\/$/, '');
}

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

  // ✅ 결제위젯 렌더를 위한 상태
  const [amountForWidget, setAmountForWidget] = useState<number | null>(null);

  // widget refs
  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);

  const env = useMemo(() => {
    const clientKey = (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '').trim(); // live_gck / test_gck
    const publicApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim(); // https://api.mpspain.co.kr
    return { clientKey, publicApiUrl };
  }, []);

  useEffect(() => {
    if (!env.clientKey) {
      setError((prev) => prev ?? 'NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다. (Vercel Env 확인)');
    }
    if (!env.publicApiUrl) {
      setError((prev) => prev ?? 'NEXT_PUBLIC_API_URL이 없습니다. (Vercel Env 확인)');
    }
  }, [env.clientKey, env.publicApiUrl]);

  const lecturePackageId = useMemo(() => {
    const v = searchParams.get('packageId');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  // 패키지 조회
  useEffect(() => {
    if (!lecturePackageId) {
      setPkg(null);
      return;
    }

    const endpoint = getPackagesEndpoint(env.publicApiUrl);
    if (!endpoint) {
      setPkg(null);
      setError('API Base URL이 비어있습니다. (NEXT_PUBLIC_API_URL 확인)');
      return;
    }

    const run = async () => {
      try {
        setPkgLoading(true);
        setError(null);

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
  }, [lecturePackageId, env.publicApiUrl]);

  const displayName =
    pkg?.name ??
    (lecturePackageId ? NAME_FALLBACK[lecturePackageId] : undefined) ??
    '선택된 패키지';

  const displayPrice = pkg?.price ?? null;
  const priceText = displayPrice != null ? `${displayPrice.toLocaleString()}원` : '-';

  const productImageSrc = lecturePackageId
    ? (MOBILE_IMAGE_BY_ID[lecturePackageId] ?? MOBILE_IMAGE_FALLBACK)
    : MOBILE_IMAGE_FALLBACK;

  /**
   * ✅ 결제위젯 렌더링
   * - amountForWidget 값이 생기면 위젯을 렌더
   * - 이미 렌더된 상태에서 금액이 바뀌면 updateAmount로 갱신
   */
  useEffect(() => {
    const clientKey = env.clientKey;
    if (!clientKey) return;

    // amount가 아직 없으면 렌더하지 않음
    if (amountForWidget == null) return;

    const run = async () => {
      try {
        // 이미 렌더된 적 있으면 amount만 업데이트
        if (paymentWidgetRef.current && paymentMethodsWidgetRef.current) {
          await paymentMethodsWidgetRef.current.updateAmount(amountForWidget);
          return;
        }

        // customerKey:
        // - 회원이면 userId 같은 고유값
        // - 비회원/임시면 ANONYMOUS
        const customerKey = ANONYMOUS;

        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        paymentWidgetRef.current = paymentWidget;

        // 결제수단 위젯 렌더
        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: amountForWidget },
          { variantKey: 'DEFAULT' },
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        // 약관 위젯 렌더
        paymentWidget.renderAgreement('#agreement');
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? '결제위젯 초기화 오류');
      }
    };

    run();
  }, [env.clientKey, amountForWidget]);

  const handlePay = async () => {
    if (!lecturePackageId) {
      setError('packageId가 없습니다.');
      return;
    }
    if (!env.clientKey) {
      setError('NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1) 서버에서 주문 생성
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

      // (강추) 화면 표시 가격과 주문 금액이 다르면 막기
      if (displayPrice != null && displayPrice !== amount) {
        throw new Error(`표시 금액(${displayPrice})과 주문 금액(${amount})이 다릅니다.`);
      }

      // 2) 위젯 렌더/업데이트를 위해 amount 설정
      setAmountForWidget(amount);

      // 3) 위젯 인스턴스 준비 확인
      // (렌더가 아직 안 됐으면 다음 tick에서 만들어질 수 있으니 한번 더 체크)
      const paymentWidget = paymentWidgetRef.current;
      if (!paymentWidget) {
        // 위젯이 아직 준비 안 되면 여기서 바로 requestPayment하면 실패할 수 있음
        // 이 경우 사용자가 버튼 한번 더 누르면 정상 동작
        throw new Error('결제위젯이 아직 준비되지 않았습니다. 잠시 후 다시 시도하세요.');
      }

      // 4) 결제 요청
      await paymentWidget.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e: any) {
      console.error('PAY ERROR FULL =', e);
      const msg = e?.message ? String(e.message) : JSON.stringify(e ?? { message: 'Unknown error' }, null, 2);
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-16 max-w-4xl px-4 pb-12 pt-6 sm:mt-24 sm:pt-10">
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
            {/* 상품 카드 (그대로) */}
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
                  결제위젯
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[220px_1fr] sm:h-[200px]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <div className="relative aspect-[4/4] w-full">
                    <Image
                      src={productImageSrc}
                      alt="상품 이미지"
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      className="object-contain p-3"
                      priority
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 min-h-0 overflow-y-auto">
                  <p className="text-sm font-bold text-slate-900">안내 사항</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                    <li>• 결제 후, 결제자와 아이디 비교 후 강의 수강이 가능합니다. 약간의 시간이 걸릴 수 있습니다.</li>
                    <li>
                      • 카드 결제(간편결제 포함)는 토스페이먼츠로 진행됩니다.
                    </li>
                    <li>• 패키지 구성/가격은 프로모션에 따라 변동될 수 있습니다.</li>
                    <li>• (환불정책 및 이용 정책)을 숙지하지 않아서 생기는 불이익에 대해서는 책임지지 않습니다.</li>
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

            {/* 결제 요약 + 결제위젯 렌더 영역 */}
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
                    <p className="text-sm text-slate-700">총 결제금액</p>
                    <p className="text-sm font-bold text-slate-900">{priceText}</p>
                  </div>
                </div>

                {/* ✅ 결제위젯 렌더 자리 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div id="payment-widget" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div id="agreement" />
                </div>

                <div className="mt-auto space-y-3">
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full rounded-full bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white hover:bg-indigo-700 disabled:bg-slate-300"
                  >
                    {loading ? '결제 준비 중…' : '결제하기'}
                  </button>

                  <div className="mt-5 text-center text-sm">
                    <Link
                      href="/mpspain/mpslecture/policy/refund"
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      환불/취소 정책 페이지 보기
                    </Link>
                  </div>

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
