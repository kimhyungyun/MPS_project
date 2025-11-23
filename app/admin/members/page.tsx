'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_school: string; // ✅ 학교
  mb_addr1: string; // ✅ 기본주소
  mb_addr2: string; // ✅ 상세주소
  mb_hp: string;
  mb_level: number;
}

type SortKey = 'name' | 'latest';
type SortOrder = 'asc' | 'desc';

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const pageGroupSize = 10;
  const totalPages = Math.ceil(totalMembers / 10);
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // 페이지 내 정렬(백엔드가 정렬 안 해줄 때 대비용)
  const sortMembers = (
    list: Member[],
    key: SortKey | null,
    order: SortOrder,
  ) => {
    if (!key) return list;

    const sorted = [...list].sort((a, b) => {
      let comp = 0;

      if (key === 'name') {
        comp = a.mb_name.localeCompare(b.mb_name);
      } else if (key === 'latest') {
        // 최신순: mb_id 기준 (필요하면 created_at 등으로 교체)
        comp = a.mb_id.localeCompare(b.mb_id);
      }

      return order === 'asc' ? comp : -comp;
    });

    return sorted;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.mb_level < 8) {
      router.push('/');
      return;
    }

    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortKey, sortOrder, search]);

  const fetchMembers = async () => {
    try {
      if (isSearching === false) {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      if (search) params.set('search', search);
      if (sortKey) {
        params.set('sortKey', sortKey);
        params.set('sortOrder', sortOrder);
      }

      const response = await fetch(
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

      if (!response.ok) {
        let body: any = null;
        try {
          body = await response.json();
        } catch {}

        console.error(
          '[회원 목록 API 실패]',
          'status =',
          response.status,
          'body =',
          body,
        );

        setError(
          body?.message
            ? `회원 목록 조회 실패: ${body.message}`
            : '회원 목록을 불러오는데 실패했습니다.',
        );
        return;
      }

      const data = await response.json();
      const rawMembers: Member[] = data.data.members;
      setTotalMembers(data.data.total);

      // 백엔드가 정렬해주더라도 문제 없음. 정렬 안 해주면 여기서라도 맞춰줌.
      const processed = sortMembers(rawMembers, sortKey, sortOrder);
      setMembers(processed);
    } catch (err) {
      console.error('🔥 getMembers() 오류 발생:', err);
      setError('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleLevelChange = async (mb_id: string, newLevel: number) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `${API_URL}/api/admin/members/${mb_id}/level`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({ mb_level: newLevel }),
        },
      );

      if (response.ok) {
        setSuccess('회원 레벨이 성공적으로 변경되었습니다.');
        fetchMembers();
      } else {
        setError('회원 레벨 변경에 실패했습니다.');
      }
    } catch {
      setError('서버 오류가 발생했습니다.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1); // 검색 시 항상 1페이지로
  };

  // 정렬 버튼 클릭: 없음 → asc → desc → 없음
  const handleSortClick = (key: SortKey) => {
    setCurrentPage(1); // 정렬 변경 시 1페이지로 이동

    if (sortKey !== key) {
      // 다른 정렬 키로 변경될 때: 기본 방향
      const initialOrder: SortOrder = key === 'latest' ? 'desc' : 'asc';
      setSortKey(key);
      setSortOrder(initialOrder);
      return;
    }

    // 같은 키를 다시 클릭했을 때: asc -> desc -> 정렬 해제
    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortKey(null); // 정렬 해제
      setSortOrder('asc'); // 기본값으로 리셋
    }
  };

  const handlePrevGroup = () => {
    if (startPage === 1 || loading) return;
    setCurrentPage(Math.max(startPage - pageGroupSize, 1));
  };

  const handleNextGroup = () => {
    if (endPage === totalPages || loading) return;
    setCurrentPage(Math.min(startPage + pageGroupSize, totalPages));
  };

  const renderSortLabel = (label: string, key: SortKey) => {
    if (sortKey !== key) return label;
    return `${label} ${sortOrder === 'asc' ? '▲' : '▼'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">회원 관리</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* 정렬 버튼 */}
        <div className="flex justify-end mb-4 gap-2">
          <span className="text-sm text-gray-600 self-center">정렬:</span>
          <button
            type="button"
            onClick={() => handleSortClick('name')}
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
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
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
              sortKey === 'latest'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {renderSortLabel('최신순', 'latest')}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  '아이디',
                  '이름',
                  '닉네임',
                  '이메일',
                  '학교',
                  '주소',
                  '휴대폰',
                  '레벨',
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    로딩 중...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {search ? '검색 결과가 없습니다.' : '회원이 없습니다.'}
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.mb_id}>
                    <td className="px-6 py-4 text-sm">{member.mb_id}</td>
                    <td className="px-6 py-4 text-sm">{member.mb_name}</td>
                    <td className="px-6 py-4 text-sm">{member.mb_nick}</td>
                    <td className="px-6 py-4 text-sm">{member.mb_email}</td>
                    <td className="px-6 py-4 text-sm">{member.mb_school}</td>
                    <td className="px-6 py-4 text-sm">
                      {[member.mb_addr1, member.mb_addr2]
                        .filter(Boolean)
                        .join(' ')}
                    </td>
                    <td className="px-6 py-4 text-sm">{member.mb_hp}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      {/* 레벨 셀렉트 UI 개선: 가운데 정렬 */}
                      <select
                        value={member.mb_level}
                        onChange={(e) =>
                          handleLevelChange(
                            member.mb_id,
                            Number(e.target.value),
                          )
                        }
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm font-semibold text-center"
                        style={{ textAlignLast: 'center' as any }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <option key={level} value={level} className="text-center">
                            {level}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 검색 */}
        <div className="flex justify-center mb-6">
          <form onSubmit={handleSearch} className="w-[600px]">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="   아이디, 이름, 닉네임 검색"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
              />
              <button
                type="submit"
                disabled={isSearching}
                className={`bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 ${
                  isSearching ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>
          </form>
        </div>

        {/* 페이지네이션: 10개 단위 이동 */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={handlePrevGroup}
                disabled={startPage === 1 || loading}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              {Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={handleNextGroup}
                disabled={endPage === totalPages || loading}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
