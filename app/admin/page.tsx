'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  totalPayments: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Admin page - User data:', user);

    if (!user || user.mb_level < 8) {
      console.log('Admin page - Redirecting to home, mb_level:', user.mb_level);
      window.location.href = '/';
      return;
    }

    const fetchStats = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers ?? 0,
            totalPayments: data.totalPayments ?? 0,
          });
        } else {
          console.error('Failed to fetch admin stats:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-base sm:text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          관리자 대시보드
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {/* ✅ 총 회원 수 카드 → 버튼화 */}
          <button
            type="button"
            onClick={() => router.push('/admin/stats/users')}
            className="bg-white overflow-hidden shadow rounded-lg text-left hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      총 회원 수 (통계 보기)
                    </dt>
                    <dd className="text-base sm:text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
              <p className="mt-2 text-[11px] sm:text-xs text-gray-400">
                클릭하면 월/주/일 단위 가입자/방문자 통계를 볼 수 있습니다.
              </p>
            </div>
          </button>

          {/* 총 결제 건수 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      총 결제 건수
                    </dt>
                    <dd className="text-base sm:text-lg font-medium text-gray-900">
                      {stats.totalPayments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
            빠른 작업
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push('/admin/members')}
              className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                회원 관리
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                회원 목록 조회 및 관리
              </p>
            </button>

            <button
              onClick={() => router.push('/admin/lectures')}
              className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                강의 관리
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                강의 등록 및 관리
              </p>
            </button>

            <button
              onClick={() => router.push('/admin/inquiries')}
              className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                문의 관리
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                문의사항 답변 관리
              </p>
            </button>

            <button
              onClick={() => router.push('/admin/authority')}
              className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                기기 관리
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                계정별 등록된 기기 확인 및 초기화
              </p>
            </button>

            {/* <button
              onClick={() => router.push('/admin/videoauthority')}
              className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                동영상 권한 관리
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                회원별 동영상 권한 관리
              </p>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
