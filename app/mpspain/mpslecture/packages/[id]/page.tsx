import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUiById } from '../../_data/packageUi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Pkg = { id: number; name: string; price: number };

function PolicySection() {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_12px_40px_rgba(2,6,23,0.06)]">
      <h3 className="text-lg font-extrabold tracking-tight text-slate-900">동영상 강의 규정</h3>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
        <li>온라인 강의의 특성상 구매 후 환불이 불가능합니다.</li>
        <li>동영상 강의는 기기 2대까지만 가능합니다.</li>
        <li>기기 리셋은 문의하면 1회까지만 가능합니다(사유에 따라 제한될 수 있음).</li>
        <li>
          강의 기간은 패키지 1개당 결제한 날 다음날부터 2개월(60일)입니다.
          <br />
          (동영상 시청은 결제 당일부터 가능합니다 / 기간 책정은 익일부터 60일)
        </li>
        <li>동영상 강의 2개 구매 시 2가지 패키지 모두 각 4개월 씩 적용됩니다.</li>
        <li>동영상 강의 3개 구매 시 3가지 패키지 모두 각 6개월 씩 적용됩니다.</li>
        <li>
          강의 1개 구매후 60일이 지나지 않은 시점에서 다른 패키지 구매하시는 경우
          두 패키지 전부 최초 구매 시점에서 120일이 적용됩니다.
        </li>
        <li>강의 1개 구매후 60일이 지난 시점에서 다시 구매하시는 경우에는 적용 안됩니다.</li>
        <li>
          강의 구매자의 경우는 MPS 전주 캠프에 참가하기 위한 정회원 등록시 동영상 강의 구매 금액만큼 차감되어 적용합니다.
          (캠프 참가 환불의 경우에도 동영상 강의 구매 금액만큼은 환불 불가합니다)
        </li>
      </ul>

      <div className="mt-5 text-sm">
        <Link
          href="/mpspain/mpslecture/policy/refund"
          className="font-semibold text-indigo-600 hover:underline"
        >
          환불/취소 정책 페이지 보기
        </Link>
      </div>
    </section>
  );
}

function BusinessFooter() {
  // TODO: 토스 심사용 실제 값으로 교체
  const biz = {
    companyName: 'TODO 상호명',
    ceo: 'TODO 대표자명',
    bizNo: 'TODO 사업자등록번호',
    address: 'TODO 사업장 주소',
    phone: 'TODO 고객센터 전화번호',
    email: 'TODO 이메일',
  };

  return (
    <footer className="mt-10 rounded-3xl border border-slate-200/70 bg-white p-7 text-sm text-slate-700 shadow-[0_12px_40px_rgba(2,6,23,0.06)]">
      <h4 className="text-base font-extrabold tracking-tight text-slate-900">사업자 정보</h4>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <p>상호명: {biz.companyName}</p>
        <p>대표자명: {biz.ceo}</p>
        <p>사업자등록번호: {biz.bizNo}</p>
        <p>고객센터: {biz.phone}</p>
        <p className="md:col-span-2">주소: {biz.address}</p>
        <p className="md:col-span-2">이메일: {biz.email}</p>
      </div>
    </footer>
  );
}

export default async function PackageDetailPage(
  props: { params: Promise<{ id: string }> } // Next 15 타입
) {
  if (!API_URL) return notFound();

  const { id: idStr } = await props.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return notFound();

  const res = await fetch(`${API_URL}/api/lecture-packages`, { cache: 'no-store' });
  if (!res.ok) throw new Error('패키지 조회 실패');

  const pkgs: Pkg[] = await res.json();
  const pkg = pkgs.find((x) => x.id === id);
  if (!pkg) return notFound();

  const ui = getUiById(id);
  const payHref = `/mpspain/mpslecture/payments?packageId=${id}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-24 max-w-5xl px-4 py-10 lg:py-14">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/mpspain/mpslecture/packages"
            className="text-sm font-semibold text-slate-700 hover:underline"
          >
            ← 패키지 리스트
          </Link>

          <Link
            href={payHref}
            className="
              rounded-full px-6 py-3 text-sm font-extrabold text-white
              bg-gradient-to-r from-indigo-600 to-indigo-500
              shadow-[0_10px_25px_rgba(79,70,229,0.25)]
              hover:from-indigo-700 hover:to-indigo-600
            "
          >
            구매하기
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_12px_40px_rgba(2,6,23,0.06)]">
          {/* glow */}
          <div
            className="
              pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full
              bg-gradient-to-br from-indigo-200/55 via-fuchsia-200/25 to-transparent
              blur-2xl opacity-70
            "
          />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              {ui?.badge ?? 'MPS PACKAGE'}
            </p>

            <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {pkg.name}
                </h1>

                {ui?.highlight ? (
                  <p className="text-sm font-semibold text-indigo-600">{ui.highlight}</p>
                ) : null}

                <p className="text-[15px] leading-relaxed text-slate-600">
                  {ui?.description ?? '설명 준비 중'}
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-5 text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Price
                </p>
                <p className="mt-2 text-[28px] font-extrabold tracking-tight text-slate-900">
                  {Number(pkg.price).toLocaleString()}
                  <span className="ml-1 text-base font-bold text-slate-500">원</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  최대 서비스 제공기간: 결제 다음날부터 60일(1개 기준)
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  주요 근육
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {ui?.muscles?.length ? ui.muscles.join(', ') : '해당 없음'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  동영상 강의 내용과 목표
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {ui?.goal ?? '내용 준비 중'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6">
          <PolicySection />
        </div>

        <div className="mt-8">
          <Link
            href={payHref}
            className="
              block w-full rounded-full px-6 py-4 text-center text-sm font-extrabold text-white
              bg-gradient-to-r from-indigo-600 to-indigo-500
              shadow-[0_10px_25px_rgba(79,70,229,0.25)]
              hover:from-indigo-700 hover:to-indigo-600
            "
          >
            구매하기
          </Link>
        </div>

        <BusinessFooter />
      </div>
    </main>
  );
}
