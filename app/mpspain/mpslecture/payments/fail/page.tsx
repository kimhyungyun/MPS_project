'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <main className="flex flex-col items-center justify-center p-10 gap-4">
      <h1 className="text-2xl font-bold">결제 실패</h1>
      <p>결제가 실패했습니다.</p>
      {code && <p>에러 코드: {code}</p>}
      {message && <p>사유: {message}</p>}
      <button
        onClick={() => router.push('/payments')}
        className="px-4 py-2 rounded border"
      >
        다시 시도하기
      </button>
    </main>
  );
}
