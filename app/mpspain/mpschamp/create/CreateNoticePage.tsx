// app/mpspain/mpschamp/create/CreateNoticePage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { noticeService } from '@/app/services/noticeService';
import { uploadFileToServer } from '@/app/services/fileUpload';

import RichTextEditor from './RichTextEditor';
import AttachmentsUploader from './AttachmentsUploader';

interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
  attachments: File[];
}

const CreateNoticePage = () => {
  const router = useRouter();

  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 사용자 체크
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User data from localStorage:', userData);

      if (!userData || !userData.mb_id || !userData.mb_level) {
        console.error('Invalid user data:', userData);
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
    } catch (error) {
      console.error('Error parsing user data:', error);
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
      // 1) 첨부파일 S3 업로드
      let attachmentsPayload:
        | {
            fileName: string;
            fileUrl: string; // S3 key
            fileSize?: number;
            mimeType?: string;
          }[]
        | undefined = undefined;

      if (form.attachments.length > 0) {
        const results: {
          fileName: string;
          fileUrl: string;
          fileSize?: number;
          mimeType?: string;
        }[] = [];

        for (const file of form.attachments) {
          const uploaded = await uploadFileToServer(file);

          results.push({
            fileName: uploaded.fileName,
            fileUrl: uploaded.key, // DB에는 key만 저장
            fileSize: uploaded.fileSize,
            mimeType: uploaded.mimeType,
          });
        }

        attachmentsPayload = results;
      }

      // 2) 공지 생성 API 호출
      await noticeService.createNotice({
        title: form.title,
        content: form.content,
        // 🔥 여기만 snake_case로 매핑
        is_important: form.isImportant,
        attachments: attachmentsPayload,
      });

      router.push('/mpspain/mpschamp');
    } catch (error) {
      console.error('Error creating notice:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          router.push('/form/login');
        } else if (error.response?.status === 400) {
          console.error('Validation error:', error.response.data);
          alert(
            error.response.data.message ||
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

          {/* 본문 */}
          <RichTextEditor
            value={form.content}
            onChange={(html) =>
              setForm((prev) => ({ ...prev, content: html }))
            }
          />

          {/* 첨부파일 */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
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
