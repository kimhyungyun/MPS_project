'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function PaymentsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lecturePackageId = useMemo(() => {
    const v = searchParams.get('packageId');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [searchParams]);

  useEffect(() => {
    // packageId 없이 접근하면 목록으로 보내는 게 UX 좋음
    if (!lecturePackageId) return;
  }, [lecturePackageId]);

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
        `${apiBase}/payments/order`,
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
        customerName: customerName ?? '고객', // 가능하면 서버에서 유저명 내려주기
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-28 max-w-xl px-4 py-10">
        <header className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase text-indigo-500">MPS 결제</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">결제 진행</h1>
          <p className="mt-2 text-sm text-slate-600">
            패키지 확인 후 결제를 진행합니다.
          </p>
        </header>

        <section className="rounded-3xl border bg-white p-6">
          {!lecturePackageId ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                packageId가 없습니다. 목록에서 패키지를 선택해주세요.
              </p>
              <button
                type="button"
                onClick={() => router.push('/mpspain/mpslecture/packages')}
                className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                패키지 목록으로
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                선택된 패키지 ID: <b>{lecturePackageId}</b>
                <br />
                금액/상품명은 결제 생성 시 서버(DB) 기준으로 확정됩니다.
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className={`w-full rounded-full px-6 py-3 text-sm font-bold text-white ${
                  loading ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? '결제 준비 중…' : '결제하기'}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full rounded-full border bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
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
