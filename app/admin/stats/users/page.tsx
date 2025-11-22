'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Range = 'day' | 'week' | 'month';

interface StatItem {
  label: string; // 날짜/주/월 표시용
  count: number;
}

interface UserStatsResponse {
  range: Range;
  signups: StatItem[];
  visits: StatItem[];
  totalSignups: number;
  totalVisits: number;
}

export default function UserStatsPage() {
  const router = useRouter();
  const [range, setRange] = useState<Range>('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchStats = async (selectedRange: Range) => {
    if (!API_URL) {
      console.error('API URL is not defined');
      setError('서버 설정에 문제가 있습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/api/admin/stats/users?range=${selectedRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        console.error('Failed to fetch user stats:', response.status);
        setError('통계 데이터를 불러오는데 실패했습니다.');
        return;
      }

      const data: UserStatsResponse = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 관리자 체크
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.mb_level < 8) {
      router.push('/');
      return;
    }

    fetchStats(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleRangeChange = (newRange: Range) => {
    setRange(newRange);
  };

  const maxSignupCount =
    stats?.signups.length ? Math.max(...stats.signups.map((s) => s.count)) : 0;
  const maxVisitCount =
    stats?.visits.length ? Math.max(...stats.visits.map((s) => s.count)) : 0;

  const rangeLabel = {
    month: '월별',
    week: '주별',
    day: '일별',
  }[range];

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">회원 통계</h1>
            <p className="mt-2 text-sm text-gray-500">
              {rangeLabel} 가입자 수 / 방문자 수 추이를 확인할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>

        {/* 기간 선택 탭 */}
        <div className="inline-flex rounded-md shadow-sm mb-6" role="group">
          {(['month', 'week', 'day'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRangeChange(r)}
              className={`px-4 py-2 text-sm font-medium border ${
                range === r
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } first:rounded-l-md last:rounded-r-md`}
            >
              {r === 'month' && '월별'}
              {r === 'week' && '주별'}
              {r === 'day' && '일별'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-gray-500">통계 데이터를 불러오는 중입니다...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
        ) : !stats ? (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
            통계 데이터가 없습니다.
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  전체 가입자 수
                </h2>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSignups.toLocaleString()}명
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  사이트에 가입한 전체 회원 수
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  전체 방문자 수
                </h2>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVisits.toLocaleString()}명
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  방문 로그 연동 시 실제 방문자 수가 표시됩니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 가입자 수 통계 */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {rangeLabel} 가입자 수
                </h3>
                {stats.signups.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    통계 기간 내 가입자가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {stats.signups.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="w-24 text-xs text-gray-500">
                          {item.label}
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 bg-indigo-500 rounded-full"
                              style={{
                                width:
                                  maxSignupCount === 0
                                    ? '0%'
                                    : `${(item.count / maxSignupCount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-sm text-gray-700">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 방문자 수 통계 */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {rangeLabel} 방문자 수
                </h3>
                {stats.visits.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    방문 로그가 아직 연동되어 있지 않습니다. (현재는 0으로 표시)
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {stats.visits.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="w-24 text-xs text-gray-500">
                          {item.label}
                        </span>
                        <div className="flex-1">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="h-2 bg-emerald-500 rounded-full"
                              style={{
                                width:
                                  maxVisitCount === 0
                                    ? '0%'
                                    : `${(item.count / maxVisitCount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-sm text-gray-700">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
