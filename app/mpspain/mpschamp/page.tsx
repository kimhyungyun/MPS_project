'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { noticeService, Notice } from '@/app/services/noticeService';

// 🔧 날짜 포맷 변환 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const MpsChamp = () => {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check user authentication
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        if (!userData) {
          router.push('/form/login');
          return;
        }

        // Fetch notices from API
        const fetchedNotices = await noticeService.getNotices();
        setNotices(fetchedNotices);
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // If user is not authenticated, don't render the page
  if (!user) {
    return null;
  }

  // 중요 → 날짜순 정렬
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isImportant !== b.isImportant) {
      return b.isImportant ? 1 : -1;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleNoticeClick = (noticeId: number) => {
    router.push(`/mpspain/mpschamp/${noticeId}`);
  };

  const handleCreateNotice = () => {
    if (user.mb_level < 8) {
      alert('관리자만 공지사항을 작성할 수 있습니다.');
      return;
    }
    router.push('/mpspain/mpschamp/create');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gray-100 mt-10">
      {/* 상단 타이틀 & 버튼 */}
      <div className="w-full flex justify-between items-center border-b border-gray-300 pb-6 mb-8 mt-30">
        <div className="flex items-center gap-2">
          <svg 
            className="w-8 h-8 text-blue-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <span className="text-2xl font-bold text-gray-800">공지사항</span>
        </div>
        {user.mb_level >= 8 && (
          <button
            onClick={handleCreateNotice}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            글쓰기
          </button>
        )}
      </div>
    
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* 게시판 헤더 */}
        <div className="grid grid-cols-12 gap-4 border-b border-gray-200 pb-3 mb-4">
          <div className="col-span-1 text-center text-sm font-semibold text-gray-600">번호</div>
          <div className="col-span-7 text-center text-sm font-semibold text-gray-600">제목</div>
          <div className="col-span-2 text-center text-sm font-semibold text-gray-600">작성일</div>
          <div className="col-span-2 text-center text-sm font-semibold text-gray-600">작성자</div>
        </div>

        {sortedNotices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">등록된 공지사항이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {sortedNotices.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleNoticeClick(item.id)}
                className="grid grid-cols-12 gap-4 py-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-100"
              >
                <div className="col-span-1 text-center text-sm text-gray-600">
                  {sortedNotices.length - index}
                </div>
                <div className="col-span-7 text-left">
                  <div className="flex items-center gap-2">
                    {item.isImportant && (
                      <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded">
                        중요
                      </span>
                    )}
                    <span className="text-gray-800">{item.title}</span>
                    {item.attachments && item.attachments.length > 0 && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm text-gray-500">
                  {formatDate(item.date)}
                </div>
                <div className="col-span-2 text-center text-sm text-gray-500">
                  {item.user?.mb_name || '관리자'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MpsChamp;
