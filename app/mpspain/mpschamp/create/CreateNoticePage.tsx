'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { noticeService } from '@/app/services/noticeService';
import RichTextEditor from './RichTextEditor';
import CoverImageUploader from './CoverImageUploader';
import AttachmentsUploader from './AttachmentsUploader';
import { uploadFileToServer } from '@/app/services/fileUpload';

interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
  image: File | null;    // 왼쪽 “본문 이미지” 박스
  attachments: File[];   // 오른쪽 일반 첨부파일
}

const CreateNoticePage = () => {
  const router = useRouter();

  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
    image: null,
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 로그인 / 권한 체크
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      if (!userData || !userData.mb_id || !userData.mb_level) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        router.push('/form/login');
        return;
      }

      userData.mb_level = Number(userData.mb_level);

      if (userData.mb_level < 8) {
        alert('관리자만 공지사항을 작성할 수 있습니다.');
        router.push('/mpspain/mpschamp');
        return;
      }

      setUser(userData);
    } catch (err) {
      console.error('Error parsing user data:', err);
      alert('사용자 정보를 불러오는 중 오류가 발생했습니다. 다시 로그인해주세요.');
      router.push('/form/login');
    }
  }, [router]);

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

    if (!user || !user.mb_id || !user.mb_level || user.mb_level < 8) {
      alert('관리자만 공지사항을 작성할 수 있습니다.');
      router.push('/mpspain/mpschamp');
      return;
    }

    setIsSubmitting(true);

    try {
      // 🔥 1) 첨부파일 payload 구성
      type AttachmentReq = {
        fileName: string;
        fileUrl: string;      // S3 key
        fileSize?: number;
        mimeType?: string;
      };

      const attachmentsPayload: AttachmentReq[] = [];

      // 1-1) 왼쪽 “본문 이미지”도 첨부파일로 취급 (이미지 다운로드 전용)
      if (form.image) {
        const uploaded = await uploadFileToServer(form.image);
        attachmentsPayload.push({
          fileName: uploaded.fileName,
          fileUrl: uploaded.key,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
        });
      }

      // 1-2) 오른쪽 일반 첨부파일들
      for (const file of form.attachments) {
        const uploaded = await uploadFileToServer(file);
        attachmentsPayload.push({
          fileName: uploaded.fileName,
          fileUrl: uploaded.key,
          fileSize: uploaded.fileSize,
          mimeType: uploaded.mimeType,
        });
      }

      // 🔥 2) 공지 생성 API 호출
      // ✅ 더 이상 coverImageUrl 안 보냄
      await noticeService.createNotice({
        title: form.title,
        content: form.content,
        is_important: form.isImportant,
        attachments:
          attachmentsPayload.length > 0 ? attachmentsPayload : undefined,
      });

      router.push('/mpspain/mpschamp');
    } catch (error) {
      console.error('Error creating notice:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          router.push('/form/login');
        } else if (error.response?.status === 400) {
          alert(
            error.response.data?.message ||
              '입력 데이터가 올바르지 않습니다. 다시 확인해주세요.',
          );
        } else {
          alert(error.message || '공지사항 작성 중 오류가 발생했습니다.');
        }
      } else {
        alert(
          error instanceof Error
            ? error.message
            : '공지사항 작성 중 오류가 발생했습니다.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen mt-20">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">
          공지사항 작성
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

          {/* 본문 (RichTextEditor) */}
          <RichTextEditor
            value={form.content}
            onChange={(html) =>
              setForm((prev) => ({ ...prev, content: html }))
            }
          />

          {/* 이미지 + 첨부파일 영역 */}
          <div className="flex gap-6 flex-col md:flex-row">
            {/* 🔥 왼쪽: 이미지 첨부 (다운로드용) */}
            <div className="flex-1">
              <CoverImageUploader
                image={form.image}
                onChange={(file) =>
                  setForm((prev) => ({ ...prev, image: file }))
                }
              />
            </div>

            {/* 오른쪽: 일반 첨부파일 */}
            <div className="flex-1">
              <AttachmentsUploader
                files={form.attachments}
                onChange={(files) =>
                  setForm((prev) => ({ ...prev, attachments: files }))
                }
              />
            </div>
          </div>

          {/* 중요 여부 + 버튼들 */}
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
                onClick={() => router.push('/mpspain/mpschamp')}
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

export default CreateNoticePage;
