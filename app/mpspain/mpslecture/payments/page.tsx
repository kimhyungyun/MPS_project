// app/mpspain/mpslecture/payments/page.tsx
import { Suspense } from 'react';
import PaymentsPageClient from './PaymentsPageClient';

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center p-10">
          <h1 className="text-xl font-bold">결제 페이지</h1>
          <p>결제 정보를 불러오는 중입니다...</p>
        </main>
      }
    >
      <PaymentsPageClient />
    </Suspense>
  );
}
