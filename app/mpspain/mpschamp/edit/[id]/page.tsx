// app/mpspain/mpschamp/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

import { noticeService, Notice } from '@/app/services/noticeService';
import { uploadFileToServer } from '@/app/services/fileUpload';

import RichTextEditor from '../../create/RichTextEditor';
import AttachmentsUploader from '../../create/AttachmentsUploader';

interface ExistingAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
  attachments: File[]; // 새 첨부파일만
}

const EditNoticePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
    attachments: [],
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 기존 첨부파일
  const [existingAttachments, setExistingAttachments] = useState<
    ExistingAttachment[]
  >([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>(
    [],
  );

  // ───────────────────
  // 1) 초기 데이터 로드
  // ───────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (!userData || !userData.mb_id || !userData.mb_level) {
          alert('로그인이 필요합니다.');
          router.push('/form/login');
          return;
        }

        userData.mb_level = Number(userData.mb_level);
        setUser(userData);

        const notice: Notice = await noticeService.getNotice(id);

        const isAdmin = userData.mb_level >= 8;
        const isWriter = userData.id === (notice as any).writer_id;
        if (!isAdmin && !isWriter) {
          alert('수정 권한이 없습니다.');
          router.push('/mpspain/mpschamp');
          return;
        }

        const isImportant =
          (notice as any).isImportant ??
          (notice as any).is_important ??
          false;

        setForm({
          title: notice.title,
          content: notice.content,
          isImportant,
          attachments: [],
        });

        setExistingAttachments(
          (notice as any).attachments?.map((att: any) => ({
            id: att.id,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
          })) || [],
        );
      } catch (err) {
        console.error('Error fetching notice:', err);
        router.push('/mpspain/mpschamp');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // ───────────────────
  // 2) 기존 첨부 삭제
  // ───────────────────
  const handleRemoveExistingAttachment = (targetId: number) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== targetId));
    setDeletedAttachmentIds((prev) =>
      prev.includes(targetId) ? prev : [...prev, targetId],
    );
  };

  // ───────────────────
  // 3) 저장
  // ───────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!form.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 3-1) 남아 있는 기존 첨부파일 DTO
      const attachmentDtos: {
        id?: number;
        fileName: string;
        fileUrl: string;
        fileSize?: number;
        mimeType?: string;
      }[] = existingAttachments.map((att) => ({
        id: att.id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
      }));

      // 3-2) 새 첨부파일 업로드
      for (const file of form.attachments) {
        const uploaded = await uploadFileToServer(file);
        attachmentDtos.push({
          fileName: uploaded.fileName,
          fileUrl: uploaded.key,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
        });
      }

      // 3-3) 업데이트 호출
      await noticeService.updateNotice(id, {
        title: form.title,
        content: form.content,
        isImportant: form.isImportant,
        attachments: attachmentDtos,
        deleteAttachmentIds: deletedAttachmentIds,
      });

      router.push(`/mpspain/mpschamp/${id}`);
    } catch (error) {
      console.error('Error updating notice:', error);
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            '공지사항 수정 중 오류가 발생했습니다.',
        );
      } else {
        alert('공지사항 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen mt-20">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">
          공지사항 수정
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 제목 */}
          <div className="group">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
              required
            />
          </div>

          {/* 본문 */}
          <RichTextEditor
            value={form.content}
            onChange={(html) =>
              setForm((prev) => ({ ...prev, content: html }))
            }
          />

          {/* 첨부파일 */}
          <div className="flex gap-6 flex-col md:flex-row">
            <div className="flex-1 space-y-3">
              {existingAttachments.length > 0 && (
                <div className="mb-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    기존 첨부파일
                  </p>
                  <ul className="space-y-1">
                    {existingAttachments.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate max-w-[180px]">
                          {file.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveExistingAttachment(file.id)
                          }
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <AttachmentsUploader
                files={form.attachments}
                onChange={(files) =>
                  setForm((prev) => ({ ...prev, attachments: files }))
                }
              />
            </div>
          </div>

          {/* 중요 공지 + 버튼 */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isImportant"
                checked={form.isImportant}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isImportant: e.target.checked,
                  }))
                }
                className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded-md transition-all duration-200"
              />
              <label
                htmlFor="isImportant"
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                중요 공지로 설정
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push(`/mpspain/mpschamp/${id}`)}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-60"
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditNoticePage;
