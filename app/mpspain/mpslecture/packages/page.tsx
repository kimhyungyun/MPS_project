import PackageCard from './PackageCard';
import { getUiById } from '../_data/packageUi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Pkg = { id: number; name: string; price: number };

export default async function PackagesPage() {
  if (!API_URL) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto mt-36 max-w-3xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_12px_40px_rgba(2,6,23,0.06)]">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">설정 오류</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              NEXT_PUBLIC_API_URL 이 설정되어 있지 않습니다. (Vercel Env 확인)
            </p>
          </div>
        </div>
      </main>
    );
  }

  let pkgs: Pkg[] = [];
  let errorMsg: string | null = null;

  try {
    const res = await fetch(`${API_URL}/api/lecture-packages`, { cache: 'no-store' });

    if (!res.ok) {
      errorMsg = `API 응답 오류: ${res.status}`;
    } else {
      pkgs = await res.json();
    }
  } catch (e: any) {
    errorMsg = e?.message ?? 'fetch 실패';
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-28 max-w-5xl px-4 py-10 lg:py-14">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            MPS LECTURE PACKAGES
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            패키지 리스트
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            패키지를 선택하고 상세 내용을 확인한 후 구매하세요.
          </p>
        </header>

        {errorMsg ? (
          <div className="rounded-3xl border border-red-100 bg-red-50/70 p-7 text-sm text-red-800 shadow-[0_10px_35px_rgba(2,6,23,0.04)]">
            <b className="text-red-900">목록 로드 실패</b>
            <div className="mt-2 text-xs text-red-700/80">API_URL: {API_URL}</div>
            <div className="mt-2">{errorMsg}</div>
          </div>
        ) : (
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
        )}
      </div>
    </main>
  );
}
