'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  mb_no: number; // 권한 API에 넘길 PK
  mb_id: string;
  mb_name: string;
  mb_hp: string;
  mb_school: string;
}

type SortKey = 'name' | 'latest';
type SortOrder = 'asc' | 'desc';

type ClassGroup = 'A' | 'B' | 'S';
type LectureType =
  | 'single'
  | 'packageA'
  | 'packageB'
  | 'packageC'
  | 'packageD'
  | 'packageE';

interface VideoAuthority {
  id: number;
  userId: number;
  classGroup: ClassGroup | null;
  type: LectureType | null;
}

const CLASS_GROUP_LABELS: Record<ClassGroup, string> = {
  A: 'A반',
  B: 'B반',
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

const PACKAGE_TYPES: LectureType[] = [
  'packageA',
  'packageB',
  'packageC',
  'packageD',
  'packageE',
];

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

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authoritySaving, setAuthoritySaving] = useState(false);
  const [selectedClassGroups, setSelectedClassGroups] = useState<ClassGroup[]>(
    [],
  );
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<LectureType[]>(
    [],
  );
  const [authorityMessage, setAuthorityMessage] = useState<string | null>(null);

  const authorityPanelRef = useRef<HTMLDivElement | null>(null);

  const pageSize = 10;
  const pageGroupSize = 10;
  const totalPages = Math.ceil(totalMembers / pageSize);
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

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

    if (!user.mb_id || typeof user.mb_level !== 'number' || user.mb_level < 8) {
      router.push('/');
      return;
    }

    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortKey, sortOrder, search]);

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
        comp = a.mb_no - b.mb_no;
      }

      return order === 'asc' ? comp : -comp;
    });

    return sorted;
  };

  const fetchMembers = async () => {
    try {
      if (!isSearching) {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('pageSize', String(pageSize));
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
        setError('회원 목록을 불러오는데 실패했습니다.');
        return;
      }

      const data = await response.json();
      const raw = data.data.members as any[];

      const normalized: Member[] = raw.map((m, idx) => ({
        mb_no:
          m.mb_no ??
          m.mbNo ??
          m.id ?? // 백엔드가 id 쓰면 이거
          idx + 1, // 🔙 마지막 fallback (이게 없으면 mb_no 가 undefined 될 수 있음)
        mb_id: m.mb_id,
        mb_name: m.mb_name,
        mb_hp: m.mb_hp,
        mb_school: m.mb_school,
      }));

      setTotalMembers(data.data.total);
      const processed = sortMembers(normalized, sortKey, sortOrder);
      setMembers(processed);
    } catch (e) {
      console.error(e);
      setError('회원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSelectMember = async (member: Member) => {
    setSelectedMember(member);
    setSelectedMemberId(member.mb_no ?? null);

    setAuthorityMessage(null);
    setSelectedClassGroups([]);
    setSelectedVideoTypes([]);

    if (authorityPanelRef.current) {
      authorityPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    if (member.mb_no == null) {
      setAuthorityMessage('회원 번호가 없어 권한을 불러올 수 없습니다.');
      return;
    }

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
        setAuthorityMessage('권한 정보를 불러오지 못했습니다.');
        return;
      }

      const data: VideoAuthority[] = await res.json();

      const cg = data.filter((a) => a.classGroup).map((a) => a.classGroup!);
      const vt = data.filter((a) => a.type).map((a) => a.type!);

      setSelectedClassGroups(cg);
      setSelectedVideoTypes(vt);
    } catch {
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
    setSelectedVideoTypes((prev) => {
      if (vt === 'single') {
        return prev.includes('single') ? [] : ['single'];
      }

      const after = prev.filter((v) => v !== 'single');

      if (after.includes(vt)) return after.filter((v) => v !== vt);

      return [...after, vt];
    });
  };

  const handleSaveAuthority = async () => {
    if (!selectedMember) {
      setAuthorityMessage('회원이 선택되지 않았습니다.');
      return;
    }

    const userId = selectedMember.mb_no;

    if (userId == null) {
      setAuthorityMessage('회원 번호가 없습니다.');
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
          userId,
          classGroups: selectedClassGroups,
          videoTypes: selectedVideoTypes,
        }),
      });

      if (!res.ok) {
        setAuthorityMessage('권한 저장에 실패했습니다.');
        return;
      }

      setAuthorityMessage('권한이 성공적으로 저장되었습니다.');
    } catch {
      setAuthorityMessage('권한 저장 중 오류가 발생했습니다.');
    } finally {
      setAuthoritySaving(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1);
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
    <div className="min-h-screen bg-gray-50 py-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          동영상 권한 관리
        </h1>

        {/* 회원 목록 박스 */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">
                회원 목록을 불러오는 중...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-red-600">
                {error}
              </div>
            ) : (
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
                  {members.map((member, idx) => {
                    const index = (currentPage - 1) * pageSize + (idx + 1);
                    const isSelected = selectedMemberId === member.mb_no;

                    return (
                      <tr
                        key={member.mb_no ?? `${member.mb_id}-${idx}`}
                        className={isSelected ? 'bg-indigo-50/40' : ''}
                      >
                        <td className="px-6 py-4 text-sm text-center">
                          {index}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {member.mb_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {member.mb_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {member.mb_hp}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          {member.mb_school}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
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
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 검색 */}
        <div className="flex justify-center mb-6">
          <form onSubmit={handleSearch} className="w-[600px]">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="   아이디, 이름, 휴대폰, 학교 검색"
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 mb-8 flex justify-center">
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

        {/* 동영상 권한 박스 */}
        <div ref={authorityPanelRef} className="bg-white shadow rounded-lg p-6">
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
                <p className="text-sm text-gray-500">
                  권한 정보를 불러오는 중...
                </p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      캠프강의 권한
                    </h3>
                    <div className="flex gap-4">
                      {(['A', 'B'] as ClassGroup[]).map((cg) => (
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 mb-2">
                      패키지 권한
                    </h3>

                    <div className="mb-3">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedVideoTypes.includes('single')}
                          onChange={() => toggleVideoType('single')}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{VIDEO_TYPE_LABELS.single}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PACKAGE_TYPES.map((vt) => (
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
