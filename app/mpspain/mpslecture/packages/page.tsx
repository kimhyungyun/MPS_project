import PackageCard from './PackageCard';
import { getUiById } from '../_data/packageUi';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

type Pkg = { id: number; name: string; price: number };

export default async function PackagesPage() {
  const res = await fetch(`${apiBase}/lecture-packages`, { cache: 'no-store' });
  if (!res.ok) throw new Error('패키지 목록 조회 실패');

  const pkgs: Pkg[] = await res.json();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-40 max-w-5xl px-4 py-10 lg:py-12">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase text-indigo-500">MPS 강의 패키지</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">패키지 리스트</h1>
          <p className="mt-2 text-sm text-slate-600">
            패키지를 선택하고 상세 내용을 확인한 후 구매하세요.
          </p>
        </header>

        <section className="grid gap-5">
          {pkgs.map((p) => {
            const ui = getUiById(p.id);
            return (
              <PackageCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                badge={ui?.badge ?? 'MPS PACKAGE'}
                highlight={ui?.highlight}
                shortDesc={ui?.shortDesc ?? '설명 준비 중'}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}
