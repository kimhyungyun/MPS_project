'use client';

import Link from 'next/link';

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
  const payHref = `/mpspain/mpslecture/payments?packageId=${id}`;

  return (
    <article
      className="
        group relative overflow-hidden rounded-3xl
        border border-slate-200/70 bg-white p-7
        shadow-[0_1px_0_rgba(15,23,42,0.04)]
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(2,6,23,0.10)]
      "
    >
      {/* subtle glow */}
      <div
        className="
          pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full
          bg-gradient-to-br from-indigo-200/55 via-fuchsia-200/25 to-transparent
          blur-2xl opacity-70 transition-opacity
          group-hover:opacity-100
        "
      />

      {/* body */}
      <div className="relative">
        {/* 카드 클릭영역 = 상세 */}
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

          <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-700">
            {name}
          </h2>

          {highlight ? (
            <p className="text-sm font-semibold text-indigo-600">{highlight}</p>
          ) : null}

          <p className="text-[15px] leading-relaxed text-slate-600">{shortDesc}</p>
        </Link>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">패키지 이용권 가격 (VAT 포함)</p>
            <p className="mt-1 text-[26px] font-extrabold tracking-tight text-slate-900">
              {Number(price).toLocaleString()}
              <span className="ml-1 text-base font-bold text-slate-500">원</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={detailHref}
              className="
                inline-flex items-center justify-center rounded-full
                px-5 py-3 text-sm font-semibold
                border border-slate-200 bg-white text-slate-700
                hover:bg-slate-50
              "
            >
              상세보기
            </Link>

            <Link
              href={payHref}
              className="
                inline-flex items-center justify-center rounded-full
                px-5 py-3 text-sm font-semibold text-white
                bg-gradient-to-r from-indigo-600 to-indigo-500
                shadow-[0_10px_25px_rgba(79,70,229,0.25)]
                hover:from-indigo-700 hover:to-indigo-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40
              "
            >
              구매하기
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
