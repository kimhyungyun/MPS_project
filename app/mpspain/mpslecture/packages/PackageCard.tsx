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

  // ✅ 카드별 이미지
  imageSrc: string;
  imageAlt?: string;
};

function formatPrice(price: number) {
  const n = Number(price);
  if (!Number.isFinite(n)) return '-';
  return n.toLocaleString();
}

/**
 * ✅ "한 눈에 이해"용 칩(혜택/대상/특징)
 */
function getChips(id: number, name: string): string[] {
  const base = ['수강권 즉시 활성화', '모바일/PC 지원', '결제 후 바로 수강'];

  if (String(name).includes('A + B + C') || id === 4) return ['올인원 패키지', '추천', ...base];
  if (String(name).includes('A') || id === 1) return ['기초/핵심', ...base];
  if (String(name).includes('B') || id === 2) return ['실전/응용', ...base];
  if (String(name).includes('C') || id === 3) return ['심화/정리', ...base];
  return base;
}

export default function PackageCard({
  id,
  name,
  price,
  badge,
  highlight,
  shortDesc,
  imageSrc,
  imageAlt,
}: Props) {
  const detailHref = `/mpspain/mpslecture/packages/${id}`;
  const chips: string[] = getChips(id, name);

  // ✅ 위에서 “보이는 썸네일 높이”는 그대로 유지
  const thumbHeightClass = 'h-44 sm:h-48';

  return (
    <article
      className="
        group relative overflow-hidden rounded-3xl
        border border-slate-200/70
        shadow-[0_1px_0_rgba(15,23,42,0.04)]
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(2,6,23,0.10)]
      "
    >
      {/* ✅ 카드 전체 배경 이미지 */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt ?? `${name} 썸네일`}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
          priority={id === 1}
        />
        {/* 기본 가독성용 오버레이(필요 없으면 지워도 됨) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-white/0" />
      </div>

      {/* 은은한 글로우 */}
      <div
        className="
          pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full
          bg-gradient-to-br from-indigo-200/55 via-fuchsia-200/25 to-transparent
          blur-2xl opacity-70 transition-opacity
          group-hover:opacity-100
        "
      />

      {/* ✅ 구매하기는 항상 오른쪽 아래 고정 (Link 중첩 피하려고 Link 밖에 둠) */}
      <div className="absolute bottom-4 right-4 z-30">
        <PurchaseGateLink
          packageId={id}
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
        </PurchaseGateLink>
      </div>

      {/* ✅ 카드 클릭(상세보기) 영역 */}
      <Link href={detailHref} className="relative block">
        {/* ✅ 썸네일로 보이는 높이 확보용 스페이서 */}
        <div className={`relative ${thumbHeightClass}`}>
          {/* 배지 */}
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
            <span
              className="
                inline-flex items-center rounded-full
                bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-700
                ring-1 ring-indigo-100 backdrop-blur
              "
            >
              {badge}
            </span>

            <span className="hidden sm:inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              NEW
            </span>
          </div>

          <span className="absolute right-4 top-4 z-20 hidden rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 backdrop-blur sm:inline">
            자세히 보기 →
          </span>
        </div>

        {/* ✅ 반대로 적용:
            - 기본: 텍스트 안 보임(이미지가 더 많이 보임)
            - hover: 텍스트 박스가 선명하게 등장(blur 없음)
            - 구매하기 버튼은 위에서 고정이라 계속 보임
        */}
        <div
          className="
            relative z-10
            p-5 sm:p-7
            bg-white
            opacity-0 translate-y-2
            transition-all duration-300 ease-out
            group-hover:opacity-100 group-hover:translate-y-0
          "
        >
          <h2 className="truncate text-[20px] font-extrabold tracking-tight text-slate-900 sm:text-[22px]">
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

          {/* 칩 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.slice(0, 4).map((c: string) => (
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

          {/* 가격 */}
          <div className="mt-5">
            <p className="text-xs text-slate-500">패키지 이용권 가격 (VAT 포함)</p>
            <p className="mt-1 whitespace-nowrap text-[24px] font-extrabold tracking-tight text-slate-900 sm:text-[26px]">
              {formatPrice(price)}
              <span className="ml-1 text-base font-bold text-slate-500">원</span>
            </p>
          </div>

          {/* ✅ 구매하기는 밖에 고정되어 있으니 여기 버튼/링크는 굳이 안 둠 */}
        </div>
      </Link>
    </article>
  );
}
