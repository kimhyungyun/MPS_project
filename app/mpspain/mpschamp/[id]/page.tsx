// app/mpspain/mpschamp/[id]/NoticeDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { noticeService, Notice } from '@/app/services/noticeService';
import styles from '../create/CreateNotice.module.css';
import { getPresignedDownloadUrl } from '@/app/services/fileUpload';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import FontFamily from '@tiptap/extension-font-family';
import ResizeImage from 'tiptap-extension-resize-image';
import FontSize from '../create/extensions/fontSize';
import AutoShrinkText from '../../components/AutoShrinkText';

// 1순위: NEXT_PUBLIC_FILE_BASE_URL
// 2순위: NEXT_PUBLIC_CLOUDFRONT_DOMAIN
// 3순위: 기본값
const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_BASE_URL ||
  process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN ||
  'https://media.mpspain.co.kr';

const IMAGE_BASE_URL = RAW_BASE_URL.startsWith('http')
  ? RAW_BASE_URL
  : `https://${RAW_BASE_URL}`;

// 🔧 notice.content 안의 모든 <img src="..."> / src='...' 보정
const fixImageSrcInHtml = (html: string) => {
  if (!html || !IMAGE_BASE_URL) return html;

  return html.replace(
    /<img[^>]*src=['"]([^'"]+)['"][^>]*>/gi,
    (tag, src: string) => {
      const trimmed = src.trim();

      // 이미 절대 URL(https/http) 이거나 data: 이면 건드리지 않음
      if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
        return tag;
      }

      // 앞에 / 붙어있으면 제거 ( /notices/… → notices/… )
      let path = trimmed.replace(/^\/+/, '');

      const newSrc = `${IMAGE_BASE_URL}/${path}`;
      return tag.replace(src, newSrc);
    },
  );
};

const NoticeDetail = () => {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tiptap 읽기 전용 에디터 (ResizeImage 포함)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyle,
      FontFamily,
      FontSize,
      Color.configure({ types: ['textStyle'] }),
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'bulletList', 'orderedList'],
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      ImageExt.configure({
        inline: false,
        allowBase64: true,
      }),
      ResizeImage,
      YouTube.configure({
        controls: true,
        nocookie: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    editable: false,
    editorProps: {
      attributes: {
        class: `${styles.tiptap} prose max-w-none`,
      },
    },
    immediatelyRender: false,
  });

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

  // notice 내용이 바뀌면 에디터에 반영 (이미지 src 보정까지 적용)
  useEffect(() => {
    if (!editor || !notice) return;
    const html = fixImageSrcInHtml(notice.content || '');
    editor.commands.setContent(html, false);
  }, [editor, notice]);

  const handleEdit = () => {
    router.push(`/mpspain/mpschamp/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 공지를 삭제하시겠습니까?')) return;

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

  // 첨부파일 다운로드
  const handleDownload = async (
    e: React.MouseEvent,
    file: { fileUrl: string; fileName: string },
  ) => {
    e.preventDefault();

    try {
      // file.fileUrl 에는 S3 key 가 들어있다고 가정
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

  const getFileIcon = (mimeType?: string | null) => {
    if (!mimeType) return '📎';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎬';
    return '📎';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!notice) {
    return <div className="px-4 py-8">공지사항을 찾을 수 없습니다.</div>;
  }

  const isAdmin = user?.mb_level >= 8;
  // 로그인 정보 구조에 따라 여기 비교 필드만 맞춰주면 됨 (예: user.mb_no vs user.id)
  const isWriter = user?.mb_no === notice.userId || user?.id === notice.userId;

  const createdAtText = notice.created_at
    ? new Date(notice.created_at).toLocaleDateString()
    : '';

  const isImportant = (notice as any).is_important ?? notice.is_important;

  // fallback 용(에디터 초기화 전) content
  const contentHtml = fixImageSrcInHtml(notice.content || '');

  return (
    <section className="w-full px-3 sm:px-4 lg:px-24 py-10 sm:py-12 bg-gradient-to-b from-gray-50 to-gray-100 mt-16 sm:mt-20">
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100">
        {/* 헤더 */}
        <div className="border-b border-gray-200 pb-6 sm:pb-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm">
                  공지
                </span>
                {isImportant && (
                  <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-sm">
                    중요
                  </span>
                )}
              </div>
              <div className="mb-1">
                <span className="text-xs sm:text-sm font-medium text-gray-400">
                  제목
                </span>
              </div>
              <div className="min-w-0">
                <AutoShrinkText
                  text={notice.title}
                  maxFontSize={24}
                  minFontSize={16}
                  className="font-bold text-gray-800 tracking-tight"
                />
              </div>
            </div>
            {(isAdmin || isWriter) && (
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm text-sm"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 text-sm"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
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
              <span>{notice.g5_member?.mb_name || '관리자'}</span>
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
                  <span className="px-2 py-1 text-[11px] sm:text-xs font-medium text-red-600 bg-red-100 rounded">
                    중요
                  </span>
                )}
                <span className="text-xs sm:text-sm text-gray-500">
                  {createdAtText || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 - Tiptap 읽기 전용 */}
        <div className="mb-6 sm:mb-8">
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div
              className={`${styles.tiptap} prose max-w-none`}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>

        {/* 첨부파일 */}
        {notice.attachments && notice.attachments.length > 0 && (
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              첨부파일
            </h3>
            <div className="space-y-2">
              {notice.attachments.map((file) => (
                <a
                  key={file.id}
                  href="#"
                  onClick={(e) =>
                    handleDownload(e, {
                      fileUrl: file.fileUrl,
                      fileName: file.fileName,
                    })
                  }
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                >
                  <span>{getFileIcon(file.mimeType)}</span>
                  <span className="break-all">{file.fileName}</span>
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
