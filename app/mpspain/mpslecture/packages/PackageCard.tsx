// app/mpspain/mpslecture/packages/PackageCard.tsx
'use client';

import Link from 'next/link';
import PurchaseGateLink from '../_components/PurchaseGateLink';


type Props = {
  id: number;
  name: string;
  price: number;
  badge: string;
  highlight?: string;
  shortDesc: string;
};

export default function PackageCard({ id, name, price, badge, highlight, shortDesc }: Props) {
  const detailHref = `/mpspain/mpslecture/packages/${id}`;

  return (
    <article
      className="
        group relative overflow-hidden rounded-3xl
        border border-slate-200/70 bg-white
        p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(2,6,23,0.10)]
        sm:p-7
      "
    >
      <div
        className="
          pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full
          bg-gradient-to-br from-indigo-200/55 via-fuchsia-200/25 to-transparent
          blur-2xl opacity-70 transition-opacity
          group-hover:opacity-100
        "
      />

      <div className="relative">
        <Link href={detailHref} className="block space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p
              className="
                inline-flex items-center rounded-full
                bg-indigo-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-700
                ring-1 ring-indigo-100
              "
            >
              {badge}
            </p>

            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">
              자세히 보기 →
            </span>
          </div>

          <h2 className="truncate text-[20px] font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-700 sm:text-[22px]">
            {name}
          </h2>

          {highlight ? (
            <p className="truncate text-sm font-semibold text-indigo-600">{highlight}</p>
          ) : null}

          <p className="truncate text-[15px] leading-relaxed text-slate-600">{shortDesc}</p>
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">패키지 이용권 가격 (VAT 포함)</p>
            <p className="mt-1 whitespace-nowrap text-[24px] font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
              {Number(price).toLocaleString()}
              <span className="ml-1 text-base font-bold text-slate-500">원</span>
            </p>
          </div>

          <div className="flex gap-2 sm:shrink-0">
            <Link
              href={detailHref}
              className="
                inline-flex flex-1 items-center justify-center rounded-full
                px-4 py-3 text-sm font-semibold
                border border-slate-200 bg-white text-slate-700
                hover:bg-slate-50
                sm:flex-none sm:px-5
              "
            >
              상세보기
            </Link>

            {/* ✅ 구매하기: 로그인 체크 후 이동 */}
            <PurchaseGateLink
              packageId={id}
              className="
                inline-flex flex-1 items-center justify-center rounded-full
                px-4 py-3 text-sm font-semibold text-white
                bg-gradient-to-r from-indigo-600 to-indigo-500
                shadow-[0_10px_25px_rgba(79,70,229,0.25)]
                hover:from-indigo-700 hover:to-indigo-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40
                sm:flex-none sm:px-5
              "
            >
              구매하기
            </PurchaseGateLink>
          </div>
        </div>
      </div>
    </article>
  );
}
