// app/mpspain/mpschamp/edit/[id]/page.tsx (혹은 현재 EditNotice 경로에 맞게)
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { noticeService, Notice } from '@/app/services/noticeService';
import RichTextEditor from '../../create/RichTextEditor';



interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
}

const EditNotice = () => {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 공지 + 사용자 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // 로그인 안되어 있으면 로그인 페이지로
        if (!userData || !userData.mb_id) {
          alert('로그인이 필요합니다.');
          router.push('/form/login');
          return;
        }

        const notice: Notice = await noticeService.getNotice(id);

        // 권한 체크 (관리자 or 작성자)
        const isAdmin = Number(userData.mb_level) >= 8;
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

        // 🔥 기존 내용 세팅
        setForm({
          title: notice.title,
          content: notice.content,
          isImportant,
        });
      } catch (error) {
        console.error('Error fetching notice:', error);
        router.push('/mpspain/mpschamp');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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
      await noticeService.updateNotice(id, {
        title: form.title,
        content: form.content,
        isImportant: form.isImportant,
      });

      // 수정 후 상세 페이지로 이동
      router.push(`/mpspain/mpschamp/${id}`);
    } catch (error) {
      console.error('Error updating notice:', error);
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

          {/* 본문 – 작성 페이지랑 같은 리치 텍스트 에디터 */}
          <RichTextEditor
            value={form.content}
            onChange={(html) =>
              setForm((prev) => ({ ...prev, content: html }))
            }
          />

          {/* 중요 여부 */}
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
