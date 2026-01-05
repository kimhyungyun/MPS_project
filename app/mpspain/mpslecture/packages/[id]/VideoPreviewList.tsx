// app/mpspain/mpslecture/packages/[id]/VideoPreviewList.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type LectureType = 'single' | 'packageA' | 'packageB' | 'packageC' | 'packageD' | 'packageE';
type ClassGroup = 'A' | 'B' | 'S';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_folder?: string;
  video_name?: string;
  type: LectureType;
  classGroup: ClassGroup;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

/**
 * ✅ 패키지 id -> 어떤 강의들을 보여줄지 매핑
 * 네 DB/정책에 맞게 여기만 수정하면 됨.
 */
function filterByPackageId(list: Course[], packageId: number): Course[] {
  // 예시 매핑(원하는대로 바꿔)
  // 1=A, 2=B, 3=C, 4=A+B+C 같은 식이면:
  if (packageId === 1) return list.filter((c) => c.classGroup === 'A' || c.type === 'packageA');
  if (packageId === 2) return list.filter((c) => c.classGroup === 'B' || c.type === 'packageB');
  if (packageId === 3) return list.filter((c) => c.type === 'packageC');
  if (packageId === 4)
    return list.filter(
      (c) =>
        c.classGroup === 'A' ||
        c.classGroup === 'B' ||
        c.type === 'packageA' ||
        c.type === 'packageB' ||
        c.type === 'packageC',
    );

  // 기본: 전체 중 일부만
  return list.slice(0, 12);
}

export default function VideoPreviewList({ packageId }: { packageId: number }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const base = normalizeBase(API_BASE_URL);
        if (!base) throw new Error('API_URL 없음');

        // ✅ 리스트만 가져오기: 인증 없이 시도
        const res = await fetch(`${base}/api/lectures`, { cache: 'no-store', credentials: 'include' });
        if (!res.ok) throw new Error(`강의 목록 조회 실패 (${res.status})`);

        const list: Course[] = await res.json();
        setItems(list);
      } catch (e: any) {
        setError(e?.message ?? '강의 목록을 불러오지 못했습니다.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const preview = useMemo(() => filterByPackageId(items, packageId), [items, packageId]);

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_12px_40px_rgba(2,6,23,0.06)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">강의 미리보기 목록</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          🔒 시청 불가
        </span>
      </div>

      <p className="mt-2 truncate text-sm text-slate-600">
        구매 전에는 목록만 확인 가능하며, 클릭/시청은 불가능합니다.
      </p>

      {loading ? (
        <div className="mt-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50/70"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : preview.length === 0 ? (
        <div className="mt-5 text-sm text-slate-600">표시할 강의가 없습니다.</div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <ul className="divide-y divide-slate-200 bg-white">
            {preview.map((c, idx) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {idx + 1}. {c.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">{c.description ?? ''}</p>
                </div>

                {/* ✅ 클릭 불가 "껍데기" 버튼 */}
                <button
                  type="button"
                  disabled
                  className="shrink-0 cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500"
                  title="구매 후 시청 가능합니다"
                >
                  잠김
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
