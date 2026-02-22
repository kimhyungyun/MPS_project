'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type PaymentStatus = '' | 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
type SortKey = 'latest' | 'amount';
type SortOrder = 'asc' | 'desc';

interface PaymentItem {
  id: number | string;
  orderId: string;

  buyerName: string;
  buyerPhone: string;

  packageName: string;

  paymentMethod: string;
  paymentMethodLabel?: string;

  paymentStatus: PaymentStatus | string;
  paymentStatusLabel?: string;

  amount: number;

  createdAt: string; // ISO string
  approvedAt?: string | null; // ISO string | null
  receiptUrl?: string | null;

  provider?: string | null;
  mb_id?: string | null;
  lecturePackageId?: number | null;
}

interface ApiResponse {
  success: boolean;
  data: {
    page: number;
    size: number;
    total: number;
    items: PaymentItem[];
  };
}

const statusLabel = (s: PaymentStatus | string) => {
  const map: Record<string, string> = {
    pending: '대기',
    completed: '완료',
    failed: '실패',
    refunded: '환불',
    cancelled: '취소',
  };
  return map[String(s)] ?? String(s);
};

const methodLabel = (m: string) => {
  const map: Record<string, string> = {
    credit_card: '카드',
    bank_transfer: '계좌이체',
    virtual_account: '가상계좌',
    mobile_payment: '휴대폰',
  };
  return map[String(m)] ?? String(m);
};

const formatMoney = (v: number) => new Intl.NumberFormat('ko-KR').format(v);

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR');
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ✅ 입력값 / 실제 검색어 분리 (Submit할 때만 searchQuery가 바뀜)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ 상태 필터(즉시 반영)
  const [status, setStatus] = useState<PaymentStatus>('');

  // ✅ 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // 백엔드 size 파라미터에 맞춤 (기본 20 추천)
  const pageSize = 20;

  // 페이지 그룹(10개 단위 이동)
  const pageGroupSize = 10;
  const totalPages = Math.ceil(totalRows / pageSize);
  const currentPageGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentPageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // ✅ 정렬(토글): 최신순/금액순
  const [sortKey, setSortKey] = useState<SortKey | null>('latest');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortList = (list: PaymentItem[], key: SortKey | null, order: SortOrder) => {
    if (!key) return list;

    const sorted = [...list].sort((a, b) => {
      let comp = 0;

      if (key === 'latest') {
        const at = new Date(a.createdAt).getTime();
        const bt = new Date(b.createdAt).getTime();
        comp = (Number.isNaN(at) ? 0 : at) - (Number.isNaN(bt) ? 0 : bt);
      } else if (key === 'amount') {
        comp = (a.amount ?? 0) - (b.amount ?? 0);
      }

      return order === 'asc' ? comp : -comp;
    });

    return sorted;
  };

  const processedItems = useMemo(() => {
    // 백엔드는 created_at desc로 내려주지만, 프론트에서도 정렬 UX 유지
    return sortList(items, sortKey, sortOrder);
  }, [items, sortKey, sortOrder]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.mb_level < 8) {
      router.push('/');
      return;
    }

    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, status, searchQuery]); // ✅ searchInput 말고 searchQuery만

  const fetchPayments = async () => {
    try {
      if (isSearching === false) setLoading(true);
      setError(null);

      if (!API_URL) {
        setError('NEXT_PUBLIC_API_URL이 설정되어 있지 않습니다.');
        return;
      }

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('size', String(pageSize));
      if (status) params.set('status', status);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`${API_URL}/api/admin/payments?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        let body: any = null;
        try {
          body = await res.json();
        } catch {}

        console.error('[결제 목록 API 실패]', 'status =', res.status, 'body =', body);

        setError(
          body?.message
            ? `결제 목록 조회 실패: ${body.message}`
            : '결제 목록을 불러오는데 실패했습니다.',
        );
        return;
      }

      const data: ApiResponse = await res.json();
      setTotalRows(data.data.total ?? 0);
      setItems(data.data.items ?? []);
    } catch (e) {
      console.error('🔥 fetchPayments() 오류 발생:', e);
      setError('결제 목록을 불러오는데 실패했습니다.');
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

  const handleStatusChange = (v: PaymentStatus) => {
    setCurrentPage(1);
    setStatus(v);
  };

  const handleSortClick = (key: SortKey) => {
    // 정렬 UX는 회원 페이지와 동일: asc -> desc -> 해제
    // 단, payments는 기본이 최신 desc가 자연스러워서 초기값 설정만 다름.
    if (sortKey !== key) {
      const initialOrder: SortOrder = key === 'latest' ? 'desc' : 'desc';
      setSortKey(key);
      setSortOrder(initialOrder);
      return;
    }

    if (sortOrder === 'asc') setSortOrder('desc');
    else if (sortOrder === 'desc') {
      setSortKey(null);
      setSortOrder('asc');
    }
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
      {/* ✅ sticky 하단 검색바 때문에 여백 */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-28">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          결제 현황 관리
        </h1>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* 상단 컨트롤: 상태 필터 + 정렬 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600">상태:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
              className="h-9 rounded-md border border-gray-300 bg-white px-2 text-xs sm:text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            >
              <option value="">전체</option>
              <option value="pending">대기</option>
              <option value="completed">완료</option>
              <option value="failed">실패</option>
              <option value="refunded">환불</option>
              <option value="cancelled">취소</option>
            </select>
          </div>

          {/* 정렬 버튼 */}
          <div className="flex flex-wrap justify-end gap-2">
            <span className="text-xs sm:text-sm text-gray-600 self-center">정렬:</span>
            <button
              type="button"
              onClick={() => handleSortClick('latest')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                sortKey === 'latest'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              {renderSortLabel('최신순', 'latest')}
            </button>
            <button
              type="button"
              onClick={() => handleSortClick('amount')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm border transition-colors ${
                sortKey === 'amount'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              {renderSortLabel('금액순', 'amount')}
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    '번호',
                    '주문번호',
                    '구매자',
                    '휴대폰',
                    '상품(패키지)',
                    '결제수단',
                    '상태',
                    '금액',
                    '결제요청일',
                    '승인일',
                    '영수증',
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap text-[11px] sm:text-xs font-semibold text-gray-600 tracking-wider"
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
                      colSpan={11}
                      className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500"
                    >
                      로딩 중...
                    </td>
                  </tr>
                ) : processedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-3 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500"
                    >
                      {searchQuery || status ? '검색/필터 결과가 없습니다.' : '결제 내역이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  processedItems.map((p, idx) => {
                    const index = (currentPage - 1) * pageSize + (idx + 1);

                    const sLabel = p.paymentStatusLabel ?? statusLabel(p.paymentStatus);
                    const mLabel = p.paymentMethodLabel ?? methodLabel(p.paymentMethod);

                    return (
                      <tr key={String(p.id)}>
                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center text-gray-700 whitespace-nowrap">
                          {index}
                        </td>

                        <td
                          className="px-3 sm:px-6 py-2 sm:py-3 whitespace-nowrap max-w-[170px] sm:max-w-[240px] truncate"
                          title={p.orderId}
                        >
                          {p.orderId}
                        </td>

                        <td
                          className="px-3 sm:px-6 py-2 sm:py-3 whitespace-nowrap max-w-[120px] sm:max-w-[160px] truncate"
                          title={p.buyerName}
                        >
                          {p.buyerName}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 whitespace-nowrap max-w-[120px] sm:max-w-[150px] truncate">
                          {p.buyerPhone || '-'}
                        </td>

                        <td
                          className="px-3 sm:px-6 py-2 sm:py-3 whitespace-nowrap max-w-[220px] sm:max-w-[320px] truncate"
                          title={p.packageName}
                        >
                          {p.packageName}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap">
                          {mLabel}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${
                              String(p.paymentStatus) === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : String(p.paymentStatus) === 'pending'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : String(p.paymentStatus) === 'refunded'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {sLabel}
                          </span>
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-right whitespace-nowrap font-semibold">
                          {formatMoney(p.amount)}원
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap">
                          {formatDateTime(p.createdAt)}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap">
                          {formatDateTime(p.approvedAt ?? null)}
                        </td>

                        <td className="px-3 sm:px-6 py-2 sm:py-3 text-center whitespace-nowrap">
                          {p.receiptUrl ? (
                            <a
                              href={p.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                            >
                              보기
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션: 10개 단위 이동 */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
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
      </div>

      {/* ✅ 검색창을 화면 하단에 sticky 고정 */}
      <div className="sticky bottom-0 z-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <form onSubmit={handleSearch} className="w-full max-w-[700px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="   주문번호, 구매자명, 아이디, 휴대폰, 패키지명 검색"
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

              <div className="mt-2 text-[11px] sm:text-xs text-gray-500">
                * 상태 필터는 즉시 적용, 검색어는 Enter/검색 버튼으로 적용
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}