'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  mb_no: number;      // 🔹 권한 API에 넘길 PK
  mb_id: string;
  mb_name: string;
  mb_hp: string;
  mb_school: string;
}

type SortKey = 'name' | 'latest';
type SortOrder = 'asc' | 'desc';

type ClassGroup = 'A' | 'B' | 'S';
type LectureType = 'single' | 'packageA' | 'packageB' | 'packageC' | 'packageD' | 'packageE';

interface VideoAuthority {
  id: number;
  userId: number;
  classGroup: ClassGroup | null;
  type: LectureType | null;
}

// 화면에 보여줄 라벨 맵
const CLASS_GROUP_LABELS: Record<ClassGroup, string> = {
  A: 'A반',
  B: 'B반',
  S: 'S (패키지 C/D/E)',
};

const VIDEO_TYPE_LABELS: Record<LectureType, string> = {
  single: '단일 강의',
  packageA: '패키지 A (A반)',
  packageB: '패키지 B (B반)',
  packageC: '패키지 C (S-1)',
  packageD: '패키지 D (S-2)',
  packageE: '패키지 E (S-3)',
};

export default function VideoAuthorityPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 선택된 회원 + 권한 상태
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authoritySaving, setAuthoritySaving] = useState(false);
  const [selectedClassGroups, setSelectedClassGroups] = useState<ClassGroup[]>([]);
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<LectureType[]>([]);
  const [authorityMessage, setAuthorityMessage] = useState<string | null>(null);

  const pageSize = 10;
  const pageGroupSize = 10;
  const totalPages = Math.ceil(totalMembers / pageSize);
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

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
        // 최신순: mb_no DESC 기준이라고 가정
        comp = a.mb_no - b.mb_no;
      }

      return order === 'asc' ? comp : -comp;
    });

    return sorted;
  };

  // 관리자 권한 체크 + 목록 가져오기
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
      if (!isSearching) {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('pageSize', String(pageSize)); // 백에서 지원하면 사용
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1);
  };

  const handleSortClick = (key: SortKey) => {
    setCurrentPage(1);

    if (sortKey !== key) {
      const initialOrder: SortOrder = key === 'latest' ? 'desc' : 'asc';
      setSortKey(key);
      setSortOrder(initialOrder);
      return;
    }

    if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortKey(null);
      setSortOrder('asc');
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

  // 🔹 특정 회원 선택 + 권한 로딩
  const handleSelectMember = async (member: Member) => {
    setSelectedMember(member);
    setAuthorityMessage(null);
    setSelectedClassGroups([]);
    setSelectedVideoTypes([]);

    if (!member.mb_no) return;

    setAuthorityLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/video-authorities?userId=${member.mb_no}`,
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
        console.error('권한 조회 실패', res.status);
        setAuthorityMessage('권한 정보를 불러오지 못했습니다.');
        return;
      }

      const data: VideoAuthority[] = await res.json();

      const cg = data
        .filter((a) => a.classGroup)
        .map((a) => a.classGroup as ClassGroup);
      const vt = data
        .filter((a) => a.type)
        .map((a) => a.type as LectureType);

      setSelectedClassGroups(cg);
      setSelectedVideoTypes(vt);
    } catch (err) {
      console.error('권한 조회 오류:', err);
      setAuthorityMessage('권한 정보를 불러오는데 실패했습니다.');
    } finally {
      setAuthorityLoading(false);
    }
  };

  const toggleClassGroup = (cg: ClassGroup) => {
    setSelectedClassGroups((prev) =>
      prev.includes(cg) ? prev.filter((v) => v !== cg) : [...prev, cg],
    );
  };

  const toggleVideoType = (vt: LectureType) => {
    setSelectedVideoTypes((prev) =>
      prev.includes(vt) ? prev.filter((v) => v !== vt) : [...prev, vt],
    );
  };

  const handleSaveAuthority = async () => {
    if (!selectedMember) return;
    if (!selectedMember.mb_no) {
      setAuthorityMessage('회원 ID가 올바르지 않습니다.');
      return;
    }

    setAuthoritySaving(true);
    setAuthorityMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/video-authorities`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedMember.mb_no,
          classGroups: selectedClassGroups,
          videoTypes: selectedVideoTypes,
        }),
      });

      if (!res.ok) {
        console.error('권한 저장 실패', res.status);
        setAuthorityMessage('권한 저장에 실패했습니다.');
        return;
      }

      setAuthorityMessage('권한이 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error('권한 저장 오류:', err);
      setAuthorityMessage('권한 저장 중 오류가 발생했습니다.');
    } finally {
      setAuthoritySaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          동영상 권한 관리
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 정렬 버튼 */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">정렬:</span>
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

          {/* 검색 */}
          <form onSubmit={handleSearch} className="w-[360px]">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="아이디, 이름, 닉네임 검색"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={isSearching}
                className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm ${
                  isSearching ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>
          </form>
        </div>

        {/* 회원 리스트 테이블 */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['번호', '아이디', '이름', '휴대폰', '학교', '권한'].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-6 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider"
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
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      로딩 중...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {search ? '검색 결과가 없습니다.' : '회원이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  members.map((member, idx) => {
                    const index = (currentPage - 1) * pageSize + (idx + 1);
                    const isSelected =
                      selectedMember && selectedMember.mb_no === member.mb_no;

                    return (
                      <tr
                        key={member.mb_no}
                        className={isSelected ? 'bg-indigo-50/40' : ''}
                      >
                        <td className="px-6 py-4 text-sm text-center text-gray-700 whitespace-nowrap">
                          {index}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
                          {member.mb_id}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
                          {member.mb_name}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
                          {member.mb_hp}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
                          {member.mb_school}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {isSelected ? '선택됨' : '권한 관리'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center mb-8">
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

        {/* 🔹 선택한 회원 권한 관리 패널 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMember
              ? `선택한 회원: ${selectedMember.mb_name} (${selectedMember.mb_id})`
              : '회원 선택 후 권한을 관리할 수 있습니다.'}
          </h2>

          {selectedMember && (
            <>
              {authorityMessage && (
                <div className="mb-3 text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded">
                  {authorityMessage}
                </div>
              )}

              {authorityLoading ? (
                <p className="text-sm text-gray-500">권한 정보를 불러오는 중...</p>
              ) : (
                <div className="space-y-6">
                  {/* 반 권한 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      반 권한
                    </h3>
                    <div className="flex gap-4">
                      {(['A', 'B', 'S'] as ClassGroup[]).map((cg) => (
                        <label
                          key={cg}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClassGroups.includes(cg)}
                            onChange={() => toggleClassGroup(cg)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{CLASS_GROUP_LABELS[cg]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 패키지 권한 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      패키지 권한
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          'single',
                          'packageA',
                          'packageB',
                          'packageC',
                          'packageD',
                          'packageE',
                        ] as LectureType[]
                      ).map((vt) => (
                        <label
                          key={vt}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedVideoTypes.includes(vt)}
                            onChange={() => toggleVideoType(vt)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{VIDEO_TYPE_LABELS[vt]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAuthority}
                      disabled={authoritySaving}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 ${
                        authoritySaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {authoritySaving ? '저장 중...' : '권한 저장'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
