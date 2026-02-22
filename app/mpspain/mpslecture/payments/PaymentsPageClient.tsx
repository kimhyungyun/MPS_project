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
  const [widgetReady, setWidgetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkg, setPkg] = useState<Pkg | null>(null);

  // widget refs
  const paymentWidgetRef = useRef<any>(null);
  const paymentMethodsWidgetRef = useRef<any>(null);

  const env = useMemo(() => {
    const clientKey = (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? '').trim();
    const publicApiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
    return { clientKey, publicApiUrl };
  }, []);

  useEffect(() => {
    console.log('[ENV] NEXT_PUBLIC_TOSS_CLIENT_KEY =', env.clientKey);
    console.log('[ENV] NEXT_PUBLIC_API_URL =', env.publicApiUrl);
  }, [env.clientKey, env.publicApiUrl]);

  useEffect(() => {
    if (!env.clientKey) setError((prev) => prev ?? 'NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다. (Vercel Env 확인)');
    if (!env.publicApiUrl) setError((prev) => prev ?? 'NEXT_PUBLIC_API_URL이 없습니다. (Vercel Env 확인)');
  }, [env.clientKey, env.publicApiUrl]);

  const lecturePackageId = useMemo(() => {
    const v = searchParams.get('packageId');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  // ✅ 패키지 조회
  useEffect(() => {
    if (!lecturePackageId) {
      setPkg(null);
      return;
    }

    const endpoint = getPackagesEndpoint(env.publicApiUrl);
    if (!endpoint) {
      setPkg(null);
      setError((prev) => prev ?? 'API Base URL이 비어있습니다. (NEXT_PUBLIC_API_URL 확인)');
      return;
    }

    const run = async () => {
      try {
        setPkgLoading(true);

        console.log('[PKG] fetch endpoint =', endpoint);

        const res = await fetch(endpoint, { cache: 'no-store' });
        if (!res.ok) throw new Error(`패키지 조회 실패 (${res.status})`);

        const list: Pkg[] = await res.json();
        const found = list.find((x) => x.id === lecturePackageId) ?? null;

        console.log('[PKG] lecturePackageId =', lecturePackageId, 'found =', found);

        setPkg(found);
        if (!found) setError((prev) => prev ?? `패키지를 찾을 수 없습니다. (packageId=${lecturePackageId})`);
      } catch (e: any) {
        console.error('[PKG] ERROR =', e);
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
   * ✅ 위젯 렌더 + ready 판정(ready 이벤트 + iframe 감지 + timeout)
   * ✅ 변경 포인트: 위젯이 이제 "아래 풀폭 섹션"에 렌더됨 (id는 동일)
   */
  useEffect(() => {
    const clientKey = env.clientKey;

    console.log('[WIDGET] effect start', {
      clientKey,
      lecturePackageId,
      pkgPrice: pkg?.price,
      pkg,
    });

    if (!clientKey) return;
    if (!pkg?.price) return;
    if (!lecturePackageId) return;

    let disposed = false;
    let observer: MutationObserver | null = null;
    let timeoutId: any = null;

    const markReady = () => {
      if (!disposed) setWidgetReady(true);
    };

    const startIframeObserver = () => {
      const container = document.querySelector('#payment-widget');
      if (!container) {
        console.warn('[WIDGET] #payment-widget container not found');
        return;
      }

      const hasIframe = () => !!container.querySelector('iframe');

      if (hasIframe()) {
        console.log('[WIDGET] iframe already exists');
        markReady();
        return;
      }

      observer = new MutationObserver(() => {
        if (hasIframe()) {
          console.log('[WIDGET] iframe detected by observer');
          markReady();
          observer?.disconnect();
          observer = null;
        }
      });

      observer.observe(container, { childList: true, subtree: true });
    };

    const run = async () => {
      try {
        setWidgetReady(false);

        // 기존 렌더 있으면 금액만 업데이트
        if (paymentWidgetRef.current && paymentMethodsWidgetRef.current) {
          console.log('[WIDGET] already rendered -> updateAmount', pkg.price);
          await paymentMethodsWidgetRef.current.updateAmount(pkg.price);
          startIframeObserver();
          timeoutId = setTimeout(() => markReady(), 1200);
          return;
        }

        console.log('[WIDGET] loadPaymentWidget start');
        const paymentWidget = await loadPaymentWidget(clientKey, ANONYMOUS);
        console.log('[WIDGET] loadPaymentWidget success');

        paymentWidgetRef.current = paymentWidget;

        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: pkg.price },
          { variantKey: 'DEFAULT' },
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;

        paymentWidget.renderAgreement('#agreement');

        if (typeof paymentMethodsWidget?.on === 'function') {
          paymentMethodsWidget.on('ready', () => {
            console.log('[WIDGET] ready event fired');
            markReady();
          });
        } else {
          console.warn('[WIDGET] paymentMethodsWidget.on is not a function');
        }

        startIframeObserver();

        timeoutId = setTimeout(() => {
          const container = document.querySelector('#payment-widget');
          const iframeExists = !!container?.querySelector('iframe');
          console.log('[WIDGET] timeout check iframeExists=', iframeExists);
          if (iframeExists) markReady();
          else setError((prev) => prev ?? '결제 위젯 iframe이 생성되지 않았습니다. (키/도메인/차단 가능성)');
        }, 2500);
      } catch (e: any) {
        console.error('[WIDGET] INIT ERROR =', e);
        if (!disposed) {
          setWidgetReady(false);
          setError(e?.message ?? '결제위젯 초기화 오류');
        }
      }
    };

    run();

    return () => {
      disposed = true;
      observer?.disconnect();
      observer = null;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [env.clientKey, pkg?.price, lecturePackageId, pkg]);

  const handlePay = async () => {
    if (!lecturePackageId) return setError('packageId가 없습니다.');
    if (!env.clientKey) return setError('NEXT_PUBLIC_TOSS_CLIENT_KEY가 없습니다.');

    if (!widgetReady || !paymentWidgetRef.current || !paymentMethodsWidgetRef.current) {
      return setError('결제위젯이 아직 준비되지 않았습니다. 잠시 후 다시 시도하세요.');
    }

    try {
      setLoading(true);
      setError(null);

      const order = await createPaymentOrder(lecturePackageId);

      const orderId = String(order?.orderId ?? '').trim();
      const amount = Number(order?.amount);
      const orderName = String(order?.title ?? 'MPS 강의 패키지');

      if (!orderId) throw new Error('주문 생성 응답에 orderId가 없습니다.');
      if (!Number.isFinite(amount)) throw new Error('주문 생성 응답에 amount가 없거나 숫자가 아닙니다.');

      if (displayPrice != null && displayPrice !== amount) {
        throw new Error(`표시 금액(${displayPrice})과 주문 금액(${amount})이 다릅니다.`);
      }

      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e: any) {
      console.error('PAY ERROR FULL =', e);
      setError(e?.message ?? '결제 중 오류');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-14 max-w-6xl px-4 pb-12 pt-6 sm:mt-20 sm:pt-10">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">MPS PAYMENT</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
            결제 진행
          </h1>
          <p className="mt-2 text-sm text-slate-600">선택한 패키지 정보를 확인하고 결제를 진행하세요.</p>
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
          <div className="space-y-6">
            {/* ✅ 상단: 상품 + 요약(2컬럼) */}
            <section className="grid gap-6 items-stretch lg:grid-cols-[1fr_420px]">
              {/* 상품 카드 */}
              <div className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-7">
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

                <div className="mt-5 grid gap-4 md:grid-cols-[240px_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={productImageSrc}
                        alt="상품 이미지"
                        fill
                        sizes="(max-width: 768px) 100vw, 240px"
                        className="object-contain p-3"
                        priority
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-sm font-bold text-slate-900">안내 사항</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                      <li>• 결제 후, 결제자와 아이디 비교 후 강의 수강이 가능합니다.</li>
                      <li>• 카드 결제(간편결제 포함)는 토스페이먼츠 결제위젯으로 진행됩니다.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 요약 카드 (오른쪽) */}
              <aside className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-7 flex flex-col">
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

                  <div className="mt-auto space-y-3">
                    <button
                      onClick={handlePay}
                      disabled={loading || !widgetReady}
                      className="w-full rounded-full bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white hover:bg-indigo-700 disabled:bg-slate-300"
                    >
                      {loading ? '결제 준비 중…' : widgetReady ? '결제하기' : '위젯 로딩 중…'}
                    </button>

                    <div className="text-center text-sm">
                      <Link
                        href="/mpspain/mpslecture/policy/refund"
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        환불/취소 정책 페이지 보기
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </section>

            {/* ✅ 하단: 결제 위젯(풀폭) */}
            <section className="rounded-3xl border border-slate-200/70 bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">결제 방법</p>
                  <p className="mt-1 text-sm text-slate-600">원하는 결제 수단을 선택하세요.</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  Toss Payments
                </span>
              </div>

              {/* 위젯은 내부적으로 width를 잡아서 좁으면 몰림/줄바꿈이 심해짐.
                 풀폭 + overflow-x-auto로 깨짐 방지 */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 overflow-x-auto">
                <div id="payment-widget" className="min-w-[520px]" />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                <div id="agreement" />
              </div>

              {/* 버튼을 아래에도 하나 더 두고 싶으면 주석 해제 */}
              {/*
              <div className="mt-5">
                <button
                  onClick={handlePay}
                  disabled={loading || !widgetReady}
                  className="w-full rounded-full bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white hover:bg-indigo-700 disabled:bg-slate-300"
                >
                  {loading ? '결제 준비 중…' : widgetReady ? '결제하기' : '위젯 로딩 중…'}
                </button>
              </div>
              */}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}