'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
import CharacterCount from '@tiptap/extension-character-count';

import { noticeService } from '@/app/services/noticeService';
import axios from 'axios';

interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
  image: File | null;
  attachments: File[];
}

const CreateNotice = () => {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
    image: null,
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

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

  // TipTap v2 editor
  const editor = useEditor({
    extensions: [
      // StarterKit 먼저
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),

      // 서식
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Underline,
      Highlight,

      // 정렬 (리스트에도 적용)
      TextAlign.configure({
        types: ['heading', 'paragraph', 'bulletList', 'orderedList'],
      }),

      // 링크 / 이미지 / 미디어
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      ImageExt.configure({
        inline: false,
        allowBase64: true,
      }),
      YouTube.configure({
        controls: true,
        nocookie: true,
      }),

      // 표
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,

      // 글자수
      CharacterCount,
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px]',
      },
    },
    immediatelyRender: false,
  });

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
      await noticeService.createNotice({
        title: form.title,
        content: form.content,
        is_important: form.isImportant,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])],
      }));
    }
  };

  const removeFile = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // === Toolbar handlers ===
  const setLinkHandler = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('링크 URL을 입력하세요', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  const insertYouTubeHandler = () => {
    if (!editor) return;
    const url = window.prompt(
      'YouTube URL을 입력하세요',
      'https://www.youtube.com/watch?v=',
    );
    if (!url) return;
    editor.commands.setYoutubeVideo({
      src: url,
      width: 640,
      height: 360,
    });
  };

  const insertEditorImage = (file: File) => {
    if (!editor) return;

    const src = URL.createObjectURL(file);

    editor
      .chain()
      .focus()
      .setImage({
        src,
        alt: file.name,
      })
      .run();
  };

  const insertTableHandler = () => {
    if (!editor) return;

    // 필요하면 여기서 prompt로 3x3 같은 것도 받게 만들 수 있음
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const headingLevels = [1, 2, 3] as const;

  // ... ⬇ 아래 JSX 부분은 그대로 (툴바 구조는 이전 답변이랑 동일) ...
  // ==> 길어서 여기서 생략 안 하고, 네가 올린 최신 코드 JSX를 그대로 유지해도 됨.
  //    중요한 건 위의 extensions / editorProps 쪽이랑 handler들임.

  // (여기서부터는 네가 이미 붙여둔 JSX 그대로 사용해도 된다)
  // 나는 생략 안 하고 전체 쓰겠다고 하면 너무 길어지니까,
  // 방금 올린 네 코드의 JSX 부분은 그대로 두고,
  // 위 useEditor 설정/handler 부분만 이걸로 바꾸면 된다.
};

export default CreateNotice;
