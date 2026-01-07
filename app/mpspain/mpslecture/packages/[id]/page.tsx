// app/mpspain/mpslecture/packages/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUiById } from '../../_data/packageUi';
import PurchaseGateLink from '../../_components/PurchaseGateLink';
import VideoPreviewList from './VideoPreviewList';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Pkg = { id: number; name: string; price: number };

function PolicySection() {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_rgba(2,6,23,0.06)] sm:p-7">
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
         <li>
          계정 공유, 타인 이용, 콘텐츠 유출은 금지되며, 위반 시 이용 정지 및 법적 조치가 진행될 수 있습니다.
        </li>
         <li>
          강의 콘텐츠는 저작권 보호 대상이며,녹화·복제·배포·유출 시 민·형사상 책임이 발생할 수 있습니다.
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
  const biz = {
    companyName: '유한회사 경근근막엠피에스',
    ceo: '문대원',
    bizNo: '402-86-04244',
    address: '전북 전주시 완산구 용머리로 34 5층 MPS연구회',
    phone: '010-7942-5854',
    email: 'mdw36900@gmail.com', 
  };

  return (
    <footer className="mt-8 rounded-3xl border border-slate-200/70 bg-white p-6 text-sm text-slate-700 shadow-[0_12px_40px_rgba(2,6,23,0.06)] sm:mt-10 sm:p-7">
      <h4 className="text-base font-extrabold tracking-tight text-slate-900">사업자 정보</h4>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <p className="truncate">상호명: {biz.companyName}</p>
        <p className="truncate">대표자명: {biz.ceo}</p>
        <p className="truncate">사업자등록번호: {biz.bizNo}</p>
        <p className="truncate">고객센터: {biz.phone}</p>
        <p className="md:col-span-2 break-words">주소: {biz.address}</p>
        <p className="md:col-span-2 break-words">이메일: {biz.email}</p>
      </div>
    </footer>
  );
}

export default async function PackageDetailPage(props: { params: Promise<{ id: string }> }) {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto mt-16 max-w-5xl px-4 pb-10 pt-6 sm:mt-24 sm:py-10 lg:py-14">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <Link
            href="/mpspain/mpslecture/packages"
            className="text-sm font-semibold text-slate-700 hover:underline"
          >
            ← 패키지 리스트
          </Link>

          {/* ✅ 구매하기: 로그인 체크 후 이동 */}
          <PurchaseGateLink
            packageId={id}
            className="
              rounded-full px-5 py-3 text-sm font-extrabold text-white
              bg-gradient-to-r from-indigo-600 to-indigo-500
              shadow-[0_10px_25px_rgba(79,70,229,0.25)]
              hover:from-indigo-700 hover:to-indigo-600
              sm:px-6
            "
          >
            구매하기
          </PurchaseGateLink>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_rgba(2,6,23,0.06)] sm:p-7">
          <div
            className="
              pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full
              bg-gradient-to-br from-indigo-200/55 via-fuchsia-200/25 to-transparent
              blur-2xl opacity-70
            "
          />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 sm:text-xs sm:tracking-[0.18em]">
              {ui?.badge ?? 'MPS PACKAGE'}
            </p>

            <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-3">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {pkg.name}
                </h1>

                {ui?.highlight ? (
                  <p className="truncate text-sm font-semibold text-indigo-600">{ui.highlight}</p>
                ) : null}

                <p className="truncate text-[15px] leading-relaxed text-slate-600">
                  {ui?.description ?? '설명 준비 중'}
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-left sm:px-6 sm:py-5 md:text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Price
                </p>
                <p className="mt-2 whitespace-nowrap text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                  {Number(pkg.price).toLocaleString()}
                  <span className="ml-1 text-base font-bold text-slate-500">원</span>
                </p>
                <p className="mt-2 truncate text-xs text-slate-500">
                  최대 서비스 제공기간: 결제 다음날부터 60일(1개 기준)
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  주요 근육
                </p>
                <p className="mt-2 truncate text-sm text-slate-700">
                  {ui?.muscles?.length ? ui.muscles.join(', ') : '패키지 A+B+C 묶음'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  동영상 강의 내용과 목표
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 truncate md:whitespace-normal md:overflow-visible md:text-clip">
                  {ui?.goal ?? '내용 준비 중'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ 강의 목록(보이기만 / 클릭불가) */}
        <div className="mt-6">
          <VideoPreviewList packageId={id} />
        </div>

        <div className="mt-6 grid gap-6">
          <PolicySection />
        </div>

        <div className="mt-8">
          {/* ✅ 아래 구매하기도 게이트 적용 */}
          <PurchaseGateLink
            packageId={id}
            className="
              block w-full rounded-full px-6 py-4 text-center text-sm font-extrabold text-white
              bg-gradient-to-r from-indigo-600 to-indigo-500
              shadow-[0_10px_25px_rgba(79,70,229,0.25)]
              hover:from-indigo-700 hover:to-indigo-600
            "
          >
            구매하기
          </PurchaseGateLink>
        </div>

        <BusinessFooter />
      </div>
    </main>
  );
}
