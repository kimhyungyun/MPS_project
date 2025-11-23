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
      // ⭐ StarterKit을 맨 위에
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),

      // 서식 관련
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Underline,
      Highlight,

      // 정렬
      TextAlign.configure({
        types: ['heading', 'paragraph'],
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
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px]',
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

    console.log('Submitting form with user:', user);
    console.log('Form data:', {
      title: form.title,
      content: form.content,
      isImportant: form.isImportant,
      writerId: Number(user.mb_id),
    });

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

    // 현재는 blob URL → 에디터 안에서만 보임
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
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const headingLevels = [1, 2, 3] as const;

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
          <div className="group">
            <label
              htmlFor="content"
              className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200"
            >
              본문
            </label>

            {/* Toolbar */}
            <div className="mb-2 rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              {/* 1. 텍스트 스타일 */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`px-2 py-1 rounded font-semibold ${
                    editor?.isActive('bold')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`px-2 py-1 rounded italic ${
                    editor?.isActive('italic')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`px-2 py-1 rounded underline ${
                    editor?.isActive('underline')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={`px-2 py-1 rounded line-through ${
                    editor?.isActive('strike')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleHighlight().run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('highlight')
                      ? 'bg-yellow-300 text-black'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  HL
                </button>
              </div>

              {/* 작은 구분선 */}
              <span className="h-5 border-l border-gray-200" />

              {/* 2. Heading */}
              <div className="flex items-center gap-1">
                {headingLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .toggleHeading({ level })
                        .run()
                    }
                    className={`px-2 py-1 rounded ${
                      editor?.isActive('heading', { level })
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    H{level}
                  </button>
                ))}
              </div>

              <span className="h-5 border-l border-gray-200" />

              {/* 3. 정렬 */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign('left').run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive({ textAlign: 'left' })
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  좌
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign('center').run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive({ textAlign: 'center' })
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  중
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().setTextAlign('right').run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive({ textAlign: 'right' })
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  우
                </button>
              </div>

              <span className="h-5 border-l border-gray-200" />

              {/* 4. 리스트 / 블록 */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('bulletList')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('orderedList')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  1.
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('blockquote')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  ❝
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleCode().run()}
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('code')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {'</>'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor?.chain().focus().toggleCodeBlock().run()
                  }
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('codeBlock')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  코드
                </button>
              </div>

              <span className="h-5 border-l border-gray-200" />

              {/* 5. 링크 / 미디어 / 표 */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={setLinkHandler}
                  className={`px-2 py-1 rounded ${
                    editor?.isActive('link')
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  링크
                </button>

                <button
                  type="button"
                  onClick={insertYouTubeHandler}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                >
                  YT
                </button>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                >
                  Img
                </button>

                <button
                  type="button"
                  onClick={insertTableHandler}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                >
                  표
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    insertEditorImage(file);
                    e.target.value = '';
                  }}
                />
              </div>

              <span className="h-5 border-l border-gray-200" />

              {/* 6. Undo / Redo */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                >
                  ⟲
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                  className="px-2 py-1 rounded hover:bg-gray-200"
                >
                  ⟳
                </button>
              </div>
            </div>

            <div className="bg-white rounded-b-xl border border-gray-200 p-2">
              <EditorContent editor={editor} />
            </div>

            {/* 글자수 */}
            {editor && (
              <div className="mt-1 text-right text-xs text-gray-500">
                글자 수: {editor.storage.characterCount.characters()}
              </div>
            )}
          </div>

          {/* 이미지와 첨부파일 영역 (기존 로직 유지) */}
          <div className="flex gap-6">
            {/* 본문 이미지 (대표 이미지 용도) */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                본문 이미지
              </label>
              <div
                className={`flex justify-center items-center h-[140px] px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80'
                } shadow-sm hover:shadow-md`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files[0] && files[0].type.startsWith('image/')) {
                    setForm((prev) => ({ ...prev, image: files[0] }));
                  }
                }}
              >
                <div className="space-y-2 text-center">
                  {form.image ? (
                    <div className="relative">
                      <Image
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, image: null }))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-6 py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <span>본문 이미지 업로드</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setForm((prev) => ({
                                  ...prev,
                                  image: e.target.files![0],
                                }));
                              }
                            }}
                          />
                        </label>
                        <p className="pl-3 self-center">또는 드래그 앤 드롭</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF 등</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 첨부파일 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                첨부파일
              </label>
              <div
                className={`flex justify-center items-center h-[140px] px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  isFileDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80'
                } shadow-sm hover:shadow-md`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFileDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFileDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFileDragging(false);
                  const files = e.dataTransfer.files;
                  if (files) {
                    setForm((prev) => ({
                      ...prev,
                      attachments: [
                        ...prev.attachments,
                        ...Array.from(files),
                      ],
                    }));
                  }
                }}
              >
                <div className="space-y-2 text-center">
                  {form.attachments.length > 0 ? (
                    <div className="w-full">
                      <ul className="divide-y divide-gray-200">
                        {form.attachments.map((file, index) => (
                          <li
                            key={index}
                            className="py-2 flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-600 truncate max-w-[200px]">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            >
                              삭제
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-6 py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <span>파일 업로드</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-3 self-center">또는 드래그 앤 드롭</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, 이미지 파일 등</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
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

export default CreateNotice;
