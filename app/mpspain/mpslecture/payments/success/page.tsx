// app/mpspain/mpslecture/payments/success/page.tsx
import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';


export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center p-10 gap-4">
          <h1 className="text-2xl font-bold">결제 성공</h1>
          <p>결제 승인 처리 중입니다...</p>
        </main>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
