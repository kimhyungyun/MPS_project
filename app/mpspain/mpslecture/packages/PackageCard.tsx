// app/mpspain/mpslecture/packages/PackageCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import PurchaseGateLink from '../_components/PurchaseGateLink';

type Props = {
  id: number;
  name: string;
  price: number;
  badge: string;
  highlight?: string;
  shortDesc: string;
};

function formatPrice(price: number) {
  const n = Number(price);
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString();
}

/**
 * ✅ "한 눈에 이해"용 칩(혜택/대상/특징)
 * - 서버에서 따로 내려주는 값이 없으면 name/id 기준으로 기본 프리셋을 제공
 * - 나중에 DB에 필드 추가되면 chips를 props로 받아서 바꾸면 됨
 */
function getChips(id: number, name: string) {
  const base = [
    '수강권 즉시 활성화',
    '모바일/PC 지원',
    '결제 후 바로 수강',
  ];

  // 프로젝트 상황에 맞춰 임의 예시
  if (String(name).includes('A + B + C') || id === 4) {
    return ['올인원 패키지', '추천', ...base];
  }
  if (String(name).includes('A') || id === 1) {
    return ['기초/핵심', ...base];
  }
  if (String(name).includes('B') || id === 2) {
    return ['실전/응용', ...base];
  }
  if (String(name).includes('C') || id === 3) {
    return ['심화/정리', ...base];
  }
  return base;
}

export default function PackageCard({
  id,
  name,
  price,
  badge,
  highlight,
  shortDesc,
}: Props) {
  const detailHref = `/mpspain/mpslecture/packages/${id}`;
  const chips = getChips(id, name);

  return (
    <article
      className="
        group relative overflow-hidden rounded-3xl
        border border-slate-200/70 bg-white
        shadow-[0_1px_0_rgba(15,23,42,0.04)]
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(2,6,23,0.10)]
      "
    >
      {/* 은은한 글로우 */}
      <div
        className="
          pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full
          bg-gradient-to-br from-indigo-200/55 via-fuchsia-200/25 to-transparent
          blur-2xl opacity-70 transition-opacity
          group-hover:opacity-100
        "
      />

      {/* ✅ 썸네일 영역 */}
      <Link href={detailHref} className="block">
        <div className="relative">
          {/* 이미지 박스 */}
          <div className="relative h-44 w-full bg-slate-100 sm:h-48">
            <Image
              src="/상품이미지테스트.jpg"
              alt={`${name} 썸네일`}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
              priority={id === 1} // 첫 카드만 우선 로드
            />
            {/* 상단 그라데이션(텍스트 가독성) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-white/0" />

            {/* 배지 */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span
                className="
                  inline-flex items-center rounded-full
                  bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-700
                  ring-1 ring-indigo-100 backdrop-blur
                "
              >
                {badge}
              </span>

              {/* 스몰 라벨 */}
              <span className="hidden sm:inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                NEW
              </span>
            </div>

            {/* 우측 상단 링크 힌트 */}
            <span className="absolute right-4 top-4 hidden rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 backdrop-blur sm:inline">
              자세히 보기 →
            </span>
          </div>

          {/* ✅ 텍스트 컨텐츠 */}
          <div className="relative p-5 sm:p-7">
            <h2 className="truncate text-[20px] font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-700 sm:text-[22px]">
              {name}
            </h2>

            {highlight ? (
              <p className="mt-1 truncate text-sm font-semibold text-indigo-600">
                {highlight}
              </p>
            ) : null}

            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-slate-600">
              {shortDesc}
            </p>

            {/* ✅ 칩(한눈에 이해) */}
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="
                    inline-flex items-center rounded-full
                    bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700
                    ring-1 ring-slate-200
                  "
                >
                  {c}
                </span>
              ))}
            </div>

            {/* ✅ 가격 + 버튼 */}
            <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">패키지 이용권 가격 (VAT 포함)</p>
                <p className="mt-1 whitespace-nowrap text-[24px] font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
                  {formatPrice(price)}
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
        </div>
      </Link>
    </article>
  );
}
