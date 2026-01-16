'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  mb_no: number; // 권한 API에 넘길 PK (userId 로 사용)
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

interface UserDevice {
  id: number;
  deviceId: string;
  deviceName?: string;
  createdAt: string;
  lastUsedAt: string;
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

  // ✅ 입력값 / 실제 검색어 분리 (Submit 시에만 searchQuery가 바뀜)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const [authorityLoading, setAuthorityLoading] = useState(false);
  const [authoritySaving, setAuthoritySaving] = useState(false);
  const [selectedClassGroups, setSelectedClassGroups] = useState<ClassGroup[]>([]);
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<LectureType[]>([]);
  const [authorityMessage, setAuthorityMessage] = useState<string | null>(null);

  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceResetting, setDeviceResetting] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState<string | null>(null);

  const authorityPanelRef = useRef<HTMLDivElement | null>(null);

  const pageSize = 10;
  const pageGroupSize = 10;
  const totalPages = Math.ceil(totalMembers / pageSize);
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // -----------------------------
  // 로그인 / 권한 체크 + 목록 가져오기
  // -----------------------------
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
  }, [currentPage, sortKey, sortOrder, searchQuery]); // ✅ searchInput 제거, searchQuery만

  // -----------------------------
  // 회원 목록 가져오기
  // -----------------------------
  const sortMembers = (list: Member[], key: SortKey | null, order: SortOrder) => {
    if (!key) return list;

    const sorted = [...list].sort((a, b) => {
      let comp = 0;

      if (key === 'name') comp = a.mb_name.localeCompare(b.mb_name);
      else if (key === 'latest') comp = a.mb_no - b.mb_no;

      return order === 'asc' ? comp : -comp;
    });

    return sorted;
  };

  const fetchMembers = async () => {
    try {
      if (!isSearching) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('pageSize', String(pageSize));
      if (searchQuery) params.set('search', searchQuery); // ✅ searchQuery 사용
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
        mb_no: m.mb_no ?? m.mbNo ?? m.id ?? idx + 1,
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

  // -----------------------------
  // 회원 선택 + 권한 + 기기 불러오기
  // -----------------------------
  const handleSelectMember = async (member: Member) => {
    setSelectedMember(member);
    setSelectedMemberId(member.mb_no ?? null);

    setAuthorityMessage(null);
    setSelectedClassGroups([]);
    setSelectedVideoTypes([]);
    setDeviceMessage(null);
    setDevices([]);

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

    const userId = member.mb_no;

    // ------- 권한 조회 -------
    setAuthorityLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/video-authorities?userId=${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        setAuthorityMessage('권한 정보를 불러오지 못했습니다.');
      } else {
        const data: VideoAuthority[] = await res.json();

        if (!data || data.length === 0) {
          setSelectedClassGroups([]);
          setSelectedVideoTypes([]);
        } else {
          const cg = data.filter((a) => a.classGroup).map((a) => a.classGroup!) as ClassGroup[];
          const vt = data.filter((a) => a.type).map((a) => a.type!) as LectureType[];

          setSelectedClassGroups(cg);
          setSelectedVideoTypes(vt);
        }
      }
    } catch (err) {
      console.error(err);
      setAuthorityMessage('권한 정보를 불러오는데 실패했습니다.');
    } finally {
      setAuthorityLoading(false);
    }

    // ------- 기기 목록 조회 -------
    setDeviceLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/video-authorities/devices?userId=${userId}`,
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
        setDeviceMessage('기기 정보를 불러오지 못했습니다.');
      } else {
        const data: any[] = await res.json();
        const formatted: UserDevice[] = data.map((d) => ({
          id: d.id,
          deviceId: d.deviceId,
          deviceName: d.deviceName,
          createdAt: d.createdAt ?? d.created_at,
          lastUsedAt: d.lastUsedAt ?? d.lastUsed_at ?? d.lastUsed,
        }));
        setDevices(formatted);
      }
    } catch (err) {
      console.error(err);
      setDeviceMessage('기기 정보를 불러오는데 실패했습니다.');
    } finally {
      setDeviceLoading(false);
    }
  };

  // -----------------------------
  // 체크 박스 토글
  // -----------------------------
  const toggleClassGroup = (cg: ClassGroup) => {
    setSelectedClassGroups((prev) =>
      prev.includes(cg) ? prev.filter((v) => v !== cg) : [...prev, cg],
    );
  };

  const toggleVideoType = (vt: LectureType) => {
    setSelectedVideoTypes((prev) => {
      if (vt === 'single') return prev.includes('single') ? [] : ['single'];

      const after = prev.filter((v) => v !== 'single');
      if (after.includes(vt)) return after.filter((v) => v !== vt);
      return [...after, vt];
    });
  };

  // -----------------------------
  // 권한 저장
  // -----------------------------
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

    const payload = {
      userId,
      classGroups: selectedClassGroups,
      videoTypes: selectedVideoTypes,
    };

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
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setAuthorityMessage('권한 저장에 실패했습니다.');
        return;
      }

      setAuthorityMessage('권한이 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error(err);
      setAuthorityMessage('권한 저장 중 오류가 발생했습니다.');
    } finally {
      setAuthoritySaving(false);
    }
  };

  // -----------------------------
  // 기기 전체 초기화
  // -----------------------------
  const handleResetDevices = async () => {
    if (!selectedMember) return;
    const userId = selectedMember.mb_no;
    if (userId == null) return;

    if (!window.confirm('해당 회원의 등록된 기기를 모두 초기화하시겠습니까?')) return;

    setDeviceResetting(true);
    setDeviceMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/video-authorities/devices/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        setDeviceMessage('기기 초기화에 실패했습니다.');
        return;
      }

      setDevices([]);
      setDeviceMessage('등록된 기기가 모두 초기화되었습니다.');
    } catch (err) {
      console.error(err);
      setDeviceMessage('기기 초기화 중 오류가 발생했습니다.');
    } finally {
      setDeviceResetting(false);
    }
  };

  // -----------------------------
  // 검색/페이지 이동
  // -----------------------------
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setCurrentPage(1);
    setSearchQuery(searchInput.trim()); // ✅ Submit 시에만 실제 검색어 확정
  };

  const handlePrevGroup = () => {
    if (startPage === 1 || loading) return;
    setCurrentPage(Math.max(startPage - pageGroupSize, 1));
  };

  const handleNextGroup = () => {
    if (endPage === totalPages || loading) return;
    setCurrentPage(Math.min(startPage + pageGroupSize, totalPages));
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 mt-20 sm:mt-24">
      {/* ✅ sticky 하단 검색바가 내용 가리는 거 방지 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-28">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          동영상 권한 및 기기 관리
        </h1>

        {/* 회원 목록 박스 */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
                회원 목록을 불러오는 중...
              </div>
            ) : error ? (
              <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-red-600">
                {error}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['번호', '아이디', '이름', '휴대폰', '학교', '권한'].map((head) => (
                      <th
                        key={head}
                        className="px-3 sm:px-6 py-2 sm:py-3 text-center text-[11px] sm:text-xs font-semibold text-gray-600 tracking-wider whitespace-nowrap"
                      >
                        {head}
                      </th>
                    ))}
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
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center">
                          {index}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[120px] sm:max-w-[160px] truncate">
                          {member.mb_id}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[90px] sm:max-w-[120px] truncate">
                          {member.mb_name}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[120px] sm:max-w-[150px] truncate">
                          {member.mb_hp}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap max-w-[120px] sm:max-w-[150px] truncate">
                          {member.mb_school}
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className={`px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium border transition-colors ${
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 mb-8 flex justify-center">
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevGroup}
                disabled={startPage === 1 || loading}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
                (page) => (
                  <button
                    key={page}
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
                ),
              )}
              <button
                onClick={handleNextGroup}
                disabled={endPage === totalPages || loading}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </nav>
          </div>
        )}

        {/* 동영상 권한 + 기기 박스 */}
        <div ref={authorityPanelRef} className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            {selectedMember
              ? `선택한 회원: ${selectedMember.mb_name} (${selectedMember.mb_id})`
              : '회원 선택 후 권한을 관리할 수 있습니다.'}
          </h2>

          {selectedMember && (
            <>
              {authorityMessage && (
                <div className="mb-3 text-xs sm:text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded">
                  {authorityMessage}
                </div>
              )}

              {deviceMessage && (
                <div className="mb-3 text-xs sm:text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
                  {deviceMessage}
                </div>
              )}

              {authorityLoading ? (
                <p className="text-xs sm:text-sm text-gray-500">권한 정보를 불러오는 중...</p>
              ) : (
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">
                      캠프강의 권한
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(['A', 'B'] as ClassGroup[]).map((cg) => (
                        <label key={cg} className="inline-flex items-center gap-2 text-xs sm:text-sm">
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
                    <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">
                      패키지 권한
                    </h3>

                    <div className="mb-3">
                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm">
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
                        <label key={vt} className="inline-flex items-center gap-2 text-xs sm:text-sm">
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
                      className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 ${
                        authoritySaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {authoritySaving ? '저장 중...' : '권한 저장'}
                    </button>
                  </div>

                  {/* 기기 관리 섹션 */}
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">
                      등록된 재생 기기 (최대 2대)
                    </h3>

                    {deviceLoading ? (
                      <p className="text-xs sm:text-sm text-gray-500">기기 정보를 불러오는 중...</p>
                    ) : devices.length === 0 ? (
                      <p className="text-xs sm:text-sm text-gray-500">
                        등록된 기기가 없습니다. (유저가 처음 재생하는 2개의 기기로 자동 등록됩니다.)
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {devices.map((d, index) => (
                          <div
                            key={d.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs sm:text-sm"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {index + 1}번 기기{d.deviceName ? ` - ${d.deviceName}` : ''}
                              </div>
                              <div className="text-[11px] sm:text-xs text-gray-600 break-all">
                                ID: {d.deviceId}
                              </div>
                              <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
                                등록: {d.createdAt && new Date(d.createdAt).toLocaleString()}
                                {' / '}
                                최근 사용: {d.lastUsedAt && new Date(d.lastUsedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleResetDevices}
                        disabled={deviceResetting}
                        className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 ${
                          deviceResetting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deviceResetting ? '초기화 중...' : '기기 전체 초기화'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ 검색창: 화면 하단에 고정 (테이블 높이 바뀌어도 안 흔들림) */}
      <div className="sticky bottom-0 z-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <form onSubmit={handleSearch} className="w-full max-w-[600px] px-1 sm:px-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="   아이디, 이름, 휴대폰, 학교 검색"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 sm:px-4 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className={`bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-indigo-700 text-sm ${
                    isSearching ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSearching ? '검색 중...' : '검색'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
