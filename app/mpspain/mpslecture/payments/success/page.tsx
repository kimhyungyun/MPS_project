'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('결제 승인 처리 중입니다...');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amountStr = searchParams.get('amount');

    if (!paymentKey || !orderId || !amountStr) {
      setMessage('필수 결제 정보가 없습니다.');
      return;
    }

    const amount = Number(amountStr);

    (async () => {
      try {
        const res = await axios.post(
          `${apiBase}/payments/confirm`,
          {
            paymentKey,
            orderId,
            amount,
          },
          { withCredentials: true },
        );

        console.log('결제 승인 결과:', res.data);
        setMessage('결제가 정상적으로 완료되었습니다.');

        // TODO: 결제 완료 후 이동할 페이지로 보내기
        // router.push('/my/lectures');
      } catch (e: any) {
        console.error(e);
        setMessage('결제 승인 중 오류가 발생했습니다.');
      }
    })();
  }, [searchParams]);

  return (
    <main className="flex flex-col items-center justify-center p-10 gap-4">
      <h1 className="text-2xl font-bold">결제 성공</h1>
      <p>{message}</p>
      <button
        onClick={() => router.push('/')}
        className="px-4 py-2 rounded border"
      >
        홈으로 가기
      </button>
    </main>
  );
}
