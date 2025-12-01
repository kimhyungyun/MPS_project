'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { noticeService, Notice } from '@/app/services/noticeService';

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

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 로컬스토리지에서 유저 정보 가져오기
        const raw = localStorage.getItem('user');
        if (!raw) {
          router.push('/form/login');
          return;
        }

        const parsed = JSON.parse(raw || '{}');

        // mb_id / mb_level 없는 경우도 로그인 안 된 걸로 처리
        if (!parsed.mb_id || parsed.mb_level == null) {
          router.push('/form/login');
          return;
        }

        const level = Number(parsed.mb_level);
        if (Number.isNaN(level)) {
          router.push('/form/login');
          return;
        }

        const userData = { ...parsed, mb_level: level };
        setUser(userData);

        // 🔹 공지 조회
        const notice: Notice = await noticeService.getNotice(id);

        // 🔹 권한 체크: 관리자이거나, 작성자일 때만 수정 가능
        const isAdmin = userData.mb_level >= 8;
        const isWriter =
          userData.mb_id === (notice as any).user?.mb_id ||
          userData.id === (notice as any).writer_id;

        if (!isAdmin && !isWriter) {
          alert('수정 권한이 없습니다.');
          router.push('/mpspain/mpschamp');
          return;
        }

        // 🔹 isImportant 매핑 (snake_case / camelCase 모두 대응)
        const isImportant =
          (notice as any).isImportant ??
          (notice as any).is_important ??
          false;

        setForm({
          title: notice.title,
          content: notice.content,
          isImportant,
        });

        if (editor) {
          editor.commands.setContent(notice.content);
        }
      } catch (error) {
        console.error('Error fetching notice:', error);
        router.push('/mpspain/mpschamp');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, editor]);

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
    <section className="w-full px-4 lg:px-24 py-12 bg-gray-100 mt-10">
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <div className="border border-gray-300 rounded-lg">
              <EditorContent editor={editor} className="prose max-w-none p-4" />
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isImportant}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isImportant: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                중요 공지로 설정
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditNotice;
