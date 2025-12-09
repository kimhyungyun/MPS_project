import { Suspense } from "react";
import FailPageClient from "./FailPageClient";


export default function FailPage() {
  return (
    <Suspense fallback={
      <main className="flex flex-col items-center justify-center p-10">
        <h1 className="text-xl font-bold">결제 실패</h1>
        <p>정보를 불러오는 중입니다...</p>
      </main>
    }>
      <FailPageClient />
    </Suspense>
  );
}
