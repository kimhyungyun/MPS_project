// app/mpspain/mpslecture/packages/page.tsx
import PackageCard from './PackageCard';
import { getUiById } from '../_data/packageUi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Pkg = { id: number; name: string; price: number };

export default async function PackagesPage() {
  if (!API_URL) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto mt-24 max-w-3xl px-4 py-10 sm:mt-36">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_rgba(2,6,23,0.06)] sm:p-7">
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
              설정 오류
            </h1>
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
      <div className="mx-auto mt-16 max-w-5xl px-4 pb-10 pt-6 sm:mt-28 sm:py-10 lg:py-14">
        <header className="mb-7 text-center sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 sm:text-xs sm:tracking-[0.18em]">
            MPS LECTURE PACKAGES
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
            패키지 리스트
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mt-3">
            패키지를 선택하고 상세 내용을 확인한 후 구매하세요.
          </p>
        </header>

        {errorMsg ? (
          <div className="rounded-3xl border border-red-100 bg-red-50/70 p-6 text-sm text-red-800 shadow-[0_10px_35px_rgba(2,6,23,0.04)] sm:p-7">
            <b className="text-red-900">목록 로드 실패</b>
            <div className="mt-2 text-xs text-red-700/80">API_URL: {API_URL}</div>
            <div className="mt-2 break-words">{errorMsg}</div>
          </div>
        ) : (
          <section className="grid gap-4 sm:gap-5">
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

                  // ✅ 변경: 데스크탑/모바일 이미지 분리
                  imageDesktop={ui?.imageDesktop ?? '/테스트이미지-desktop.jpg'}
                  imageMobile={ui?.imageMobile ?? '/테스트이미지-mobile.jpg'}
                  imageAlt={ui?.imageAlt}
                />
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
