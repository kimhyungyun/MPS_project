import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-32 max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">환불/취소 정책</h1>
          <p className="mt-2 text-sm text-slate-600">결제 전 반드시 확인해주세요.</p>
        </header>

        <section className="rounded-3xl border bg-white p-7 text-sm leading-relaxed text-slate-700">
          <h2 className="text-lg font-bold text-slate-900">환불 불가</h2>
          <p className="mt-2">
            온라인 강의(디지털 콘텐츠)의 특성상 결제 완료 후에는 환불이 불가능합니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">이용 제한</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>동영상 강의는 기기 2대까지만 가능합니다.</li>
            <li>기기 리셋은 문의 시 1회까지만 가능합니다(사유에 따라 제한될 수 있음).</li>
          </ul>

          <h2 className="mt-6 text-lg font-bold text-slate-900">서비스 제공기간</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>패키지 1개 기준: 결제 다음날부터 60일(시청은 결제 당일부터 가능)</li>
            <li>2개 구매: 각 4개월 적용 / 3개 구매: 각 6개월 적용</li>
            <li>60일 이내 추가 구매 시 최초 구매 기준으로 120일 적용</li>
          </ul>

          <div className="mt-8">
            <Link
              href="/mpspain/mpslecture/packages"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              패키지 리스트로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
