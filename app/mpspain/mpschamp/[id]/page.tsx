'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { noticeService, Notice } from '@/app/services/noticeService';
import styles from '../create/CreateNotice.module.css';
import { getPresignedDownloadUrl } from '@/app/services/fileUpload';

const NoticeDetail = () => {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        const fetchedNotice = await noticeService.getNotice(id);
        setNotice(fetchedNotice);
      } catch (error) {
        console.error('Error fetching notice:', error);
        router.push('/mpspain/mpschamp');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleEdit = () => {
    router.push(`/mpspain/mpschamp/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공지를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);

    try {
      await noticeService.deleteNotice(id);
      router.push('/mpspain/mpschamp');
    } catch (error) {
      console.error('Error deleting notice:', error);
      alert('공지사항 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent, file: any) => {
    e.preventDefault();

    try {
      // DB에는 file.fileUrl 에 S3 key 가 저장되어 있다고 가정
      const url = await getPresignedDownloadUrl(file.fileUrl);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!notice) {
    return <div>공지사항을 찾을 수 없습니다.</div>;
  }

  const isAdmin = user?.mb_level >= 8;
  const isWriter = user?.id === (notice as any).writer_id;

  const createdAtValue =
    (notice as any).created_at ?? (notice as any).date ?? null;
  const createdAtText = createdAtValue
    ? new Date(createdAtValue).toLocaleDateString()
    : '';

  const isImportant =
    (notice as any).isImportant ?? (notice as any).is_important ?? false;

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gradient-to-b from-gray-50 to-gray-100 mt-20 pt-20">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* 헤더 */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm">
                  공지
                </span>
                {isImportant && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-sm">
                    중요
                  </span>
                )}
              </div>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-400">제목</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                {notice.title}
              </h1>
            </div>
            {(isAdmin || isWriter) && (
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{(notice as any).user?.mb_name || '관리자'}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="flex items-center gap-2">
                {isImportant && (
                  <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded">
                    중요
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {createdAtText || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className={`${styles.tiptap} prose max-w-none mb-8`}>
          <div dangerouslySetInnerHTML={{ __html: notice.content }} />
        </div>

        {/* 첨부파일 */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              첨부파일
            </h3>
            <div className="space-y-2">
              {notice.attachments.map((file: any) => (
                <a
                  key={file.id}
                  href="#"
                  onClick={(e) => handleDownload(e, file)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span>{file.fileName}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NoticeDetail;
