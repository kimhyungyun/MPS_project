'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  created_at?: string;
  updated_at?: string;
}

interface Member {
  mb_no: number;
  mb_id: string;
  mb_name: string;
  mb_hp: string;
  mb_school: string;
  authorities?: VideoAuthority[];
}

type SortKey = 'name' | 'latest';
type SortOrder = 'asc' | 'desc';

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

type UserDevice = {
  id: number;
  userId: number;
  deviceId: string;
  deviceName?: string;
  createdAt: string;
  lastUsedAt: string;
};

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

export default function MemberDevicePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [authorityFilter, setAuthorityFilter] =
    useState<AuthorityFilter>('all');

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceSaving, setDeviceSaving] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState<string | null>(null);

  const devicePanelRef = useRef<HTMLDivElement | null>(null);

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
        comp = a.mb_no - b.mb_no;
      }

      return order === 'asc' ? comp : -comp;
    });

    return sorted;
  };

  const getAuthorityText = (member: Member) => {
    const authorities = member.authorities ?? [];

    if (authorities.length === 0) {
      return '권한 없음';
    }

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
  }, [currentPage, sortKey, sortOrder, searchQuery, authorityFilter]);

  const fetchMembers = async () => {
    try {
      if (!isSearching) {
        setLoading(true);
      }

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
      const rawMembers: any[] = data.data.members ?? [];

      const normalized: Member[] = rawMembers.map((m, idx) => ({
        mb_no: m.mb_no ?? m.mbNo ?? m.id ?? idx + 1,
        mb_id: m.mb_id,
        mb_name: m.mb_name,
        mb_hp: m.mb_hp,
        mb_school: m.mb_school,
        authorities: m.authorities ?? m.videoAuthorities ?? [],
      }));

      setTotalMembers(data.data.total ?? 0);

      const processed = sortMembers(normalized, sortKey, sortOrder);
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
    setSearchQuery(searchInput.trim());
  };

  const handleAuthorityFilterClick = (value: AuthorityFilter) => {
    setAuthorityFilter(value);
    setCurrentPage(1);
    setSelectedMember(null);
    setDevices([]);
    setDeviceMessage(null);
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

  const handleSelectMember = async (member: Member) => {
    setSelectedMember(member);
    setDeviceMessage(null);
    setDevices([]);

    if (devicePanelRef.current) {
      devicePanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    if (!member.mb_no) return;

    setDeviceLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/devices/${member.mb_no}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('기기 조회 실패', res.status);
        setDeviceMessage('기기 정보를 불러오지 못했습니다.');
        return;
      }

      const data: UserDevice[] = await res.json();

      setDevices(data.slice(0, 2));
    } catch (err) {
      console.error('기기 조회 오류:', err);
      setDeviceMessage('기기 정보를 불러오는데 실패했습니다.');
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleReleaseDevice = async (deviceId: string) => {
    if (!selectedMember) return;

    if (!confirm(`이 기기를 해제할까요? (${deviceId})`)) return;

    setDeviceSaving(true);
    setDeviceMessage(null);

    try {
      const res = await fetch(
        `${API_URL}/api/admin/devices/${selectedMember.mb_no}/${deviceId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!res.ok) {
        console.error('기기 해제 실패', res.status);
        setDeviceMessage('기기 해제에 실패했습니다.');
        return;
      }

      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      setDeviceMessage('기기를 해제했습니다.');
    } catch (err) {
      console.error('기기 해제 오류:', err);
      setDeviceMessage('기기 해제 중 오류가 발생했습니다.');
    } finally {
      setDeviceSaving(false);
    }
  };

  const handleResetDevices = async () => {
    if (!selectedMember) return;

    if (!confirm('이 회원의 모든 기기를 초기화할까요?')) return;

    setDeviceSaving(true);
    setDeviceMessage(null);

    try {
      const res = await fetch(
        `${API_URL}/api/admin/devices/${selectedMember.mb_no}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!res.ok) {
        console.error('전체 기기 초기화 실패', res.status);
        setDeviceMessage('전체 기기 초기화에 실패했습니다.');
        return;
      }

      setDevices([]);
      setDeviceMessage('모든 기기를 초기화했습니다.');
    } catch (err) {
      console.error('전체 기기 초기화 오류:', err);
      setDeviceMessage('전체 기기 초기화 중 오류가 발생했습니다.');
    } finally {
      setDeviceSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 mt-20 sm:mt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          회원 기기 관리
        </h1>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-md text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <div className="mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              권한별 회원 보기
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              선택한 권한을 가진 회원만 조회합니다.
            </p>
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

          <form onSubmit={handleSearch} className="w-full sm:w-[420px]">
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
                disabled={isSearching}
                className={`bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-xs sm:text-sm ${
                  isSearching ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSearching ? '검색 중...' : '검색'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['번호', '아이디', '이름', '보유 권한', '기기'].map(
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
                      colSpan={5}
                      className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500"
                    >
                      로딩 중...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500"
                    >
                      {searchQuery || authorityFilter !== 'all'
                        ? '조회 결과가 없습니다.'
                        : '회원이 없습니다.'}
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
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-center text-gray-700 whitespace-nowrap">
                          {index}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap text-center max-w-[120px] sm:max-w-[160px] truncate">
                          {member.mb_id}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap text-center max-w-[90px] sm:max-w-[120px] truncate">
                          {member.mb_name}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center">
                          <span
                            className={`inline-flex max-w-[220px] truncate items-center justify-center rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-medium ${getAuthorityBadgeClass(
                              member,
                            )}`}
                            title={getAuthorityText(member)}
                          >
                            {getAuthorityText(member)}
                          </span>
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className={`px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium border transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                            }`}
                          >
                            {isSelected ? '선택됨' : '기기 관리'}
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

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center mb-8">
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <button
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
                onClick={handleNextGroup}
                disabled={endPage === totalPages || loading}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </nav>
          </div>
        )}

        <div
          ref={devicePanelRef}
          className="bg-white shadow rounded-lg p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            {selectedMember
              ? `선택한 회원: ${selectedMember.mb_name} (${selectedMember.mb_id})`
              : '회원 선택 후 기기를 관리할 수 있습니다.'}
          </h2>

          {selectedMember && (
            <>
              <div className="mb-4">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-medium ${getAuthorityBadgeClass(
                    selectedMember,
                  )}`}
                >
                  보유 권한: {getAuthorityText(selectedMember)}
                </span>
              </div>

              {deviceMessage && (
                <div className="mb-3 text-xs sm:text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded">
                  {deviceMessage}
                </div>
              )}

              {deviceLoading ? (
                <p className="text-xs sm:text-sm text-gray-500">
                  기기 정보를 불러오는 중...
                </p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-3">
                      등록된 기기 (최대 2대)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1].map((idx) => {
                        const device = devices[idx];

                        return (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 flex flex-col justify-between min-h-[120px]"
                          >
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                                기기 {idx + 1}
                              </h4>

                              {device ? (
                                <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                                  <p>
                                    <span className="font-medium">이름:</span>{' '}
                                    {device.deviceName || '-'}
                                  </p>

                                  <p className="break-all">
                                    <span className="font-medium">ID:</span>{' '}
                                    {device.deviceId}
                                  </p>

                                  <p>
                                    <span className="font-medium">등록:</span>{' '}
                                    {device.createdAt
                                      ? new Date(
                                          device.createdAt,
                                        ).toLocaleString()
                                      : '-'}
                                  </p>

                                  <p>
                                    <span className="font-medium">
                                      최근 사용:
                                    </span>{' '}
                                    {device.lastUsedAt
                                      ? new Date(
                                          device.lastUsedAt,
                                        ).toLocaleString()
                                      : '-'}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm text-gray-400">
                                  등록된 기기가 없습니다.
                                </p>
                              )}
                            </div>

                            <div className="mt-3">
                              {device && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReleaseDevice(device.deviceId)
                                  }
                                  disabled={deviceSaving}
                                  className={`w-full px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 ${
                                    deviceSaving
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                  }`}
                                >
                                  기기 해제
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleResetDevices}
                      disabled={deviceSaving || devices.length === 0}
                      className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 ${
                        deviceSaving || devices.length === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      전체 기기 초기화
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