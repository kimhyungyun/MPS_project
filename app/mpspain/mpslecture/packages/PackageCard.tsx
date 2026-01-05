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
        group rounded-3xl border bg-white p-7
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-300/60
      "
    >
      {/* 클릭 영역: 제목/설명 */}
      <Link href={detailHref} className="block space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{badge}</p>

        <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-700">
          {name}
        </h2>

        {highlight ? (
          <p className="text-sm font-medium text-indigo-600">{highlight}</p>
        ) : null}

        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          {shortDesc}
        </p>
      </Link>

      {/* 하단 가격 + 버튼 */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">패키지 이용권 가격 (VAT 포함)</p>
          <p className="text-2xl font-extrabold text-indigo-600">
            {Number(price).toLocaleString()}원
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={detailHref}
            className="
              inline-flex items-center justify-center rounded-full px-5 py-3
              text-sm font-semibold
              border bg-white text-slate-700
              hover:bg-slate-50
            "
          >
            상세보기
          </Link>

          <Link
            href={payHref}
            className="
              inline-flex items-center justify-center rounded-full px-5 py-3
              text-sm font-semibold
              bg-indigo-600 text-white shadow-md shadow-indigo-300
              hover:bg-indigo-700
            "
          >
            구매하기
          </Link>
        </div>
      </div>
    </article>
  );
}
