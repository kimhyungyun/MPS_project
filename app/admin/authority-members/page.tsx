'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ClassGroup = 'A' | 'B' | 'S';

type LectureType =
  | 'single'
  | 'packageA'
  | 'packageB'
  | 'packageC'
  | 'packageD'
  | 'packageE';

type AuthorityFilter =
  | 'all'
  | 'hasAuthority'
  | 'none'
  | 'A'
  | 'B'
  | 'packageA'
  | 'packageB'
  | 'packageC'
  | 'packageD'
  | 'packageE';

type SortKey = 'name' | 'latest';
type SortOrder = 'asc' | 'desc';

interface VideoAuthority {
  id: number;
  userId: number;
  classGroup: ClassGroup | null;
  type: LectureType | null;
}

interface Member {
  mb_no: number;
  mb_id: string;
  mb_name: string;
  mb_hp?: string;
  mb_school?: string;
  authorities?: VideoAuthority[];
}

const CLASS_GROUP_LABELS: Record<ClassGroup, string> = {
  A: '상지반',
  B: '하지반',
  S: 'S',
};

const VIDEO_TYPE_LABELS: Record<LectureType, string> = {
  single: '권한 없음',
  packageA: '패키지 A',
  packageB: '패키지 B',
  packageC: '패키지 C',
  packageD: '패키지 D',
  packageE: '패키지 E',
};

const AUTHORITY_FILTERS: { value: AuthorityFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'hasAuthority', label: '권한 있는 사람' },
  { value: 'none', label: '권한 없는 사람' },
  { value: 'A', label: '상지반' },
  { value: 'B', label: '하지반' },
  { value: 'packageA', label: '패키지 A' },
  { value: 'packageB', label: '패키지 B' },
  { value: 'packageC', label: '패키지 C' },
  { value: 'packageD', label: '패키지 D' },
  { value: 'packageE', label: '패키지 E' },
];

export default function AuthorityMembersPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authorityFilter, setAuthorityFilter] =
    useState<AuthorityFilter>('all');

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  const pageSize = 10;
  const pageGroupSize = 10;

  const totalPages = Math.ceil(totalMembers / pageSize);
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const getAuthorityText = (member: Member) => {
    const authorities = member.authorities ?? [];

    if (authorities.length === 0) return '권한 없음';

    const classGroups = authorities
      .filter((a) => a.classGroup)
      .map((a) => CLASS_GROUP_LABELS[a.classGroup!]);

    const videoTypes = authorities
      .filter((a) => a.type)
      .map((a) => VIDEO_TYPE_LABELS[a.type!]);

    const result = [...classGroups, ...videoTypes].filter(Boolean);

    return result.length > 0 ? result.join(', ') : '권한 없음';
  };

  const getAuthorityBadgeClass = (member: Member) => {
    const authorities = member.authorities ?? [];

    if (authorities.length === 0) {
      return 'bg-gray-100 text-gray-500 border-gray-200';
    }

    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      params.set('page', String(currentPage));
      params.set('pageSize', String(pageSize));

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      if (authorityFilter !== 'all') {
        params.set('authority', authorityFilter);
      }

      if (sortKey) {
        params.set('sortKey', sortKey);
        params.set('sortOrder', sortOrder);
      }

      const res = await fetch(
        `${API_URL}/api/admin/members?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!res.ok) {
        let body: any = null;

        try {
          body = await res.json();
        } catch {}

        setError(
          body?.message
            ? `회원 조회 실패: ${body.message}`
            : '회원 목록을 불러오지 못했습니다.',
        );

        return;
      }

      const data = await res.json();
      const raw = data.data.members ?? [];

      const normalized: Member[] = raw.map((m: any, idx: number) => ({
        mb_no: m.mb_no ?? m.mbNo ?? m.id ?? idx + 1,
        mb_id: m.mb_id,
        mb_name: m.mb_name,
        mb_hp: m.mb_hp,
        mb_school: m.mb_school,
        authorities: m.authorities ?? m.videoAuthorities ?? [],
      }));

      setMembers(normalized);
      setTotalMembers(data.data.total ?? 0);
    } catch (err) {
      console.error(err);
      setError('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');

    if (!stored) {
      router.push('/');
      return;
    }

    let user: any;

    try {
      user = JSON.parse(stored);
    } catch {
      router.push('/');
      return;
    }

    if (!user?.mb_id || typeof user.mb_level !== 'number' || user.mb_level < 8) {
      router.push('/');
      return;
    }

    fetchMembers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, authorityFilter, searchQuery, sortKey, sortOrder]);

  const handleAuthorityFilterClick = (value: AuthorityFilter) => {
    setAuthorityFilter(value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSortClick = (key: SortKey) => {
    setCurrentPage(1);

    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder(key === 'latest' ? 'desc' : 'asc');
      return;
    }

    if (sortOrder === 'asc') {
      setSortOrder('desc');
      return;
    }

    setSortKey(null);
    setSortOrder('asc');
  };

  const renderSortLabel = (label: string, key: SortKey) => {
    if (sortKey !== key) return label;
    return `${label} ${sortOrder === 'asc' ? '▲' : '▼'}`;
  };

  const handlePrevGroup = () => {
    if (startPage === 1 || loading) return;
    setCurrentPage(Math.max(startPage - pageGroupSize, 1));
  };

  const handleNextGroup = () => {
    if (endPage === totalPages || loading) return;
    setCurrentPage(Math.min(startPage + pageGroupSize, totalPages));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 mt-20 sm:mt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            권한별 회원 조회
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            동영상 권한 기준으로 회원을 분류해서 확인할 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-md text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <div className="mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              권한 필터
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {AUTHORITY_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleAuthorityFilterClick(item.value)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                  authorityFilter === item.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">정렬:</span>

            <button
              type="button"
              onClick={() => handleSortClick('name')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                sortKey === 'name'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {renderSortLabel('이름순', 'name')}
            </button>

            <button
              type="button"
              onClick={() => handleSortClick('latest')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                sortKey === 'latest'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {renderSortLabel('최신순', 'latest')}
            </button>
          </div>

          <form onSubmit={handleSearch} className="w-full sm:w-[460px]">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="아이디, 이름, 휴대폰, 학교 검색"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-xs sm:text-sm"
              />

              <button
                type="submit"
                disabled={loading}
                className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-xs sm:text-sm ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                검색
              </button>

              {(searchQuery || searchInput) && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  disabled={loading}
                  className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-xs sm:text-sm"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mb-3 text-xs sm:text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{totalMembers}</span>명
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['번호', '아이디', '이름', '휴대폰', '학교', '보유 권한'].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[11px] sm:text-xs font-semibold text-gray-600 tracking-wider whitespace-nowrap"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 sm:px-6 py-6 text-center text-xs sm:text-sm text-gray-500"
                    >
                      회원 목록을 불러오는 중...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 sm:px-6 py-6 text-center text-xs sm:text-sm text-gray-500"
                    >
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((member, idx) => {
                    const index = (currentPage - 1) * pageSize + (idx + 1);

                    return (
                      <tr key={member.mb_no}>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap">
                          {index}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[120px] sm:max-w-[160px] truncate">
                          {member.mb_id}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[90px] sm:max-w-[120px] truncate">
                          {member.mb_name}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[130px] truncate">
                          {member.mb_hp || '-'}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[150px] truncate">
                          {member.mb_school || '-'}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center">
                          <span
                            title={getAuthorityText(member)}
                            className={`inline-flex max-w-[260px] truncate items-center justify-center rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-medium ${getAuthorityBadgeClass(
                              member,
                            )}`}
                          >
                            {getAuthorityText(member)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center mb-8">
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handlePrevGroup}
                disabled={startPage === 1 || loading}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>

              {Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i,
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={handleNextGroup}
                disabled={endPage === totalPages || loading}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}