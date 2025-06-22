  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';

  interface Member {
    mb_id: string;
    mb_name: string;
    mb_nick: string;
    mb_email: string;
    mb_hp: string;
    mb_point: number;
    mb_level: number;
  }

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

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || user.mb_level < 8) {
        router.push('/');
        return;
      }
      fetchMembers();
    }, [currentPage]);

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/admin/members?page=${currentPage}${search ? `&search=${search}` : ''}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMembers(data.data.members);
          setTotalMembers(data.data.total);
        } else {
          setError('회원 목록을 불러오는데 실패했습니다.');
        }
      } catch {
        setError('서버 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const handleLevelChange = async (mb_id: string, newLevel: number) => {
      try {
        const response = await fetch(`${API_URL}/api/admin/members/${mb_id}/level`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({ mb_level: newLevel }),
        });

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

    const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSearching(true);
      setCurrentPage(1);
      await fetchMembers();
      setIsSearching(false);
    };

    const totalPages = Math.ceil(totalMembers / 10);
    const pageGroupSize = 10;
    const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
    const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    return (
      <div className="min-h-screen bg-gray-50 py-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">회원 관리</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">{success}</div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['아이디', '이름', '닉네임', '이메일', '휴대폰', '포인트', '레벨'].map((head) => (
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
                    <td colSpan={7} className="px-6 py-4 text-center">로딩 중...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
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
                      <td className="px-6 py-4 text-sm">{member.mb_hp}</td>
                      <td className="px-6 py-4 text-sm">{member.mb_point}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={member.mb_level}
                          onChange={(e) => handleLevelChange(member.mb_id, Number(e.target.value))}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
