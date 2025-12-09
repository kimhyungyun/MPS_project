// app/mpspain/mpslecture/payments/PaymentsPageClient.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function PaymentsPageClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // 예: /mpspain/mpslecture/payments?packageId=3 이런 식으로 쓴다고 가정
  const packageIdParam = searchParams.get('packageId');
  const lecturePackageId = packageIdParam ? Number(packageIdParam) : undefined;

  const handlePay = async () => {
    if (!lecturePackageId) {
      alert('packageId가 없습니다. /mpspain/mpslecture/payments?packageId=1 형태로 접근해야 합니다.');
      return;
    }

    try {
      setLoading(true);

      // 1) 서버에 결제 생성 (패키지 기준)
      const orderRes = await axios.post(
        `${apiBase}/payments/order`,
        { lecturePackageId },
        { withCredentials: true },
      );

      const { orderId, amount, title } = orderRes.data;

      // 2) Toss 결제창
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName: title,
        customerName: '홍길동', // 실제 로그인 유저명으로 바꾸면 됨
        successUrl: `${window.location.origin}/mpspain/mpslecture/payments/success`,
        failUrl: `${window.location.origin}/mpspain/mpslecture/payments/fail`,
      });
    } catch (e) {
      console.error(e);
      alert('결제를 시작하는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center gap-4 p-10">
      <h1 className="text-2xl font-bold">결제 페이지</h1>
      <p>lecturePackageId: {lecturePackageId ?? '없음'}</p>
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {loading ? '결제 준비 중...' : '결제하기'}
      </button>
    </main>
  );
}
