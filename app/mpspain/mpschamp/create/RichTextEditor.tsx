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

import styles from './CreateNotice.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [tableHoverSize, setTableHoverSize] = useState({ rows: 0, cols: 0 });
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyle,
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
      YouTube.configure({
        controls: true,
        nocookie: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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

  const headingLevels = [1, 2, 3] as const;

  // Handlers
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

  const insertTable = (rows: number, cols: number) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

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

      {/* Toolbar */}
      <div className="mb-2 rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        {/* 1. 텍스트 스타일 */}
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

        {/* 2. Heading */}
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

        {/* 3. 정렬 */}
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
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
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

        {/* 4. 리스트 / 블럭 */}
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

        {/* 5. 링크 / 미디어 / 표 */}
        <div className="flex items-center gap-1 relative">
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

          {/* 표 버튼 + 그리드 픽커 */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsTablePickerOpen((prev) => !prev)
              }
              className="px-2 py-1 rounded hover:bg-gray-200"
            >
              표
            </button>

            {isTablePickerOpen && (
              <div className="absolute z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <div className="text-xs text-gray-600 mb-1 text-right">
                  {tableHoverSize.rows > 0 && tableHoverSize.cols > 0
                    ? `${tableHoverSize.rows} x ${tableHoverSize.cols}`
                    : '표 크기 선택'}
                </div>
                <div className="grid grid-cols-8 gap-0.5">
                  {Array.from({ length: 8 }).map((_, rowIndex) =>
                    Array.from({ length: 8 }).map((__, colIndex) => {
                      const row = rowIndex + 1;
                      const col = colIndex + 1;
                      const active =
                        tableHoverSize.rows >= row &&
                        tableHoverSize.cols >= col;

                      return (
                        <div
                          key={`${row}-${col}`}
                          onMouseEnter={() =>
                            setTableHoverSize({ rows: row, cols: col })
                          }
                          onClick={() => {
                            insertTable(row, col);
                            setIsTablePickerOpen(false);
                          }}
                          className={`w-5 h-5 border rounded-sm cursor-pointer ${
                            active
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-gray-300 hover:bg-gray-100'
                          }`}
                        />
                      );
                    }),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 표 삭제 버튼: 표 안에 있을 때만 */}
          {editor.isActive('table') && (
            <button
              type="button"
              onClick={deleteTableHandler}
              className="px-2 py-1 rounded hover:bg-red-50 text-red-500"
            >
              표 삭제
            </button>
          )}

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
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 p-2">
        <EditorContent editor={editor} className={styles.tiptap} />
      </div>

      {/* 글자수 */}
      <div className="mt-1 text-right text-xs text-gray-500">
        글자 수: {editor.storage.characterCount.characters()}
      </div>
    </div>
  );
};

export default RichTextEditor;
