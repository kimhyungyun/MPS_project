'use client';

import { useState, useRef } from 'react';
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
import FontFamily from '@tiptap/extension-font-family';
import FontSize from './extensions/fontSize';
import ResizeImage from 'tiptap-extension-resize-image';

import styles from './CreateNotice.module.css';
import { uploadFileToServer } from '@/app/services/fileUpload';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Heading 버튼용
const headingLevels = [1, 2, 3] as const;

// 글꼴 목록
const fontFamilies = [
  { label: '기본', value: '' },
  { label: '돋움', value: 'Dotum, sans-serif' },
  { label: '굴림', value: 'Gulim, sans-serif' },
  { label: '바탕', value: 'Batang, serif' },
  { label: '맑은 고딕', value: '"Malgun Gothic", sans-serif' },
  { label: '나눔고딕', value: '"Nanum Gothic", sans-serif' },
  { label: '나눔명조', value: '"Nanum Myeongjo", serif' },
];

// 폰트 크기 목록
const fontSizes = [
  { label: '10pt', value: '10px' },
  { label: '12pt', value: '12px' },
  { label: '14pt', value: '14px' },
  { label: '16pt', value: '16px' },
  { label: '18pt', value: '18px' },
  { label: '20pt', value: '20px' },
  { label: '22pt', value: '22px' },
  { label: '24pt', value: '24px' },
  { label: '28pt', value: '28px' },
  { label: '32pt', value: '32px' },
  { label: '40pt', value: '40px' },
  { label: '52pt', value: '52px' },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [tableHoverSize, setTableHoverSize] = useState({ rows: 0, cols: 0 });
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      // 기본
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),

      // 텍스트 스타일
      TextStyle,
      FontFamily,
      FontSize,
      Color.configure({ types: ['textStyle'] }),
      Underline,
      Highlight,

      // 정렬
      TextAlign.configure({
        types: ['heading', 'paragraph', 'bulletList', 'orderedList'],
      }),

      // 링크 / 이미지 / 유튜브
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

      // 표
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,

      // 글자 수
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px]',
      },
    },
    immediatelyRender: false,
  });

  // 링크 설정
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

  // 유튜브 삽입
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

  // 이미지 삽입 (본문) – S3 업로드 후 URL 삽입
  const insertEditorImage = async (file: File) => {
    if (!editor) return;

    // 1) S3 업로드
    const uploaded = await uploadFileToServer(file); // { key, fileName, ... }

    // 2) S3 공개 URL 만들기
    const bucket =
      process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'mpsnotices';
    const region =
      process.env.NEXT_PUBLIC_S3_REGION || 'ap-northeast-2';

    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${uploaded.key}`;

    // 3) 에디터에 삽입
    editor
      .chain()
      .focus()
      .setImage({
        src: s3Url,
        alt: uploaded.fileName,
      })
      .insertContent('<p></p>')
      .run();
  };

  // 표 삽입
  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  // 표 삭제
  const deleteTableHandler = () => {
    if (!editor) return;
    editor.chain().focus().deleteTable().run();
  };

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-xl bg-white p-4 text-sm text-gray-400">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
        본문
      </label>

      {/* ───── 툴바 ───── */}
      <div className="mb-2 rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm relative">
        {/* 1) 글꼴 / 크기 */}
        <div className="flex items-center gap-2">
          {/* 글꼴 */}
          <select
            className="border border-gray-200 rounded px-2 py-1 bg-white text-xs sm:text-sm"
            value={editor.getAttributes('textStyle').fontFamily || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                editor.chain().focus().unsetMark('textStyle').run();
              } else {
                editor.chain().focus().setFontFamily(value).run();
              }
            }}
          >
            {fontFamilies.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* 글자 크기 */}
          <select
            className="border border-gray-200 rounded px-2 py-1 bg-white text-xs sm:text-sm"
            value={editor.getAttributes('textStyle').fontSize || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                editor.chain().focus().unsetFontSize().run();
              } else {
                editor.chain().focus().setFontSize(value).run();
              }
            }}
          >
            <option value="">크기</option>
            {fontSizes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <span className="h-5 border-l border-gray-200" />

        {/* 2) 굵기/기울임/밑줄/취소선/하이라이트 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded font-semibold ${
              editor.isActive('bold')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded italic ${
              editor.isActive('italic')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded underline ${
              editor.isActive('underline')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 rounded line-through ${
              editor.isActive('strike')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            S
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('highlight')
                ? 'bg-yellow-300 text-black'
                : 'hover:bg-gray-200'
            }`}
          >
            HL
          </button>
        </div>

        <span className="h-5 border-l border-gray-200" />

        {/* 3) Heading */}
        <div className="flex items-center gap-1">
          {headingLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level }).run()
              }
              className={`px-2 py-1 rounded ${
                editor.isActive('heading', { level })
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              H{level}
            </button>
          ))}
        </div>

        <span className="h-5 border-l border-gray-200" />

        {/* 4) 정렬 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-2 py-1 rounded ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            좌
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setTextAlign('center').run()
            }
            className={`px-2 py-1 rounded ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            중
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-2 py-1 rounded ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            우
          </button>
        </div>

        <span className="h-5 border-l border-gray-200" />

        {/* 5) 리스트 / 블록 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('bulletList')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('orderedList')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('blockquote')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            ❝
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('code')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            {'</>'}
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive('codeBlock')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            코드
          </button>
        </div>

        <span className="h-5 border-l border-gray-200" />

        {/* 6) 링크 / 미디어 / 표 */}
        <div className="flex items-center gap-1 relative">
          {/* 링크 */}
          <button
            type="button"
            onClick={setLinkHandler}
            className={`px-2 py-1 rounded ${
              editor.isActive('link')
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200'
            }`}
          >
            링크
          </button>

          {/* 유튜브 */}
          <button
            type="button"
            onClick={insertYouTubeHandler}
            className="px-2 py-1 rounded hover:bg-gray-200"
          >
            YT
          </button>

          {/* 이미지 */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="px-2 py-1 rounded hover:bg-gray-200"
          >
            Img
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                await insertEditorImage(file);
              } finally {
                e.target.value = '';
              }
            }}
          />

          {/* 표 + 그리드 픽커 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTablePickerOpen((prev) => !prev)}
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              표
            </button>

            {isTablePickerOpen && (
              <div className="absolute z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <div className="text-xs text-gray-600 mb-1 text-right">
                  {tableHoverSize.rows > 0 && tableHoverSize.cols > 0
                    ? `${tableHoverSize.rows} × ${tableHoverSize.cols}`
                    : '표 크기 선택'}
                </div>
                <div className="grid grid-cols-8 gap-0.5 w-[168px]">
                  {Array.from({ length: 64 }).map((_, index) => {
                    const row = Math.floor(index / 8) + 1;
                    const col = (index % 8) + 1;
                    const active =
                      tableHoverSize.rows >= row &&
                      tableHoverSize.cols >= col;

                    return (
                      <div
                        key={index}
                        onMouseEnter={() =>
                          setTableHoverSize({ rows: row, cols: col })
                        }
                        onClick={() => {
                          insertTable(row, col);
                          setIsTablePickerOpen(false);
                        }}
                        className={`h-5 w-5 border rounded-sm cursor-pointer ${
                          active
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300 hover:bg-gray-100'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <span className="h-5 border-l border-gray-200" />

        {/* 7) Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="px-2 py-1 rounded hover:bg-gray-200"
          >
            ⟲
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded hover:bg-gray-200"
          >
            ⟳
          </button>
        </div>

        {/* 표 삭제 버튼: 오른쪽 고정 */}
        {editor.isActive('table') && (
          <button
            type="button"
            onClick={deleteTableHandler}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded hover:bg-red-50 text-red-500 text-xs sm:text-sm"
          >
            표 삭제
          </button>
        )}
      </div>

      {/* ───── 에디터 본문 ───── */}
      <div className="bg-white rounded-b-xl border border-gray-200 p-2">
        <EditorContent editor={editor} className={styles.tiptap} />
      </div>

      {/* 글자 수 */}
      <div className="mt-1 text-right text-xs text-gray-500">
        글자 수: {editor.storage.characterCount.characters()}
      </div>
    </div>
  );
};

export default RichTextEditor;
