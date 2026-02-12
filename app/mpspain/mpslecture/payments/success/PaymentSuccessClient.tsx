'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

function normalizeBase(input: unknown) {
  return String(input ?? '').trim().replace(/\/$/, '');
}

// NEXT_PUBLIC_API_URL=https://api.mpspain.co.kr  (도메인만)
// 실제 API prefix는 /api 로 통일
function ensureApiBase(baseUrl: string) {
  const base = normalizeBase(baseUrl);
  if (!base) return null;
  return base.endsWith('/api') ? base : `${base}/api`;
}

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('결제 승인 처리 중입니다...');

  const apiBase = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_API_URL ?? '';
    return ensureApiBase(raw);
  }, []);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');

    if (!paymentKey || !orderId || !amountStr) {
      setMessage('필수 결제 정보가 없습니다.');
      return;
    }
    if (!apiBase) {
      setMessage('NEXT_PUBLIC_API_URL이 없습니다. (Vercel Env 확인)');
      return;
    }

    const amount = Number(amountStr);

    (async () => {
      try {
        const res = await axios.post(
          `${apiBase}/payments/confirm`,
          { paymentKey, orderId, amount },
          { withCredentials: true },
        );

        console.log('결제 승인 결과:', res.data);
        setMessage('결제가 정상적으로 완료되었습니다.');

        // 원하면 여기서 이동
        // router.push('/mpspain/mpslecture/my');
      } catch (e: any) {
        console.error(e);
        setMessage(e?.response?.data?.message ?? '결제 승인 중 오류가 발생했습니다.');
      }
    })();
  }, [searchParams, apiBase]);

  return (
    <main className="flex flex-col items-center justify-center p-10 gap-4">
      <h1 className="text-2xl font-bold">결제 성공</h1>
      <p>{message}</p>
      <button onClick={() => router.push('/')} className="px-4 py-2 rounded border">
        홈으로 가기
      </button>
    </main>
  );
}
