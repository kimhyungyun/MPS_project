'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Notice {
  id: number;
  label: string;
  title: string;
  desc: string;
  content: string;
  date: string;
  isImportant: boolean;
  author: string;
  views: number;
  image?: string;
  attachments?: { name: string; url: string; size?: string }[];
}

const NoticeDetail = () => {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string); // ✅ 안전하게 타입 단언

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // TODO: 실제 인증 로직 필요

  useEffect(() => {
    const fetchNotice = async () => {
      // Get notices from localStorage
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      const foundNotice = notices.find((notice: Notice) => notice.id === id);
      
      if (foundNotice) {
        setNotice(foundNotice);
      } else {
        // If notice not found, redirect to list page
        router.push('/mpspain/mpschamp');
      }
    };

    fetchNotice();
  }, [id, router]);

  const handleEdit = () => {
    router.push(`/mpspain/mpschamp/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 공지를 삭제하시겠습니까?')) {
      // Get notices from localStorage
      const notices = JSON.parse(localStorage.getItem('notices') || '[]');
      // Remove the notice with matching id
      const updatedNotices = notices.filter((notice: Notice) => notice.id !== id);
      // Save updated notices back to localStorage
      localStorage.setItem('notices', JSON.stringify(updatedNotices));
      // Navigate back to list
      router.push('/mpspain/mpschamp');
    }
  };

  if (!notice) return <div>Loading...</div>;

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gradient-to-b from-gray-50 to-gray-100 mt-20">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* 헤더 */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${
                  notice.isImportant ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600'
                }`}>
                  {notice.label}
                </span>
                {notice.isImportant && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-sm">
                    중요
                  </span>
                )}
              </div>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-400">제목</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{notice.title}</h1>
            </div>
            {isAdmin && (
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{notice.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{notice.date.slice(0, 4) + '.' + notice.date.slice(4)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>조회 {notice.views}</span>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="mb-12">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-400">내용</span>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-sm border border-gray-100">
            {notice.image && (
              <div className="mb-6">
                <Image
                  src={notice.image}
                  alt="공지사항 이미지"
                  width={800}
                  height={400}
                  className="rounded-lg shadow-md w-full object-cover"
                  priority
                />
              </div>
            )}
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">{notice.content}</p>
          </div>
        </div>

        {/* 첨부파일 */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <div className="mb-4">
              <span className="text-sm font-medium text-gray-400">첨부파일</span>
            </div>
            <div className="space-y-3">
              {notice.attachments.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-gray-100 hover:to-gray-50 transition-all duration-200 shadow-sm border border-gray-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{file.name}</span>
                  </div>
                  {file.size && (
                    <span className="text-sm text-gray-500">{file.size}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 목록으로 돌아가기 버튼 */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push('/mpspain/mpschamp')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-10 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm text-lg font-medium"
          >
            목록으로
          </button>
        </div>
      </div>
    </section>
  );
};

export default NoticeDetail;
