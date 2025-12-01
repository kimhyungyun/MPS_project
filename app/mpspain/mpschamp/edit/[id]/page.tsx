// app/mpspain/mpschamp/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { noticeService, Notice } from '@/app/services/noticeService';

import { uploadFileToServer } from '@/app/services/fileUpload';
import RichTextEditor from '../../create/RichTextEditor';
import CoverImageUploader from '../../create/CoverImageUploader';
import AttachmentsUploader from '../../create/AttachmentsUploader';

interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
  coverImageFile: File | null;      // 새로 선택한 커버 이미지
  coverImageUrl: string | null;     // 기존에 DB에 저장된 커버 URL
  attachments: File[];              // 새로 추가할 첨부파일
  existingAttachments: any[];       // 이미 DB에 있는 첨부파일 (표시용)
}

const EditNotice = () => {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
    coverImageFile: null,
    coverImageUrl: null,
    attachments: [],
    existingAttachments: [],
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─────────────────────  데이터 로드  ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        if (!userData || !userData.mb_id) {
          alert('로그인이 필요합니다.');
          router.push('/form/login');
          return;
        }

        const notice: Notice = await noticeService.getNotice(id);

        const isAdmin = Number(userData.mb_level) >= 8;
        const isWriter = (userData as any).id === (notice as any).writer_id;
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
          coverImageFile: null,
          coverImageUrl: (notice as any).coverImageUrl || null,
          attachments: [],
          existingAttachments: (notice as any).attachments || [],
        });
      } catch (err) {
        console.error('Error fetching notice:', err);
        router.push('/mpspain/mpschamp');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  // ─────────────────────  저장  ─────────────────────
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
      // 1) 커버 이미지 처리
      let coverImageUrl = form.coverImageUrl || undefined;
      if (form.coverImageFile) {
        const uploaded = await uploadFileToServer(form.coverImageFile);
        const bucket =
          process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'mpsnotices';
        const region =
          process.env.NEXT_PUBLIC_S3_REGION || 'ap-northeast-2';

        coverImageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${uploaded.key}`;
      }

      // 2) 새로 추가된 첨부파일 업로드
      let newAttachments:
        | {
            fileName: string;
            fileUrl: string;
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
            fileUrl: uploaded.key, // DB엔 key만 저장
            fileSize: uploaded.fileSize,
            mimeType: uploaded.mimeType,
          });
        }

        newAttachments = results;
      }

      // 3) 공지 수정 API 호출
      await noticeService.updateNotice(id, {
        title: form.title,
        content: form.content,
        isImportant: form.isImportant,    // ✅ camelCase 로
        coverImageUrl,
        attachments: newAttachments,
      });


      router.push(`/mpspain/mpschamp/${id}`);
    } catch (err) {
      console.error('Error updating notice:', err);
      alert('공지사항 수정 중 오류가 발생했습니다.');
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

          {/* 본문 에디터 (작성 때랑 동일) */}
          <RichTextEditor
            value={form.content}
            onChange={(html) =>
              setForm((prev) => ({ ...prev, content: html }))
            }
          />

          {/* 본문 이미지 + 첨부파일 */}
          <div className="flex gap-6 flex-col md:flex-row">
            {/* 본문 이미지 (커버) */}
            <div className="flex-1 space-y-2">
              {/* 기존 커버 이미지가 있고 새 파일을 아직 안 골랐을 때 미리보기 */}
              {form.coverImageUrl && !form.coverImageFile && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">
                    현재 등록된 본문 이미지
                  </p>
                  <img
                    src={form.coverImageUrl}
                    alt="현재 본문 이미지"
                    className="w-full max-h-[200px] object-contain rounded-lg border border-gray-100"
                  />
                </div>
              )}
              <CoverImageUploader
                image={form.coverImageFile}
                onChange={(file) =>
                  setForm((prev) => ({
                    ...prev,
                    coverImageFile: file,
                  }))
                }
              />
            </div>

            {/* 새로 추가할 첨부파일 */}
            <div className="flex-1 space-y-3">
              <AttachmentsUploader
                files={form.attachments}
                onChange={(files) =>
                  setForm((prev) => ({ ...prev, attachments: files }))
                }
              />

              {/* 이미 DB에 있는 첨부파일 목록 (읽기 전용 표시) */}
              {form.existingAttachments.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-semibold mb-1">기존 첨부파일</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {form.existingAttachments.map((file: any) => (
                      <li key={file.id}>{file.fileName}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 mt-1">
                    (지금 코드는 기존 첨부는 유지하고 새 파일만 추가합니다.)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 중요 여부 + 버튼 */}
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
                onClick={() => router.back()}
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

export default EditNotice;
